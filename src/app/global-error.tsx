"use client"

import "./globals.css"

// 루트 레이아웃 자체에서 발생한 오류용 (자체 html/body 필요, Provider 없이 동작해야 함)
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="ko">
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center antialiased">
        <title>오류가 발생했습니다</title>
        <h1 className="text-2xl font-bold">문제가 발생했습니다.</h1>
        <p className="text-muted-foreground">
          {error.digest ? `오류 코드: ${error.digest}` : "잠시 후 다시 시도해주세요."}
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          다시 시도
        </button>
      </body>
    </html>
  )
}
