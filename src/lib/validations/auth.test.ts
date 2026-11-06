import { describe, expect, it } from "vitest"

import { loginSchema, signupSchema } from "@/lib/validations/auth"

// 첫 번째 오류 메시지만 추출
function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues[0]?.message
}

describe("loginSchema", () => {
  it("올바른 이메일과 비밀번호면 통과한다", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "x", remember: true })
    expect(result.success).toBe(true)
  })

  it("이메일 형식이 아니면 실패한다", () => {
    const result = loginSchema.safeParse({ email: "user", password: "x", remember: false })
    expect(firstError(result)).toBe("올바른 이메일 형식이 아닙니다.")
  })

  it("비밀번호가 비어 있으면 실패한다", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "", remember: false })
    expect(firstError(result)).toBe("비밀번호를 입력해주세요.")
  })
})

describe("signupSchema", () => {
  const valid = {
    name: "홍길동",
    email: "user@example.com",
    password: "abcd1234",
    confirmPassword: "abcd1234",
    terms: true,
  }

  it("모든 조건을 만족하면 통과한다", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true)
  })

  it.each([
    ["8자 미만", "abc123", "비밀번호는 8자 이상이어야 합니다."],
    ["영문 없음", "12345678", "영문을 1자 이상 포함해야 합니다."],
    ["숫자 없음", "abcdefgh", "숫자를 1자 이상 포함해야 합니다."],
  ])("비밀번호 규칙 위반(%s)이면 실패한다", (_, password, message) => {
    const result = signupSchema.safeParse({ ...valid, password, confirmPassword: password })
    expect(firstError(result)).toBe(message)
  })

  it("비밀번호 확인이 다르면 confirmPassword 필드에 오류가 난다", () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: "abcd12345" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"])
    expect(firstError(result)).toBe("비밀번호가 일치하지 않습니다.")
  })

  it("약관에 동의하지 않으면 실패한다", () => {
    const result = signupSchema.safeParse({ ...valid, terms: false })
    expect(firstError(result)).toBe("이용약관에 동의해주세요.")
  })

  it("이름이 공백뿐이면 실패한다", () => {
    const result = signupSchema.safeParse({ ...valid, name: "   " })
    expect(firstError(result)).toBe("이름을(를) 입력해주세요.")
  })
})
