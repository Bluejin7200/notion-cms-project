import type { Metadata } from "next"
import Link from "next/link"

import { SignupForm } from "@/components/auth/signup-form"
import { AuthCard } from "@/components/layout/auth-card"

export const metadata: Metadata = {
  title: "회원가입",
}

export default function SignupPage() {
  return (
    <AuthCard
      title="회원가입"
      description="몇 가지 정보만 입력하면 바로 시작할 수 있습니다."
      footer={
        <p>
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            로그인
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthCard>
  )
}
