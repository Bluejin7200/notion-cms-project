"use client"

import Link from "next/link"
import { TriangleAlert } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { Button, buttonVariants } from "@/components/ui/button"

type ErrorFallbackProps = {
  error: Error & { digest?: string }
  retry: () => void
  // "홈으로" 등 보조 이동 경로
  homeHref?: string
  className?: string
}

// error.tsx 공용 오류 화면: 다시 시도 + 홈 이동, 운영 환경에서는 digest만 노출
export function ErrorFallback({ error, retry, homeHref = "/", className }: ErrorFallbackProps) {
  return (
    <EmptyState
      icon={TriangleAlert}
      title="문제가 발생했습니다."
      description={
        error.digest
          ? `잠시 후 다시 시도해주세요. (오류 코드: ${error.digest})`
          : "잠시 후 다시 시도해주세요."
      }
      className={className}
      action={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => retry()}>다시 시도</Button>
          <Link href={homeHref} className={buttonVariants({ variant: "outline" })}>
            홈으로
          </Link>
        </div>
      }
    />
  )
}
