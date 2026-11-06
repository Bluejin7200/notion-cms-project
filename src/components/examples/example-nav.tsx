import Link from "next/link"

import { ExampleNavChips } from "@/components/examples/example-nav-chips"
import { exampleFeatures } from "@/config/examples"
import { cn } from "@/lib/utils"

// 예제 기능 목록: 데스크톱은 좌측 고정 목록, 모바일은 가로 스크롤 칩
export function ExampleNav({ currentSlug }: { currentSlug: string }) {
  return (
    <nav aria-label="예제 기능 목록">
      {/* 모바일·태블릿: 가로 스크롤 칩 (현재 기능으로 자동 스크롤) */}
      <ExampleNavChips currentSlug={currentSlug} />

      {/* 데스크톱: 세로 목록 */}
      <ul className="sticky top-20 hidden space-y-1 lg:block">
        {exampleFeatures.map((feature) => (
          <li key={feature.slug}>
            <Link
              href={`/examples/${feature.slug}`}
              aria-current={feature.slug === currentSlug ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                feature.slug === currentSlug && "bg-muted font-medium text-foreground"
              )}
            >
              <feature.icon className="size-4 shrink-0" />
              <span className="flex-1 truncate">{feature.title}</span>
              <span className="text-xs">{feature.examples.length}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
