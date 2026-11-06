---
description: '기능 slug와 예제 id로 /examples 예제 파일을 만들고 레지스트리에 등록합니다'
argument-hint: '<기능 slug> <예제 id> [예제 설명]'
allowed-tools:
  [
    'Read',
    'Edit',
    'Write',
    'Glob',
    'Grep',
    'Bash(ls:*)',
    'Bash(npx vitest run:*)',
  ]
---

# Claude 명령어: Example Add

`/examples`에 새 예제를 추가합니다. 예제 파일 생성 · 메타데이터 등록 · 컴포넌트 등록 · 검증까지 한 번에 처리합니다.

## 사용법

```
/example:add <기능 slug> <예제 id> [예제 설명]
/example:add tailwind demo-card 호버 시 그림자가 커지는 카드
```

- 기능 slug: `$1`
- 예제 id: `$2`
- 전체 인자: `$ARGUMENTS` (세 번째 이후 단어는 예제 내용 설명으로 사용)

## 프로세스

### 1. 사전 점검 (하나라도 걸리면 파일을 수정하지 말고 이유를 알리고 중단)

1. `$1` 또는 `$2`가 비어 있으면 위 사용법을 출력
2. `$2`가 kebab-case(`^[a-z0-9]+(-[a-z0-9]+)*$`)가 아니면 중단
3. `src/config/examples.ts`를 읽어 `exampleFeatures`에 slug가 `$1`인 기능이 있는지 확인
   - 없으면 사용 가능한 slug 목록을 보여주고 중단 (새 기능 추가는 이 커맨드 범위 밖)
4. 해당 기능 `examples`에 id `$2`가 이미 있거나 `src/examples/$1/$2.tsx`가 이미 있으면 중단
5. 해당 기능의 예제가 **이미 3개**면 중단
   - `src/config/examples.test.ts`가 기능당 예제를 1~3개로 제한함. 기존 예제를 교체할지 사용자에게 물어볼 것

### 2. 예제 파일 생성: `src/examples/$1/$2.tsx`

먼저 `src/examples/$1/`의 기존 예제와 `src/examples/animation/stagger.tsx`를 읽고 스타일을 맞춘다.

- 한 파일에서 완결: 다른 예제 파일을 import하지 않음
- `export default function <PascalCase($2)>Example()` (예: `demo-card` → `DemoCardExample`)
- 상태·이벤트·motion을 쓰면 첫 줄에 `"use client"`
- TypeScript: `any` 금지, 데이터 배열에 필요한 타입 명시
- Tailwind CSS로 스타일링, 반응형 필수 (`sm:`·`md:` 브레이크포인트로 모바일 우선)
- 애니메이션은 직접 motion을 쓰지 말고 프로젝트 컴포넌트 사용
  - `FadeIn` — `@/components/motion/fade-in` (`delay`, `direction`, `immediate`)
  - `Stagger` / `StaggerItem` — `@/components/motion/stagger`
- shadcn/ui는 `@/components/ui/*`에서 import. **Base UI 기반**이므로
  - `asChild` 금지 → `render` 속성 사용 (예: `<DialogTrigger render={<Button variant="outline" />}>열기</DialogTrigger>`)
  - 클래스 충돌 시 `buttonVariants({ className })` 대신 `cn(buttonVariants(), "...")` (`cn`은 `@/lib/utils`)
  - 필요한 컴포넌트가 `src/components/ui/`에 없으면 임의로 만들지 말고 `npx shadcn@latest add <이름>` 실행을 안내
- 코드 스타일: 세미콜론 없음, 큰따옴표, 2칸 들여쓰기, 한국어 주석(핵심 포인트만 짧게)
- 아이콘은 `lucide-react`

템플릿 골격 (예제 내용에 맞게 바꿔서 사용):

```tsx
"use client"

import { useState } from "react"
import { RotateCw } from "lucide-react"

import { FadeIn } from "@/components/motion/fade-in"
import { Stagger, StaggerItem } from "@/components/motion/stagger"
import { Button } from "@/components/ui/button"

type Item = {
  title: string
  description: string
}

const items: Item[] = [
  { title: "첫 번째", description: "예제 설명을 적어 주세요." },
  { title: "두 번째", description: "예제 설명을 적어 주세요." },
  { title: "세 번째", description: "예제 설명을 적어 주세요." },
]

export default function DemoCardExample() {
  // key를 바꿔 애니메이션을 다시 재생
  const [replay, setReplay] = useState(0)

  return (
    <div className="space-y-4">
      <FadeIn key={`title-${replay}`} immediate>
        <p className="text-sm text-muted-foreground">예제가 보여주는 핵심을 한 줄로 설명합니다.</p>
      </FadeIn>
      <Stagger key={replay} immediate className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <StaggerItem key={item.title} className="rounded-lg border p-4">
            <p className="font-medium">{item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          </StaggerItem>
        ))}
      </Stagger>
      <Button size="sm" variant="outline" onClick={() => setReplay((n) => n + 1)}>
        <RotateCw /> 다시 재생
      </Button>
    </div>
  )
}
```

### 3. 메타데이터 등록: `src/config/examples.ts`

slug가 `$1`인 기능의 `examples` 배열 **끝**에 추가:

```ts
{
  id: "$2",
  title: "<한국어 제목>",
  description: "<무엇을 어떻게 보여주는지 한 문장>",
},
```

- title·description은 인자로 받은 설명(없으면 예제 내용)을 바탕으로 기존 항목 말투에 맞춰 작성
- 보조 파일이 없으므로 `files`는 생략, `featured`는 변경하지 않음

### 4. 컴포넌트 등록: `src/examples/registry.tsx`

- import 목록에 `import <Name>Example from "./$1/$2"`를 경로 알파벳 순 위치에 추가
- `exampleComponents`에서 같은 기능(`"$1/..."`) 키 묶음의 끝에 `"$1/$2": <Name>Example,` 추가

### 5. 예제 개수 동기화

전체 예제 수가 1 늘어나므로 함께 갱신:

- `src/config/examples.test.ts`: `expect(exampleCount).toBe(N)` → `N + 1`
- `README.md`: "N개 예제" 표기(`/examples` 행, `/examples/[기능]` 행, 문서 구성 설명)를 `N + 1`로

### 6. 검증

```bash
npx vitest run src/config/examples.test.ts
```

- 실패하면 메시지(파일 누락 · 미등록 · id 중복 · 개수 불일치)를 보고 원인을 수정한 뒤 다시 실행
- 통과할 때까지 반복

### 7. 결과 보고

- 생성/수정한 파일 목록
- 테스트 결과 (통과한 테스트 수)
- 확인 경로: `npm run dev` 후 `http://localhost:3000/examples/$1`
