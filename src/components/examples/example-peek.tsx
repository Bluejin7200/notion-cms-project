import Link from "next/link"
import { ArrowRight, ChevronRight, Play } from "lucide-react"

import { ExampleErrorBoundary } from "@/components/examples/example-error-boundary"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { getFeaturedExample, type ExampleFeature } from "@/config/examples"
import { exampleComponents } from "@/examples/registry"

// 홈 기능 카드의 "예제" 칩: 마우스를 올리거나 키보드로 포커스하면 대표 예제 결과 화면을 미리 보여줌
// 터치 기기는 호버가 없으므로 칩을 누르면 기능 예제 페이지로 바로 이동
export function ExamplePeek({ feature }: { feature: ExampleFeature }) {
  const featured = getFeaturedExample(feature)
  const Preview = exampleComponents[`${feature.slug}/${featured.id}`]
  const href = `/examples/${feature.slug}`

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={250}
        closeDelay={150}
        render={<Link href={`${href}#${featured.id}`} />}
        className="group/chip inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 py-1 pr-2 pl-1 text-xs font-medium text-primary transition hover:border-primary/40 hover:bg-primary/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-popup-open:border-primary/40 data-popup-open:bg-primary/10"
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Play className="size-2.5 fill-current" />
        </span>
        예제 {feature.examples.length}
        <ChevronRight className="size-3.5 transition group-hover/chip:translate-x-0.5" />
      </HoverCardTrigger>

      <HoverCardContent side="top" align="start" sideOffset={8} className="w-[min(440px,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">대표 예제</p>
            <p className="truncate text-sm font-semibold">{featured.title}</p>
          </div>
          <feature.icon className="size-4 shrink-0 text-primary" />
        </div>

        {/* 실제 예제를 렌더링하되 조작은 막음(inert) — 팝업은 "결과 미리보기" 용도 */}
        <div className="relative max-h-64 overflow-hidden">
          <div inert className="pointer-events-none origin-top-left scale-[0.82] p-4 select-none [width:122%]">
            <ExampleErrorBoundary>
              <Preview />
            </ExampleErrorBoundary>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-popover to-transparent" />
        </div>

        <Link
          href={href}
          className="flex items-center justify-between border-t px-4 py-2.5 text-sm font-medium text-primary hover:bg-muted/50"
        >
          예제 {feature.examples.length}개 모두 보기 · 코드 포함
          <ArrowRight className="size-4" />
        </Link>
      </HoverCardContent>
    </HoverCard>
  )
}
