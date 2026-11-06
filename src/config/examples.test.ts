import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { exampleCount, exampleFeatures, getExampleFeature, getExampleFiles } from "@/config/examples"

// 레지스트리(메타데이터)와 실제 예제 파일이 어긋나지 않는지 검사
// 컴포넌트 매핑(registry.tsx)은 React 컴포넌트를 import하므로 파일 내용으로 키를 확인
const examplesDir = path.join(process.cwd(), "src", "examples")
const registrySource = readFileSync(path.join(examplesDir, "registry.tsx"), "utf8")

describe("예제 레지스트리", () => {
  it("기능 slug가 중복되지 않는다", () => {
    const slugs = exampleFeatures.map((f) => f.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("기능 안에서 예제 id가 중복되지 않는다", () => {
    for (const feature of exampleFeatures) {
      const ids = feature.examples.map((e) => e.id)
      expect(new Set(ids).size, feature.slug).toBe(ids.length)
    }
  })

  it("모든 기능에 예제가 1~3개 있다", () => {
    for (const feature of exampleFeatures) {
      expect(feature.examples.length, feature.slug).toBeGreaterThanOrEqual(1)
      expect(feature.examples.length, feature.slug).toBeLessThanOrEqual(3)
    }
  })

  it("코드 탭에 표시할 예제 파일이 모두 존재한다", () => {
    const missing = exampleFeatures.flatMap((feature) =>
      feature.examples.flatMap((example) =>
        getExampleFiles(example)
          .map((file) => path.join(examplesDir, feature.slug, file))
          .filter((filePath) => !existsSync(filePath))
      )
    )
    expect(missing).toEqual([])
  })

  it("모든 예제가 컴포넌트 매핑에 등록되어 있다", () => {
    const unregistered = exampleFeatures.flatMap((feature) =>
      feature.examples
        .map((example) => `"${feature.slug}/${example.id}"`)
        .filter((key) => !registrySource.includes(key))
    )
    expect(unregistered).toEqual([])
  })

  it("실제 사용처 링크는 내부 경로다", () => {
    for (const feature of exampleFeatures) {
      for (const item of feature.usedIn) expect(item.href.startsWith("/"), item.label).toBe(true)
    }
  })

  it("getExampleFeature와 exampleCount가 레지스트리와 일치한다", () => {
    expect(getExampleFeature("forms")?.title).toBe("React Hook Form + Zod")
    expect(getExampleFeature("없는-기능")).toBeUndefined()
    expect(exampleCount).toBe(21)
  })
})
