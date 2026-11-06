"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"

import { exampleFeatures } from "@/config/examples"
import { cn } from "@/lib/utils"

// 모바일·태블릿용 가로 스크롤 기능 칩: 현재 기능 칩이 보이도록 가운데로 자동 스크롤
export function ExampleNavChips({ currentSlug }: { currentSlug: string }) {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const list = listRef.current
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!list || !active) return
    // scrollIntoView는 페이지 세로 스크롤까지 움직일 수 있어 목록의 가로 위치만 직접 계산
    list.scrollTo({ left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2 })
  }, [currentSlug])

  return (
    <ul ref={listRef} className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:hidden">
      {exampleFeatures.map((feature) => (
        <li key={feature.slug} className="shrink-0">
          <Link
            href={`/examples/${feature.slug}`}
            aria-current={feature.slug === currentSlug ? "page" : undefined}
            className={cn(
              "inline-flex rounded-full border px-3 py-1 text-sm whitespace-nowrap transition hover:bg-muted",
              feature.slug === currentSlug && "border-primary bg-primary text-primary-foreground hover:bg-primary"
            )}
          >
            {feature.title}
          </Link>
        </li>
      ))}
    </ul>
  )
}
