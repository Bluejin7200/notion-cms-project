import { Link as LinkIcon } from "lucide-react"

import { CopyButton } from "@/components/common/copy-button"
import { ExampleErrorBoundary } from "@/components/examples/example-error-boundary"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ExampleMeta } from "@/config/examples"
import type { HighlightedFile } from "@/lib/examples/source"

type ExampleBlockProps = {
  example: ExampleMeta
  files: HighlightedFile[]
  children: React.ReactNode
}

// 예제 하나: 제목·설명 + [미리보기 | 코드] 탭 (코드는 실제 예제 파일을 빌드 시 읽어 강조 표시)
export function ExampleBlock({ example, files, children }: ExampleBlockProps) {
  return (
    <section id={example.id} className="scroll-mt-20 space-y-3">
      <div className="space-y-1">
        <h2 className="group flex items-center gap-2 text-xl font-semibold tracking-tight">
          {example.title}
          <a
            href={`#${example.id}`}
            aria-label={`${example.title} 링크`}
            className="text-muted-foreground opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            <LinkIcon className="size-4" />
          </a>
        </h2>
        <p className="text-sm text-muted-foreground">{example.description}</p>
      </div>

      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">미리보기</TabsTrigger>
          <TabsTrigger value="code">코드</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <div className="rounded-xl border bg-background p-4 sm:p-6">
            <ExampleErrorBoundary>{children}</ExampleErrorBoundary>
          </div>
        </TabsContent>

        <TabsContent value="code" className="space-y-3">
          {files.map((file) => (
            <div key={file.name} className="overflow-hidden rounded-xl border bg-muted/40">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <span className="truncate font-mono text-xs text-muted-foreground">{file.path}</span>
                <CopyButton value={file.code} label={`${file.name} 코드 복사`} />
              </div>
              {/* 신뢰할 수 있는 프로젝트 내부 파일을 shiki가 변환한 HTML */}
              <div
                className="max-h-[480px] overflow-auto p-4 text-[13px] leading-relaxed [&_pre]:outline-none"
                dangerouslySetInnerHTML={{ __html: file.html }}
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </section>
  )
}
