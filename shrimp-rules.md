# 개발 가이드라인 (AI Agent 전용)

> 이 문서는 코딩 에이전트용 규칙이다. 일반 개발 지식은 담지 않는다. 충돌 시 우선순위: 사용자 지시 > `docs/tasks/T0XX-*.md` > `docs/ROADMAP.md` > `docs/PRD.md` > 이 문서 > `CLAUDE.md`.

## 1. 프로젝트 개요

- Next.js **16.3.8** App Router + React 19.2.8 스타터킷을 **Notion 기반 지급 요청·승인 트래커**로 전환하는 중
- 웹앱 범위: 지급 요청 **조회 + 상태 변경(승인/지급완료/반려)만**. 등록·수정 폼을 만들지 말 것
- 기존 "주문(orders)" 예제는 지급 요청(payments)으로 **대체 후 제거** 예정 (T076)
- 데모 로그인(형식만 맞으면 통과) 유지. 보안 강화 작업을 임의로 추가하지 말 것

## 2. 디렉터리 구조와 역할

| 경로 | 역할 | 규칙 |
|------|------|------|
| `src/app/(marketing)/` | 홈·`/examples` | MVP 범위 밖. 홈 문구 외 수정 금지 |
| `src/app/(auth)/` | `/login`, `/signup` | 기존 유지 |
| `src/app/dashboard/` | 사이드바 레이아웃 보호 영역 | 지급 요청 페이지는 `dashboard/payments/`, 상세는 `dashboard/payments/[id]/` |
| `src/app/api/` | Route Handler | 지급 요청 API는 `api/payments/` 하위 |
| `src/lib/payments/` | 지급 요청 도메인 | 아래 "서버/클라이언트 경계" 준수 |
| `src/lib/notion/` | Notion 클라이언트·변환·저장소 | 전부 서버 전용 |
| `src/lib/validations/` | Zod 스키마 | `payments-query.ts`, `payment-status.ts` |
| `src/lib/api/` | 클라이언트 호출 함수 + `queryOptions` | `payments.ts` |
| `src/lib/mock/` | 목업 | `payments.ts`는 개발용, T076에서 제거 |
| `src/components/payments/` | 지급 요청 UI | `components/orders/` 패턴 재사용 |
| `src/components/ui/` | shadcn 생성물 | 직접 수정 최소화, `npx shadcn@latest add`로 추가 |
| `docs/` | PRD·로드맵·작업 명세 | 작업 진행 시 갱신 대상 |
| `shrimp_data/` | shrimp 작업 데이터 | 수동 편집 금지 |

## 3. 작업 진행 워크플로우 (필수)

1. `docs/ROADMAP.md`에서 `🔜 다음` 작업 확인 → 선행 작업 완료 여부 확인
2. 해당 `docs/tasks/T0XX-*.md`만 열고 "착수 전 확인"(`next16-docs`·`notion-api-docs` 에이전트) 먼저 수행
3. "구현 단계" 순서대로 구현, 단계마다 작업 파일 체크박스 갱신
4. 검증: Vitest(`vitest-writer`) → Playwright MCP 시나리오. 실패 시 수정 후 같은 테스트 재실행. Notion 오류는 `notion-debugger`로 진단
5. 작업 파일 "완료 기준" 체크 + "변경 요약" 작성
6. `ROADMAP.md`에서 완료 작업 ✅, `🔜 다음`을 다음 작업으로 이동, 결정 사항은 "진행 메모"에 기록
7. **작업 하나가 끝나면 멈추고 보고**. 다음 작업을 자동으로 이어서 시작하지 말 것
8. Phase 마무리: `/check` → 필요 시 `code-reviewer` → 회귀 시나리오

- 테스트·E2E 작업(T005, T009 등)은 별도 파일 없음 → 짝지어진 구현 작업 파일의 "테스트 체크리스트" 사용
- `[확인 필요]` 표시 항목(마스킹 정규식, 10,000건 상한 처리)은 착수 시 사용자에게 확인

