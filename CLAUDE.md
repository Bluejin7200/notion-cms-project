@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js 16 (App Router) + React 19 스타터킷. 외부 백엔드 없이 Route Handler + 목업 데이터로 동작하며, 마케팅 페이지·인증·대시보드·기능별 예제(`/examples`)를 포함한다. 상세 설명은 `README.md` 참고.

- Next.js 16은 학습 데이터와 API가 다르다. 코드 작성 전 `node_modules/next/dist/docs/`의 해당 가이드를 확인할 것 (AGENTS.md)
- 전역 CLAUDE.md에는 Next.js 15로 되어 있으나 이 프로젝트는 **Next.js 16.3.8**

## 명령어

```bash
npm run dev                             # 개발 서버 (http://localhost:3000)
npm run build                           # 프로덕션 빌드 (운영 모드는 SESSION_SECRET 필요)
npm run lint                            # ESLint (eslint-config-next core-web-vitals + typescript)
npm test                                # Vitest 1회 실행
npm run test:watch                      # 감시 모드
npx vitest run src/lib/format.test.ts   # 단일 파일 테스트
npx vitest run -t "테스트 이름"           # 이름으로 단일 테스트
npx shadcn@latest add <이름>             # shadcn 컴포넌트 추가
```

- 테스트는 `src/**/*.test.ts`만 대상 (Node 환경, `.tsx` 컴포넌트 테스트 없음), 시간대는 `Asia/Seoul`로 고정
- `npm audit fix --force` 금지 — shadcn·eslint-config-next가 다운그레이드되어 프로젝트가 깨짐. 운영 의존성 점검은 `npm audit --omit=dev`

## 아키텍처

### 라우트 그룹과 레이아웃
- `src/app/(marketing)/` — 헤더·푸터 레이아웃, 홈과 `/examples` (정적 생성)
- `src/app/(auth)/` — 중앙 카드 레이아웃 (`/login`, `/signup`)
- `src/app/dashboard/` — 사이드바 레이아웃, 로그인 필요
- `src/app/api/` — `auth/{login,signup,logout}`, `orders` Route Handler

### 인증 (서명 세션 쿠키)
- `src/proxy.ts`: Next 16에서 middleware를 대체. `/dashboard/*` 미인증 시 `/login?next=...`로, 로그인 상태로 `/login`·`/signup` 접근 시 `/dashboard`로 리다이렉트. 만료·위조 쿠키는 삭제
- `src/lib/auth/session.ts`(서버 전용, `node:crypto`): `session` 쿠키 = base64url(JSON) + HMAC-SHA256 서명 + `exp`. `SESSION_SECRET`(32자 이상) 없으면 개발 환경에서만 기본 키 사용, 운영에서는 오류
- `logged_in` 힌트 쿠키(httpOnly 아님)는 정적 헤더 표시 전용(`src/hooks/use-logged-in.ts`), 권한 확인에 쓰지 않음. 로그인/로그아웃 후 `notifySessionChange()` 호출로 헤더 갱신
- 서버 컴포넌트·Route Handler에서는 `getSession()`(`src/lib/auth/get-session.ts`) 사용
- 로그인은 데모용: 형식만 맞으면 통과

### 데이터 흐름 (API ↔ 클라이언트)
- 서버: Route Handler에서 `parseBody(request, schema)` / `apiError(message, status)` 사용 (`src/lib/api/response.ts`)
- 클라이언트: `apiFetch` / `apiPost`(`src/lib/api/client.ts`)로 호출 함수를 `src/lib/api/<이름>.ts`에 작성하고 조회는 `queryOptions`로 묶음 (예: `src/lib/api/orders.ts`)
- 주문 목록 조회 조건(q·status·page)은 nuqs로 URL과 동기화 (`src/hooks/use-orders-params.ts`)
- 목업 데이터: `src/lib/mock/` — 실제 백엔드 교체 지점은 README "실제 백엔드로 교체하기" 표 참고

