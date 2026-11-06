"use client"

import { useSyncExternalStore } from "react"
import { Laptop, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const themes = [
  { value: "light", label: "라이트", icon: Sun },
  { value: "dark", label: "다크", icon: Moon },
  { value: "system", label: "시스템", icon: Laptop },
]

// 테마마다 값이 바뀌는 디자인 토큰 (globals.css의 :root / .dark)
const tokens = ["background", "foreground", "primary", "secondary", "muted", "accent", "destructive", "border"]

// 서버에서는 현재 테마를 알 수 없으므로, 마운트 여부를 확인해 하이드레이션 불일치 방지
const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

export default function ThemeSwitcherExample() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          value={mounted && theme ? [theme] : []}
          onValueChange={(value) => value[0] && setTheme(value[0])}
          variant="outline"
          aria-label="테마 선택"
        >
          {themes.map(({ value, label, icon: Icon }) => (
            <ToggleGroupItem key={value} value={value} aria-label={label}>
              <Icon /> {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <span className="text-sm text-muted-foreground">
          적용 중: {mounted ? resolvedTheme : "확인 중..."}
        </span>
      </div>

      {/* 같은 클래스(bg-primary 등)라도 테마에 따라 실제 색이 달라짐 */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tokens.map((token) => (
          <div key={token} className="overflow-hidden rounded-lg border text-xs">
            <div className="h-10" style={{ backgroundColor: `var(--${token})` }} />
            <p className="px-2 py-1.5 font-mono">--{token}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
