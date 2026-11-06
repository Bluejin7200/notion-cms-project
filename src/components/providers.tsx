"use client"

import { useEffect } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { MotionConfig } from "motion/react"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getQueryClient } from "@/lib/query-client"
import { usePreferencesStore } from "@/stores/preferences-store"

// 앱 전역 프로바이더 묶음: 테마 → 서버 상태 → URL 상태 → 애니메이션 설정 → 툴팁
export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  // 마운트 후 persist 스토어 복원 (skipHydration 사용)
  useEffect(() => {
    void usePreferencesStore.persist.rehydrate()
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          {/* OS의 "동작 줄이기" 설정 시 transform 애니메이션 생략 */}
          <MotionConfig reducedMotion="user">
            <TooltipProvider>{children}</TooltipProvider>
          </MotionConfig>
        </NuqsAdapter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