## 4. 코드 표준

- 세미콜론 없음, 큰따옴표, 2칸 들여쓰기, 경로 별칭 `@/*` → `src/*`
- **TypeScript strict mode** 유지 (`tsconfig.json` `"strict": true`). strict 옵션을 끄거나 `@ts-ignore`·`@ts-expect-error`·non-null 단언(`!`)으로 오류를 덮지 말 것 → 타입 가드·좁히기로 해결
- **ESLint 규칙 준수** (`eslint.config.mjs`: `eslint-config-next` core-web-vitals + typescript). `npm run lint` 경고·오류 0건 유지, `eslint-disable` 주석·규칙 완화 금지 (불가피하면 사유를 한국어 주석으로 남기고 보고)
- 주석·테스트 이름·오류 메시지·커밋 메시지는 **한국어**, 식별자는 영어
- `any` 금지 → Notion 응답은 타입 가드로 좁힐 것
- 상태 코드값은 영문(`requested`·`approved`·`paid`·`rejected`·`unknown`), 표시·Notion 옵션명은 한국어(요청/승인/지급완료/반려). 매핑은 `src/lib/payments/types.ts`에만 둘 것
- 상수·라벨 맵 형식은 `src/lib/orders.ts`(`ORDER_STATUSES`, `ORDER_STATUS_LABEL`, `ORDER_STATUS_BADGE`)를 따를 것

## 5. 서버/클라이언트 경계

| 구분 | 파일 | 규칙 |
|------|------|------|
| 공용 순수 | `src/lib/payments/{types,transitions,rules,views,query,summary,links}.ts`, `src/lib/date-kst.ts`, `src/lib/validations/payment*.ts` | `@notionhq/client`·`server-only`·`node:*`·`next/*` import 금지 |
| 서버 전용 | `src/lib/payments/{data,cache,update-status}.ts`, `src/lib/notion/*`, `src/lib/env.server.ts`, `src/lib/auth/session.ts`, `get-session.ts` | 첫 줄 `import "server-only"` (auth 파일은 기존 유지). `"use client"` 파일에서 import 금지 |

- `NOTION_TOKEN`, `NOTION_DATA_SOURCE_ID`는 `src/lib/env.server.ts`의 지연 평가 `getServerEnv()`로만 읽을 것. `src/lib/env.ts`(공개 변수)에 넣지 말 것
- Route Handler의 데이터 진입점은 `src/lib/payments/data.ts`(`listPaymentRecords()`, `findPaymentRecord(id)`) 하나뿐. Route Handler에서 Notion SDK·목업을 직접 import 금지
- `src/examples/registry.tsx`는 서버 페이지에서만 import

## 6. 기능 구현 규칙

### Route Handler
- `src/proxy.ts` matcher에 `/api`가 없다 → **모든 지급 요청 Route Handler 첫 줄에서 `getSession()` 확인, 없으면 `apiError("로그인이 필요합니다.", 401)`**
- 조회 조건: `schema.safeParse(Object.fromEntries(searchParams))` → 실패 시 `apiError(첫 issue 메시지)`. 본문: `parseBody(request, schema)`
- 동적 `params` 처리 방식은 T002 결론(ROADMAP 진행 메모)을 따를 것
- 상태 코드: 401 미인증, 400 입력 오류, 404 없음, 409 `lastEditedTime` 불일치("다른 곳에서 수정됨"), 422 허용되지 않은 전이, 502/503 Notion 오류. 오류 본문에 Notion 원문·토큰 노출 금지

