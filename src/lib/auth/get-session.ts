import { cookies } from "next/headers"

import { decodeSession, SESSION_COOKIE } from "@/lib/auth/session"

// 서버 컴포넌트/Route Handler에서 현재 세션 조회
export async function getSession() {
  const cookieStore = await cookies()
  return decodeSession(cookieStore.get(SESSION_COOKIE)?.value)
}
