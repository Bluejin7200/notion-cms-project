import { NextResponse, type NextRequest } from "next/server"

import { decodeSession, SESSION_COOKIE, SESSION_HINT_COOKIE } from "@/lib/auth/session"

// 인증이 필요한 경로와 로그인 사용자가 접근할 필요 없는 경로
const AUTH_PAGES = ["/login", "/signup"]

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value)

  // 미인증 사용자가 대시보드 접근 → 로그인 후 원래 경로로 돌아오도록 next 전달
  if (pathname.startsWith("/dashboard") && !session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname + search)
    return clearStaleCookies(request, NextResponse.redirect(loginUrl))
  }

  // 로그인 사용자가 로그인/회원가입 페이지 접근 → 대시보드로
  if (AUTH_PAGES.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return session ? NextResponse.next() : clearStaleCookies(request, NextResponse.next())
}

// 세션이 만료·위조된 경우 남아 있는 쿠키를 정리 (헤더가 잘못된 로그인 상태를 표시하지 않도록)
function clearStaleCookies(request: NextRequest, response: NextResponse) {
  for (const name of [SESSION_COOKIE, SESSION_HINT_COOKIE]) {
    if (request.cookies.has(name)) response.cookies.delete(name)
  }
  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}
