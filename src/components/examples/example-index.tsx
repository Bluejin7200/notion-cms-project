"use client"

import { useDeferredValue, useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronRight, Search, SearchX } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { exampleCount, exampleFeatures } from "@/config/examples"

// 예제 인덱스: 21개 예제를 기능별로 바로 나열하고 검색으로 좁힘 (홈 기능 카드와 역할 구분)
export function ExampleIndex() {
  const [query, setQuery] = useState("")
  // 입력은 즉시 반영하고 목록 필터링은 지연 처리해 타이핑이 끊기지 않도록
  const keyword = useDeferredValue(query.trim().toLowerCase())

  const groups = exampleFeatures
    .map((feature) => {
      // 기능명·기능 설명이 일치하면 해당 기능의 예제 전체, 아니면 제목·설명이 일치하는 예제만
      const featureMatch = `${feature.title} ${feature.description}`.toLowerCase().includes(keyword)
      const examples = feature.examples.filter(
        (example) =>
          featureMatch ||
          example.title.toLowerCase().includes(keyword) ||
          example.description.toLowerCase().includes(keyword)
      )
      return { feature, examples }
    })
    .filter((group) => group.examples.length > 0)

  const resultCount = groups.reduce((sum, group) => sum + group.examples.length, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="sm:max-w-sm">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="예제 검색 (예: 폼, useQuery, 다크)"
            aria-label="예제 검색"
          />
        </InputGroup>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {keyword ? `${resultCount}개 예제 찾음` : `${exampleFeatures.length}개 기능 · ${exampleCount}개 예제`}
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="일치하는 예제가 없습니다."
          description="다른 검색어를 입력해보세요."
          action={
            <Button variant="outline" onClick={() => setQuery("")}>
              검색어 지우기
            </Button>
          }
        />
      ) : (
        <div className="grid items-start gap-4 md:grid-cols-2">
          {groups.map(({ feature, examples }) => (
            <section key={feature.slug} className="overflow-hidden rounded-xl border bg-card">
              {/* 기능 헤더: 기능 페이지로 이동 */}
              <Link
                href={`/examples/${feature.slug}`}
                className="group flex items-center gap-3 border-b bg-muted/30 px-4 py-3 transition hover:bg-muted/60"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{feature.title}</span>
                </span>
                <Badge variant="secondary">{feature.examples.length}</Badge>
                <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>

              {/* 예제 목록: 각 예제 위치로 바로 이동 */}
              <ul className="divide-y">
                {examples.map((example) => (
                  <li key={example.id}>
                    <Link
                      href={`/examples/${feature.slug}#${example.id}`}
                      className="group flex items-center gap-3 px-4 py-3 transition hover:bg-muted/40"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <span className="truncate">{example.title}</span>
                          {example.id === feature.featured && (
                            <Badge variant="outline" className="shrink-0 text-[10px]">
                              대표
                            </Badge>
                          )}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {example.description}
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
