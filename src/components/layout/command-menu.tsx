"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Home, Laptop, Moon, Search, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { exampleFeatures } from "@/config/examples"
import { siteConfig } from "@/config/site"

const themeOptions = [
  { value: "light", label: "라이트 테마", icon: Sun },
  { value: "dark", label: "다크 테마", icon: Moon },
  { value: "system", label: "시스템 테마", icon: Laptop },
] as const

// ⌘K / Ctrl+K 커맨드 팔레트: 페이지 이동, 예제 검색, 테마 전환
export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()

  // 전역 단축키 등록
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // 항목 실행 후 팔레트 닫기
  const run = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
        aria-label="명령 검색 열기"
      >
        <Search />
        <span className="hidden sm:inline">검색</span>
        <KbdGroup className="hidden sm:inline-flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="명령 검색"
        description="이동할 페이지나 실행할 명령을 검색하세요."
      >
        <Command>
          <CommandInput placeholder="페이지 또는 명령 검색..." />
          <CommandList>
            <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
            <CommandGroup heading="페이지">
              <CommandItem onSelect={() => run(() => router.push("/"))}>
                <Home />
                홈
              </CommandItem>
              {siteConfig.dashboardNav.map((item) => (
                <CommandItem key={item.href} onSelect={() => run(() => router.push(item.href))}>
                  <item.icon />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="예제">
              {exampleFeatures.flatMap((feature) =>
                feature.examples.map((example) => (
                  <CommandItem
                    key={`${feature.slug}/${example.id}`}
                    // 기능명·예제명·설명 모두로 검색되도록 value 지정
                    value={`${feature.title} ${example.title} ${example.description}`}
                    onSelect={() => run(() => router.push(`/examples/${feature.slug}#${example.id}`))}
                  >
                    <feature.icon />
                    <span className="truncate">
                      {example.title}
                      <span className="ml-2 text-xs text-muted-foreground">{feature.title}</span>
                    </span>
                  </CommandItem>
                ))
              )}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="테마">
              {themeOptions.map((option) => (
                <CommandItem key={option.value} onSelect={() => run(() => setTheme(option.value))}>
                  <option.icon />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
