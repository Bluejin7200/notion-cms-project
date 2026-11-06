import { createHmac, timingSafeEqual } from "node:crypto"

import { z } from "zod"

// 세션 쿠키: base64url(JSON) + "." + HMAC-SHA256 서명
// 서명이 맞지 않거나 만료(exp)된 쿠키는 거부하므로 사용자가 값을 위조·연장할 수 없음
// (서버 전용: proxy·Route Handler·서버 컴포넌트에서만 사용)

export const SESSION_COOKIE = "session"

// 로그인 여부 힌트 쿠키 (httpOnly 아님, 민감 정보 없음): 정적 페이지 헤더가 즉시 버튼을 고르는 용도
// 실제 권한 확인은 항상 서명된 SESSION_COOKIE로 함
export const SESSION_HINT_COOKIE = "logged_in"

/** 세션 유지 기간 (초) */
export const SESSION_MAX_AGE = {
  default: 60 * 60 * 24, // 1일
  remember: 60 * 60 * 24 * 30, // 30일
}

const sessionSchema = z.object({
  name: z.string(),
  email: z.email(),
})

export type Session = z.infer<typeof sessionSchema>

const payloadSchema = z.object({
  user: sessionSchema,
  // 만료 시각 (Unix 초)
  exp: z.number(),
})

// 개발·테스트 환경에서만 쓰는 기본 키 (운영에서는 SESSION_SECRET 필수)
const DEV_SECRET = "dev-only-insecure-session-secret-change-me"

function getSecret() {
  const secret = process.env.SESSION_SECRET
  if (secret && secret.length >= 32) return secret
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET 환경변수(32자 이상)를 설정해주세요. 예: openssl rand -base64 32")
  }
  return DEV_SECRET
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url")
}

/** 세션을 서명된 쿠키 값으로 변환 */
export function encodeSession(session: Session, maxAge = SESSION_MAX_AGE.default, now = Date.now()) {
  const payload = Buffer.from(
    JSON.stringify({ user: session, exp: Math.floor(now / 1000) + maxAge })
  ).toString("base64url")
  return `${payload}.${sign(payload)}`
}

/** 쿠키 값을 검증해 세션으로 복원 (서명 불일치·만료·형식 오류면 null) */
export function decodeSession(value: string | undefined, now = Date.now()): Session | null {
  if (!value) return null
  const [payload, signature, ...rest] = value.split(".")
  if (!payload || !signature || rest.length > 0) return null

  // 길이가 다르면 timingSafeEqual이 예외를 던지므로 먼저 비교 (타이밍 공격 방지용 상수 시간 비교)
  const expected = Buffer.from(sign(payload))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null

  try {
    const json: unknown = JSON.parse(Buffer.from(payload, "base64url").toString())
    const result = payloadSchema.safeParse(json)
    if (!result.success || result.data.exp * 1000 <= now) return null
    return result.data.user
  } catch {
    return null
  }
}

/** 로그인 후 이동할 경로 검증 (외부 URL로의 오픈 리다이렉트 방지) */
export function getSafeRedirect(next: string | null | undefined, fallback = "/dashboard") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback
  // 브라우저가 "/"로 바꾸는 백슬래시, 파싱 시 제거되는 탭·개행 등 제어문자 차단 ("/\evil.com" 우회 방지)
  if (/[\\\u0000-\u001f]/.test(next)) return fallback
  // 임의 origin 기준으로 해석했을 때 origin이 바뀌면 외부 URL
  const base = "http://localhost"
  try {
    if (new URL(next, base).origin !== base) return fallback
  } catch {
    return fallback
  }
  return next
}
