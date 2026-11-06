import type { Metadata } from "next"
import Link from "next/link"

import { LoginForm } from "@/components/auth/login-form"
import { AuthCard } from "@/components/layout/auth-card"
import { getSafeRedirect } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "로그인",
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  // proxy가 붙여준 next 파라미터 (배열이면 첫 값만 사용)
  const { next } = await searchParams
  const redirectTo = getSafeRedirect(Array.isArray(next) ? next[0] : next)

  return (
    <AuthCard
      title="로그인"
      description="이메일과 비밀번호를 입력해주세요."
      footer={
        <p>
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
            회원가입
          </Link>
        </p>
      }
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthCard>
  )
}
