"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

// next-themes 프로바이더 래퍼 (클라이언트 컴포넌트)
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