### 상태 관리
- 서버 상태: TanStack Query (`src/lib/query-client.ts` — 서버는 요청마다 새 클라이언트, 브라우저는 싱글톤)
- 클라이언트 전역 상태: Zustand. localStorage persist 스토어는 하이드레이션 불일치 방지를 위해 `skipHydration: true`로 만들고 `src/components/providers.tsx`에서 `rehydrate()` (예: `src/stores/preferences-store.ts`)
- Providers 순서: Theme → QueryClient → Nuqs → MotionConfig(reducedMotion="user") → Tooltip

### 예제 시스템 (`/examples`)
예제 추가 시 세 곳을 함께 수정해야 한다:
1. `src/examples/<기능 slug>/<예제 id>.tsx` — `export default`, 한 파일에서 완결
2. `src/config/examples.ts` — 기능의 `examples`에 `{ id, title, description }` 추가 (보조 파일은 `files`, 홈 호버 팝업 대표 예제는 `featured`)
3. `src/examples/registry.tsx` — `exampleComponents`에 `"<slug>/<id>"` 등록 (서버 페이지에서만 import해 클라이언트 번들에 섞이지 않게 함)

코드 탭은 `src/lib/examples/source.ts`가 빌드 시 실제 파일을 읽어 shiki로 강조한다. `src/config/examples.test.ts`가 파일 누락·미등록·id 중복을 검사.

### 설정 지점
- `src/config/site.ts`: `mainNav`(상단 메뉴), `dashboardNav`(사이드바·커맨드 팔레트·breadcrumb 공용)
- `src/lib/env.ts`: 공개 환경변수 Zod 검증. 새 변수 추가 시 `.env.example`과 스키마 함께 수정 (`NEXT_PUBLIC_*`는 정적으로 참조해야 번들에 포함)

## PRD 작성 흐름
- `prd-generator` 에이전트로 `docs/PRD.md` 작성 (기존 라우트·인증·메뉴 기준, 데이터 모델은 Notion 데이터베이스 속성)
- 이어서 `prd-validator`로 기술 검증 (읽기 전용, Next 로컬 문서·Context7 근거) → 수정 요청은 다시 `prd-generator`에 반영

## MCP 서버 (`.mcp.json`, project scope)
- `next-devtools`: `npm run dev` 실행 중일 때 Next 16 내장 MCP로 빌드·런타임 오류, 라우트 진단
- `context7`: Base UI·nuqs·TanStack Query·Zod 4·Tailwind 4 등 최신 라이브러리 문서 조회 (Next 문서는 `node_modules/next/dist/docs/` 우선)
- `shadcn`: 레지스트리 검색·컴포넌트 추가 (`base-nova` 스타일, `asChild` 대신 `render` 규칙 유지)
- `playwright`: 헤드리스 브라우저로 UI·E2E 확인 (예: 미인증 `/dashboard` → `/login?next=...` 리다이렉트)
- Sequential Thinking MCP는 모델 내장 확장 사고와 역할이 겹쳐 사용하지 않음

## 코드 규칙
- 경로 별칭 `@/*` → `src/*`
- 기존 코드 스타일: 세미콜론 없음, 큰따옴표, 2칸 들여쓰기, 한국어 주석
- 폼: `src/lib/validations/`의 Zod 스키마 + `useForm({ resolver: zodResolver(schema) })` + `src/components/form/*` 필드 컴포넌트
- shadcn/ui가 **Base UI 기반**(`style: base-nova`) → `asChild` 대신 `render` 속성 사용
  (예: `<SheetTrigger render={<Button variant="ghost" />}>열기</SheetTrigger>`)
- `buttonVariants({ className })`는 클래스를 병합하지 않고 이어 붙이기만 함 → 충돌 클래스는 `cn(buttonVariants(), "...")`로 합칠 것
- 애니메이션은 `src/components/motion/`의 `FadeIn`, `Stagger`/`StaggerItem` 사용 (첫 화면 요소는 `immediate`)
