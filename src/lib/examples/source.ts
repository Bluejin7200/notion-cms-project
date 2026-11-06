import { readFile } from "node:fs/promises"
import path from "node:path"

import { codeToHtml } from "shiki"

// 예제 소스 파일 읽기 + 구문 강조 (서버 전용, 예제 페이지가 정적으로 생성될 때 빌드 시점에 실행)

export const EXAMPLES_DIR = path.join(process.cwd(), "src", "examples")

export function getExampleFilePath(slug: string, file: string) {
  return path.join(EXAMPLES_DIR, slug, file)
}

export type HighlightedFile = {
  name: string
  // 프로젝트 루트 기준 경로 (코드 탭 상단 표시용)
  path: string
  code: string
  html: string
}

export async function getHighlightedFile(slug: string, file: string): Promise<HighlightedFile> {
  const code = await readFile(getExampleFilePath(slug, file), "utf8")
  const html = await codeToHtml(code, {
    lang: "tsx",
    themes: { light: "github-light", dark: "github-dark" },
    // 색상은 CSS 변수로만 출력 → globals.css에서 테마에 따라 전환
    defaultColor: false,
  })
  return { name: file, path: `src/examples/${slug}/${file}`, code, html }
}
