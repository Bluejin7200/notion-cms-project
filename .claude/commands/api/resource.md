---
description: 'orders 구조를 템플릿으로 목업·Route Handler·Zod 스키마·API 호출 함수를 한 번에 생성합니다'
argument-hint: '<리소스 이름(복수형 kebab-case)> [필드·필터 설명]'
allowed-tools:
  [
    'Read',
    'Edit',
    'Write',
    'Glob',
    'Grep',
    'AskUserQuestion',
    'Bash(ls:*)',
    'Bash(npm test:*)',
    'Bash(npm run lint:*)',
    'Bash(npx vitest run:*)',
  ]
---

# Claude 명령어: API Resource

`orders` 구조를 템플릿으로 새 리소스의 목업 데이터 · Route Handler · Zod 스키마 · 테스트 · 클라이언트 호출 함수를 생성합니다.

## 사용법

```
/api:resource <리소스 이름> [필드·필터 설명]
/api:resource products 이름, 가격, 재고, 카테고리(electronics/books/food)로 필터
```

- 리소스 이름: `$1` (URL·파일명에 그대로 쓰므로 복수형 kebab-case, 예: `products`, `blog-posts`)
- 전체 인자: `$ARGUMENTS` (두 번째 이후 단어는 필드·필터 설명)

## 이름 규칙

`$1`에서 아래 이름을 파생해 일관되게 사용 (예: `blog-posts`)

| 용도 | 규칙 | 예 |
| --- | --- | --- |
| 단수 타입 | PascalCase 단수 | `BlogPost` |
| 복수 식별자 | camelCase | `blogPosts` |
| 상수 | UPPER_SNAKE | `BLOG_POSTS`, `BLOG_POST_STATUSES` |
| 스키마 | camelCase + Schema | `blogPostsQuerySchema`, `createBlogPostSchema` |
| 함수 | 동사 + PascalCase | `queryBlogPosts`, `fetchBlogPosts`, `createBlogPost` |
| queryKey | `$1` | `["blog-posts", query]` |

## 프로세스

### 1. 사전 점검 (하나라도 걸리면 파일을 수정하지 말고 이유를 알리고 중단)

1. `$1`이 비어 있으면 위 사용법을 출력
2. `$1`이 kebab-case(`^[a-z0-9]+(-[a-z0-9]+)*$`)가 아니면 중단
3. 아래 생성 대상 파일이나 `src/app/api/$1/`이 이미 있으면 덮어쓰지 말고 중단
4. 필드 설명이 없으면 리소스 이름에 어울리는 필드를 4~6개 정해 **작업 전에 한 줄로 알림** (`id`, `createdAt`(ISO 문자열)은 항상 포함)

### 2. 템플릿 파일 읽기

작성 전에 반드시 아래 파일을 읽고 구조·주석 말투를 그대로 따른다.

- `src/lib/orders.ts` — 도메인 타입·상태 상수·조회 스키마
- `src/lib/mock/orders.ts` — 시드 고정 난수 목업 + `queryOrders` 순수 함수
- `src/app/api/orders/route.ts` — GET Route Handler
- `src/app/api/auth/login/route.ts` — `parseBody` + `apiError` 사용 예
- `src/lib/api/response.ts` (`parseBody`, `apiError`), `src/lib/api/client.ts` (`apiFetch`, `apiPost`)
- `src/lib/api/orders.ts` — `queryOptions`
- `src/hooks/use-orders-params.ts` — nuqs 훅
- `src/lib/validations/settings.ts`, `settings.test.ts`, `common.ts` — 스키마·테스트 형식, 재사용 스키마(`requiredString`, `emailSchema` 등)

### 3. 파일 생성

#### `src/lib/validations/$1.ts` — Zod 스키마 (서버·클라이언트 공용)

- 도메인 타입 `<Single>`과 상태 같은 열거형은 `as const` 배열 + 라벨 맵(`Record<Status, string>`)
- `<plural>QuerySchema`: 목록 조회 조건. `ordersQuerySchema`처럼 `q`, 필터, `page`, `pageSize`를 `z.coerce`로 변환하고 `.default()` 지정, 한국어 오류 메시지
- `create<Single>Schema`: 생성 요청 본문. `id`·`createdAt`은 제외, `common.ts`의 공통 스키마 재사용
- `z.infer`로 `<Plural>Query`, `Create<Single>Values` 타입 export
- 응답 타입 `<Plural>Response = { items, total, page, pageSize }`