### 상태 변경 (F003·F004)
- 순서 고정: 재조회 → `lastEditedTime` 비교 → `canTransition` → `pages.update`(상태·처리일·반려 사유) → 캐시 만료 → 갱신 상세 반환
- 전이: 요청→승인/반려, 승인→지급완료/반려, 지급완료·반려·unknown→없음. **서버에서도 검사**할 것 (버튼 숨김만으로 막지 말 것)
- 반려 사유: trim 후 1~2000자. 처리일: KST 오늘 `YYYY-MM-DD`
- 실패 시 `expirePaymentsCache()` 호출 금지

### 날짜
- 오늘·주(월~일)·월·연체 판단은 `src/lib/date-kst.ts`만 사용. `Intl` `timeZone: "Asia/Seoul"` 기반, `now`를 인자로 주입, 프로세스 `TZ`에 의존 금지
- 연체 = 예정일 < 오늘 && 상태 ∈ {요청, 승인}. 예정일 빈 건은 연체·합계 제외, 목록 정렬 맨 뒤

### 목록·응답 변환
- 서버가 전체 조회(100건 커서 반복, 상한 10,000) 후 검색·필터·정렬·페이징. 응답 `{ items, total, page, pageSize }`
- 검색: NFC 정규화 + 소문자 부분 일치 (제목·수령처·요청자). Notion `or` 필터 사용 금지
- **목록 항목(`toListItem`)에 계좌 키 자체를 포함하지 말 것**. 상세에만 `toSafeAccount` 결과 포함, 비마스킹 값은 가림 + 경고 플래그
- 증빙: `http:`/`https:`만 링크, 그 외 "유효하지 않은 링크", 없으면 "증빙 없음"

### 캐시
- 목록·집계: 태그 `payments` 60초 캐시(`getCachedPaymentRecords()`), 상세: 캐시 금지
- 상태 변경 성공·새로고침 API: `expirePaymentsCache()` + 클라이언트 `["payments"]` 쿼리 무효화
- 캐시 API 형태는 T002 결론을 따를 것 (학습 데이터의 `unstable_cache` 등 추측 금지)

### 클라이언트
- 호출 함수는 `src/lib/api/payments.ts`에 `apiFetch`/`apiPost` + `queryOptions`로 작성. 쿼리 키: `["payments","list",query]`, 상세는 `["payments","detail",id]` 계열
- 409 구분을 위해 `ApiRequestError`(T021)의 `status` 사용
- URL 동기화: `src/hooks/use-payments-params.ts`에 nuqs `useQueryStates` + `{ history: "replace" }`. 키 `q`·`status`·`overdue`·`page`. 조건 변경 시 `page` 초기화
- 폼: `src/lib/validations/` 스키마 + `useForm({ resolver: zodResolver(schema) })` + `src/components/form/*`
- 확인창은 `ConfirmDialog`, 반려 입력은 `ResponsiveDialog`, 결과는 sonner 토스트

## 7. 라이브러리 사용 규칙

| 대상 | 규칙 |
|------|------|
| Next.js | 코드 작성 전 `node_modules/next/dist/docs/` 확인(`next16-docs` 에이전트). `middleware.ts` 생성 금지 → `src/proxy.ts` |
| shadcn/ui | Base UI(`base-nova`) → `asChild` 금지, `render` 사용. 예: `<SheetTrigger render={<Button variant="ghost" />}>열기</SheetTrigger>` |
| `buttonVariants` | 충돌 클래스는 `cn(buttonVariants(), "...")` 사용. `buttonVariants({ className })` 금지 |
| Notion | `@notionhq/client` ^5.31, `notionVersion: "2026-03-11"`, `dataSources.query`. 사용법은 `notion-api-docs` 에이전트로 확인 |
| Zustand | persist 스토어는 `skipHydration: true` + `src/components/providers.tsx`에서 `rehydrate()` |
| 애니메이션 | `src/components/motion/`의 `FadeIn`, `Stagger`/`StaggerItem` (첫 화면은 `immediate`) |
| 기타 라이브러리 문서 | `context7` MCP 사용 |

## 8. 동시 수정 필수 파일

