import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react"

import { ExampleBlock } from "@/components/examples/example-block"
import { ExampleNav } from "@/components/examples/example-nav"
import { Container } from "@/components/layout/container"
import { buttonVariants } from "@/components/ui/button"
import { exampleFeatures, getExampleFeature, getExampleFiles } from "@/config/examples"
import { exampleComponents } from "@/examples/registry"
import { getHighlightedFile } from "@/lib/examples/source"
import { cn } from "@/lib/utils"

// 레지스트리에 있는 기능만 빌드 시 정적 생성, 그 외 slug는 404
export const dynamicParams = false

export function generateStaticParams() {
  return exampleFeatures.map((feature) => ({ slug: feature.slug }))
}

export async function generateMetadata({ params }: PageProps<"/examples/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const feature = getExampleFeature(slug)
  return feature ? { title: `${feature.title} 예제`, description: feature.description } : {}
}

export default async function ExampleFeaturePage({ params }: PageProps<"/examples/[slug]">) {
  const { slug } = await params
  const feature = getExampleFeature(slug)
  if (!feature) notFound()

  // 예제별 소스 파일을 읽어 구문 강조 (빌드 시 1회)
  const examples = await Promise.all(
    feature.examples.map(async (example) => ({
      example,
      files: await Promise.all(getExampleFiles(example).map((file) => getHighlightedFile(slug, file))),
      Component: exampleComponents[`${slug}/${example.id}`],
    }))
  )

  const index = exampleFeatures.findIndex((f) => f.slug === slug)
  const prev = exampleFeatures[index - 1]
  const next = exampleFeatures[index + 1]

  return (
    <Container className="py-10 sm:py-14">
      {/* 모바일에서도 열 폭을 minmax(0,1fr)로 제한해 가로 스크롤 칩이 레이아웃을 넓히지 않도록 */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <ExampleNav currentSlug={slug} />
        </aside>

        <div className="min-w-0 space-y-12">
          {/* 기능 소개 */}
          <header className="space-y-3">
            <Link href="/examples" className="text-sm text-muted-foreground hover:text-foreground">
              ← 전체 예제
            </Link>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
              <feature.icon className="size-7 text-primary" />
              {feature.title}
            </h1>
            <p className="text-muted-foreground">{feature.description}</p>
            {/* 이 페이지의 예제 목차 */}
            <ul className="flex flex-wrap gap-2 text-sm">
              {feature.examples.map((example) => (
                <li key={example.id}>
                  <a href={`#${example.id}`} className="rounded-md bg-muted px-2 py-1 hover:text-primary">
                    {example.title}
                  </a>
                </li>
              ))}
            </ul>
          </header>

          {examples.map(({ example, files, Component }) => (
            <ExampleBlock key={example.id} example={example} files={files}>
              <Component />
            </ExampleBlock>
          ))}

          {/* 이 프로젝트에서 실제로 사용 중인 곳 */}
          <section className="space-y-3 rounded-xl border bg-muted/30 p-5">
            <h2 className="font-semibold">이 프로젝트에서 사용 중인 곳</h2>
            <ul className="space-y-1 text-sm">
              {feature.usedIn.map((item) => (
                <li key={item.href + item.label}>
                  <Link href={item.href} className="inline-flex items-center gap-1 text-primary hover:underline">
                    {item.label} <ExternalLink className="size-3" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">대시보드 화면은 로그인이 필요합니다. (데모 계정: 아무 이메일)</p>
          </section>

          {/* 이전/다음 기능 */}
          <nav className="flex flex-col gap-2 border-t pt-6 sm:flex-row sm:justify-between" aria-label="이전/다음 기능">
            {prev ? (
              <Link href={`/examples/${prev.slug}`} className={cn(buttonVariants({ variant: "outline" }), "justify-start")}>
                <ArrowLeft /> {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/examples/${next.slug}`} className={cn(buttonVariants({ variant: "outline" }), "justify-end")}>
                {next.title} <ArrowRight />
              </Link>
            )}
          </nav>
        </div>
      </div>
    </Container>
  )
}