#### `src/lib/validations/$1.test.ts` — Vitest

`settings.test.ts` 형식(`describe`/`it`, 한국어 테스트 이름)으로 최소:

- 조회 스키마: 빈 객체 → 기본값 적용, 문자열 숫자 → 숫자 변환, 잘못된 필터 값 → 실패
- 생성 스키마: 올바른 값 통과, 필수 필드 누락 시 정확한 오류 메시지 확인

#### `src/lib/mock/$1.ts` — 목업 데이터

- `src/lib/mock/orders.ts`처럼 결정적 난수(mulberry32)와 고정 기준 시각으로 매번 같은 데이터 20~50건 생성
- `query<Plural>(query, source = <PLURAL>)`: 검색·필터·페이지네이션 순수 함수
- `create<Single>(values)`: 메모리 배열 맨 앞에 추가 후 반환 (서버 재시작 시 초기화된다는 주석 포함)
- 파일 상단에 "실제 DB로 교체할 부분" 주석

#### `src/app/api/$1/route.ts` — Route Handler

```ts
import { NextResponse, type NextRequest } from "next/server"

import { apiError, parseBody } from "@/lib/api/response"
import { getSession } from "@/lib/auth/get-session"
// ...mock·validations import

// 목록 조회: GET /api/$1?q=&...&page=&pageSize=
export async function GET(request: NextRequest) {
  if (!(await getSession())) return apiError("로그인이 필요합니다.", 401)
  // searchParams → query 스키마 safeParse, 실패 시 apiError(첫 번째 이슈 메시지)
}

// 생성: POST /api/$1
export async function POST(request: Request) {
  if (!(await getSession())) return apiError("로그인이 필요합니다.", 401)
  const { data, error } = await parseBody(request, create<Single>Schema)
  if (!data) return apiError(error)
  return NextResponse.json(create<Single>(data), { status: 201 })
}
```

#### `src/lib/api/$1.ts` — 클라이언트 호출 함수

- 상단 주석: "실제 백엔드로 교체 시 이 파일만 수정"
- `fetch<Plural>(query)`: `URLSearchParams`로 쿼리 구성 후 `apiFetch<<Plural>Response>`
- `<plural>QueryOptions(query)`: `queryOptions({ queryKey: ["$1", query], queryFn, placeholderData: keepPreviousData })`
- `create<Single>(values)`: `apiPost<<Single>>("/api/$1", values)`

#### `src/hooks/use-$1-params.ts` — nuqs 훅 (목록 필터가 있을 때만)

- 검색어 외에 필터(상태·카테고리 등)가 있으면 `use-orders-params.ts`와 같은 형태로 생성 (`"use client"`, `useQueryStates`, `history: "replace"`)
- 필터가 없으면 만들지 않고 결과 보고에 이유를 적음

### 4. 대시보드 메뉴 확인

`AskUserQuestion`으로 `src/config/site.ts`의 `dashboardNav`에 메뉴를 추가할지 묻는다.

- 추가: `{ title: "<한국어 이름>", href: "/dashboard/$1", icon: <lucide 아이콘> }`을 "설정" 앞에 넣고 아이콘 import 추가
  - 페이지(`src/app/dashboard/$1/page.tsx`)는 이 커맨드 범위 밖이므로 만들지 않고 "페이지가 없어 404" 라는 점을 안내
- 추가 안 함: 수정하지 않음

### 5. 코드 규칙

- TypeScript, `any` 금지 (`unknown` + 스키마 검증 사용)
- 세미콜론 없음, 큰따옴표, 2칸 들여쓰기, 한국어 주석
- 경로 별칭 `@/*` 사용
- 서버 전용 코드(`getSession`, 목업)를 `src/lib/api/$1.ts`나 훅에서 import하지 않음 (타입은 `import type`)

### 6. 검증

```bash
npm test
npm run lint
```

- 실패하면 원인을 수정하고 둘 다 통과할 때까지 다시 실행
- 새로 만든 파일 외의 기존 실패라면 수정하지 말고 보고

### 7. 결과 보고

- 생성/수정한 파일 목록 (nuqs 훅·메뉴 추가 여부 포함)
- `npm test`, `npm run lint` 결과
- 확인 방법: 로그인 후 브라우저에서 `http://localhost:3000/api/$1?page=1` 접속 (미로그인 시 401)
