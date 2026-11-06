"use client"

import { ErrorFallback } from "@/components/common/error-fallback"

// 전역 오류 경계 (루트 레이아웃 아래 모든 페이지)
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorFallback error={error} retry={retry} className="min-h-svh" />
}
