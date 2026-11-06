"use client"

import { ErrorFallback } from "@/components/common/error-fallback"

// 대시보드 오류 경계: 사이드바·헤더는 유지하고 본문만 오류 화면으로 교체
export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorFallback error={error} retry={retry} homeHref="/dashboard" className="flex-1" />
}
