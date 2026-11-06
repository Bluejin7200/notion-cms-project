"use client"

import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { useLoggedIn } from "@/hooks/use-logged-in"
import { cn } from "@/lib/utils"

// 데스크톱 헤더의 로그인 상태별 버튼 (헤더를 정적으로 유지하려고 클라이언트에서 힌트 쿠키로 확인)
export function HeaderAuth() {
  const loggedIn = useLoggedIn()

  // cva는 className을 단순 연결하므로 display 충돌 방지를 위해 cn으로 병합
  if (loggedIn) {
    return (
      <Link href="/dashboard" className={cn(buttonVariants(), "hidden md:inline-flex")}>
        대시보드
      </Link>
    )
  }

  return (
    <>
      <Link
        href="/login"
        className={cn(buttonVariants({ variant: "ghost" }), "hidden md:inline-flex")}
      >
        로그인
      </Link>
      <Link href="/signup" className={cn(buttonVariants(), "hidden md:inline-flex")}>
        회원가입
      </Link>
    </>
  )
}