| 변경 | 함께 수정할 파일 |
|------|----------------|
| 서버 환경변수 추가 | `src/lib/env.server.ts` + `.env.example` + `README.md` |
| 공개 환경변수 추가 | `src/lib/env.ts`(정적 참조) + `.env.example` |
| 대시보드 메뉴 변경 | `src/config/site.ts` `dashboardNav`만 (사이드바·커맨드 팔레트·breadcrumb 자동 반영) |
| 예제 추가 | `src/examples/<slug>/<id>.tsx` + `src/config/examples.ts` + `src/examples/registry.tsx` |
| `/dashboard/orders` 경로 제거 | `src/config/examples.ts`(링크 3곳) + `src/lib/auth/session.test.ts`(경로 문자열) + `site.ts` |
| 주문 → 지급 요청 대체 | ROADMAP "기존 주문 예제 → 지급 요청 대체 계획" 표의 짝 파일 |
| 작업 완료 | `docs/tasks/T0XX-*.md`(체크·변경 요약) + `docs/ROADMAP.md`(✅·🔜·진행 메모) |
| 요구사항 변경 | `docs/PRD.md`(`prd-generator`) → `prd-validator` → `docs/ROADMAP.md`·`docs/tasks/`(`roadmap-generator`) |
| 도메인 모듈 추가·수정 | 같은 폴더 `*.test.ts` |

## 9. 테스트 규칙

- 대상은 `src/**/*.test.ts`만, Node 환경. `.tsx` 컴포넌트 테스트 파일 생성 금지 → UI는 Playwright MCP로 검증
- 날짜 테스트는 `now`를 주입하고 UTC 실행 케이스 포함 (vitest는 `TZ=Asia/Seoul` 고정)
- Playwright 전제: `npm run dev`(`http://localhost:3000`), 데모 로그인 `demo@example.com` / 아무 비밀번호. 상태 변경 시나리오는 Notion 샘플 데이터에서만
- 검증 명령: `npm run lint`, `npx tsc --noEmit`, `npm test`, 단일 파일 `npx vitest run <경로>`

## 10. AI 판단 기준

- Next API가 불확실 → 로컬 문서 확인 전 코드 작성 금지
- Notion 동작이 불확실 → `notion-api-docs` 조사, 오류 발생 → `notion-debugger`
- 새 모듈이 Notion·`next/*`를 필요로 하는가? → 예: 서버 전용(`server-only`) / 아니오: 공용 순수 모듈
- PRD에 값이 없음 → ROADMAP "로드맵에서 정한 가정" 확인 → 없으면 사용자에게 질문
- 작업 범위 밖 개선 발견 → 수정하지 말고 보고에 기록
- 기존 주문 코드 수정 요청이 없으면 T076 전까지 주문 코드 삭제·수정 금지 (현재 대시보드가 `queryOrders` 사용 중)

## 11. 금지 사항

- ❌ `npm audit fix --force` (shadcn·eslint-config-next 다운그레이드). 점검은 `npm audit --omit=dev`
- ❌ `NEXT_PUBLIC_NOTION_*` 등 토큰 공개 변수화, 토큰 값 출력·로그
- ❌ 클라이언트 컴포넌트에서 `@/lib/notion/*`, `env.server.ts`, `session.ts` import
- ❌ `logged_in` 힌트 쿠키(`use-logged-in.ts`)로 권한 판단 → `getSession()` 사용
- ❌ Notion에 실제 금액·계좌·수령처 입력, 원문 계좌번호 저장
- ❌ 웹앱에 지급 요청 등록·수정 폼, 일괄 승인, 최종 상태 되돌리기 추가 (MVP 범위 밖)
- ❌ 상세 조회에 캐시 적용, 목록 응답에 계좌 포함
- ❌ `middleware.ts` 생성, `asChild` 사용
- ❌ 여러 작업을 멈춤 없이 연속 진행
