import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Container } from "@/components/layout/container"
import { buttonVariants } from "@/components/ui/button"

// 404 페이지
export default function NotFound() {
  return (
    <Container className="flex min-h-svh flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-6xl font-bold tracking-tight">404</p>
      <p className="text-muted-foreground">요청하신 페이지를 찾을 수 없습니다.</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        <ArrowLeft /> 홈으로 돌아가기
      </Link>
    </Container>
  )
}
