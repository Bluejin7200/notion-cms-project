import type { Metadata } from "next"

import { ExampleIndex } from "@/components/examples/example-index"
import { Section } from "@/components/layout/section"

export const metadata: Metadata = {
  title: "예제",
  description: "스타터킷에 포함된 기능별 동작 예제와 소스 코드",
}

// 예제 인덱스: 홈 "기능" 섹션이 '무엇이 있는지' 훑어보는 곳이라면, 여기는 '어떻게 쓰는지' 찾는 곳
export default function ExamplesPage() {
  return (
    <Section>
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">예제</h1>
        <p className="max-w-2xl text-muted-foreground">
          기능별 동작 예제를 직접 조작해보고, 실제 소스 코드를 복사해 프로젝트에 바로 사용하세요.
        </p>
      </div>
      <ExampleIndex />
    </Section>
  )
}
