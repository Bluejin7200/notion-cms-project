import { apiPost } from "@/lib/api/client"
import type { Session } from "@/lib/auth/session"
import type { LoginValues, SignupValues } from "@/lib/validations/auth"

// 인증 API 호출 함수 (실제 인증 서비스로 교체 시 이 파일만 수정)

type UserResponse = { user: Session }

export function login(values: LoginValues) {
  return apiPost<UserResponse>("/api/auth/login", values)
}

export function signup(values: SignupValues) {
  return apiPost<UserResponse>("/api/auth/signup", values)
}

export function logout() {
  return apiPost<{ ok: boolean }>("/api/auth/logout")
}
