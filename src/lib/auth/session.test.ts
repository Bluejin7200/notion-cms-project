import { describe, expect, it } from "vitest"

import { decodeSession, encodeSession, getSafeRedirect } from "@/lib/auth/session"

const user = { name: "테스터", email: "tester@example.com" }
const NOW = new Date("2026-10-05T12:00:00Z").getTime()

// 쿠키 값의 payload 부분만 바꿔치기 (서명은 그대로) → 위조 시도 흉내
function tamper(cookie: string, payload: object) {
  const [, signature] = cookie.split(".")
  return `${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${signature}`
}

describe("서명된 세션 쿠키", () => {
  it("인코딩한 세션을 그대로 복원한다", () => {
    expect(decodeSession(encodeSession(user, 60, NOW), NOW)).toEqual(user)
  })

  it("payload와 서명 두 부분으로 구성된다", () => {
    expect(encodeSession(user, 60, NOW).split(".")).toHaveLength(2)
  })

  it("payload를 바꾸면(다른 사용자로 위조) 거부한다", () => {
    const forged = tamper(encodeSession(user, 60, NOW), {
      user: { name: "관리자", email: "admin@example.com" },
      exp: Math.floor(NOW / 1000) + 60,
    })
    expect(decodeSession(forged, NOW)).toBeNull()
  })

  it("만료 시각을 늘리는 위조도 거부한다", () => {
    const forged = tamper(encodeSession(user, 60, NOW), { user, exp: Math.floor(NOW / 1000) + 999_999 })
    expect(decodeSession(forged, NOW)).toBeNull()
  })

  it("만료된 세션은 거부한다", () => {
    const cookie = encodeSession(user, 60, NOW)
    expect(decodeSession(cookie, NOW + 59_000)).toEqual(user)
    expect(decodeSession(cookie, NOW + 60_000)).toBeNull()
  })

  it.each([
    ["값 없음", undefined],
    ["서명 없음", Buffer.from(JSON.stringify({ user, exp: 9_999_999_999 })).toString("base64url")],
    ["점이 너무 많음", "a.b.c"],
    ["잘못된 서명", "eyJ9.invalid-signature"],
  ])("잘못된 쿠키(%s)는 null을 반환한다", (_, value) => {
    expect(decodeSession(value, NOW)).toBeNull()
  })
})

describe("getSafeRedirect", () => {
  it("내부 경로는 그대로 사용한다", () => {
    expect(getSafeRedirect("/dashboard/orders?page=2")).toBe("/dashboard/orders?page=2")
  })

  it.each([
    ["값 없음", null],
    ["외부 URL", "https://evil.com"],
    ["프로토콜 상대 URL", "//evil.com"],
    ["상대 경로", "dashboard"],
    ["백슬래시 우회", "/\\evil.com"],
    ["탭 우회", "/\t/evil.com"],
    ["개행 우회", "/\n/evil.com"],
    ["캐리지리턴 우회", "/\r/evil.com"],
    ["널 문자", "/\u0000evil.com"],
  ])("안전하지 않은 값(%s)은 기본 경로로 바꾼다", (_, next) => {
    expect(getSafeRedirect(next)).toBe("/dashboard")
  })

  it("퍼센트 인코딩된 경로는 같은 origin 경로이므로 그대로 사용한다", () => {
    expect(getSafeRedirect("/%5Cevil.com")).toBe("/%5Cevil.com")
  })

  it("기본 경로를 지정할 수 있다", () => {
    expect(getSafeRedirect(undefined, "/")).toBe("/")
  })
})
