# 지급 요청·승인 트래커 개발 로드맵

> 기준 문서: `docs/PRD.md` (prd-validator 검증 반영본) | 작성일: 2026-11-15 | 갱신일: 2026-11-16

## 📌 개요

- **목표**: Notion 지급 요청 데이터베이스를 원본으로 대시보드 집계, 목록(검색·상태·연체만·페이지), 상세(증빙·마스킹 계좌), 상태 변경(승인/지급완료/반려, 처리일·반려 사유 기록)이 동작하고, 기존 "주문" 예제와 개발용 목업은 모두 제거된 상태
- **전체 구성**: Phase 7개(0~6), 작업 86개 (구현 39 / 테스트 27 / E2E 13 / 마무리 7), 예상 기간 약 38일 (1인 기준)
  - 구현 39개에는 조사 2(T002·T003)·준비 3(T001·T006·T084)·문서 1(T083) 포함, 작업 파일은 구현 작업마다 1개씩 39개
  - 계산 기준: 구현 S = 0.5일, M = 1일 / 테스트·E2E = 0.25일 / 마무리(`/check`·리뷰·회귀 시나리오) = 0.5일
- **현재 상태**
  - **있음 (기존 기능 활용)**: 데모 인증·세션 쿠키(`src/lib/auth/*`, `src/app/api/auth/*`), `/dashboard/*` 보호(`src/proxy.ts`), 사이드바 레이아웃, 설정 페이지·표시 이름(`src/stores/preferences-store.ts`), Route Handler 헬퍼(`parseBody`/`apiError`), `apiFetch`/`queryOptions` 패턴, nuqs URL 동기화 패턴, `ConfirmDialog`·`ResponsiveDialog`·`DataPagination`·`EmptyState`·`PageHeader`, shadcn `Skeleton`·`Switch`·`Textarea`·`Badge`·`Alert`·`Select`·`Table`·`Tooltip`, `form-textarea`, sonner 토스트
  - **수정**: `src/lib/api/client.ts`(오류에 HTTP 상태 포함), `src/config/site.ts`(메뉴·서비스명), `src/components/layout/dashboard-header.tsx`(상세 breadcrumb), `src/app/dashboard/page.tsx`(하드코딩 통계 → Notion 집계), 홈 문구, `src/config/examples.ts`(`/dashboard/orders` 링크 3곳), `src/lib/auth/session.test.ts`(경로 문자열), `package.json`
  - **신규**: 서버 전용 환경변수 스키마, 지급 요청 도메인 규칙(상태 전이·KST 날짜·연체·마스킹·검색·집계), 개발용 목업 데이터 소스, Notion 클라이언트·변환·저장소·캐시, 지급 요청 API 5종, 목록·상세·처리 UI, 요약 카드
  - **제거**: 주문 예제 일체 + 개발용 지급 요청 목업 (Phase 6)
  - **미설치**: `node_modules` 자체가 없음(로컬 Next 문서 `node_modules/next/dist/docs/` 없음), `@notionhq/client`(PRD 기준 `^5.31`), `server-only`, `@date-fns/tz`(선택). `package.json`에 `engines` 없음, `typescript`는 `^5`
- **현재 진행**: Phase 0 대기, 다음 작업 T001

### 기존 주문 예제 → 지급 요청 대체 계획

| 기존 파일 | 처리 | 지급 요청 대응 파일 | 재사용 패턴 |
|----------|------|-------------------|------------|
| `src/lib/orders.ts` | 제거 (T076) | `src/lib/payments/types.ts` + `src/lib/validations/payments-query.ts` (T008) | 상수·라벨 맵·Zod 조회 조건 스키마·응답 타입 구조 |
| `src/lib/mock/orders.ts` | 제거 (T076) | `src/lib/payments/query.ts` (T016), 개발용 `src/lib/mock/payments.ts` (T023, T076에서 제거), `src/lib/notion/payments-repository.ts` (T047) | 순수 함수 `query*(query, source)` 구조, 필터 → slice 페이징 |
| `src/app/api/orders/route.ts` | 제거 (T076) | `src/app/api/payments/route.ts` (T025) | `getSession()` 401 → `safeParse` → `apiError` |
| `src/lib/api/orders.ts` | 제거 (T076) | `src/lib/api/payments.ts` (T029) | `apiFetch` + `queryOptions` + `keepPreviousData` |
| `src/hooks/use-orders-params.ts` | 제거 (T076) | `src/hooks/use-payments-params.ts` (T029) | `useQueryStates` + `history: "replace"` |
| `src/components/orders/*` | 제거 (T076) | `src/components/payments/*` (T031·T033·T035) | 툴바 디바운스, 테이블 로딩/빈/오류 분기, 페이지 범위 보정 |
| `src/app/dashboard/orders/page.tsx` | 제거 (T076) | `src/app/dashboard/payments/page.tsx` (T031) | `PageHeader` + `Card` 구성 |
| `src/lib/orders.test.ts`, `src/lib/mock/orders.test.ts` | 제거 (T076) | Phase 1 테스트 | describe/it 구조, 한국어 테스트명 |
| `siteConfig.dashboardNav` "주문" | 수정 (T037) | "지급 요청" `/dashboard/payments` | 사이드바·커맨드 팔레트·breadcrumb 자동 반영 |

### 로드맵에서 정한 가정 (PRD에 값이 없어 제안한 것)

- 경로: 목록 `/dashboard/payments`, 상세 `/dashboard/payments/[id]`, API `GET /api/payments`, `GET /api/payments/[id]`, `POST /api/payments/[id]/status`, `GET /api/payments/summary`, 새로고침용 `POST /api/payments/refresh`
- URL 쿼리 키: `q`, `status`(`requested`·`approved`·`paid`·`rejected`), `overdue`(`true`), `page`. 상태 코드값은 영문, 표시·Notion 옵션명은 한국어(요청/승인/지급완료/반려)로 매핑
- 마스킹 형식: `<은행명> ***-<숫자 4자리>` (예: `국민 ***-1234`)를 기본 정규식으로 삼고 T014 착수 시 사용자와 확정 `[확인 필요]`
- 10,000건 상한 초과: 상한까지 반환 + 서버 경고 로그 (T047 착수 시 사용자 확인) `[확인 필요]`
- 목록 페이지 크기 기본 10, 최대 50 (기존 주문과 동일)
- 분류(select) 값이 4개 옵션 밖이면 원문 문자열 그대로 표시 (집계·필터 대상 아님)
- 도메인 파일 위치: `src/lib/payments.ts` 대신 `src/lib/payments/types.ts` (같은 이름의 파일과 폴더가 공존하면 `@/lib/payments` 경로가 모호해짐)
- `src/lib/payments/` 안의 모듈 구분
  - **공용 순수 모듈**(클라이언트 import 가능): `types.ts`, `transitions.ts`, `rules.ts`, `views.ts`, `query.ts`, `summary.ts`, `links.ts`
  - **서버 전용 모듈**(`import "server-only"`, 클라이언트 import 금지): `data.ts`, `cache.ts`, `update-status.ts`
- **목업 우선 진행**: Notion 토큰·DB 공유·샘플 데이터(T006)는 사용자 준비가 필요해 늦어질 수 있으므로, Phase 2에서 개발용 목업 데이터 소스(`src/lib/mock/payments.ts`)로 목록·상세 화면을 먼저 완성하고 Phase 3(T051)에서 Notion으로 교체, Phase 6(T076)에서 목업 제거

## 🔄 개발 워크플로우

1. **작업 고르기**: `🔜 다음` 표시된 작업의 `docs/tasks/T0XX-*.md`를 연다. 선행 작업이 끝났는지 확인
2. **착수 전 확인**: 작업 파일의 "착수 전 확인"(`next16-docs`·`notion-api-docs`)을 먼저 수행
3. **구현**: "구현 단계"를 순서대로 진행하고, 단계마다 작업 파일의 체크박스를 갱신
4. **검증**: 짝지어진 Vitest 작업(`vitest-writer`) → Playwright MCP 시나리오 순으로 실행. 실패하면 3으로 돌아가 수정 후 같은 테스트 재실행 (Notion 오류는 `notion-debugger`로 진단)
5. **기록**: 작업 파일의 "완료 기준" 체크, "변경 요약" 작성, 상태를 완료로 변경
6. **로드맵 갱신**: `ROADMAP.md`에서 완료 작업에 ✅, `🔜 다음`을 다음 작업으로 이동, 결정 사항은 "진행 메모"에 기록
7. **멈춤**: 작업 하나(또는 Phase 하나)가 끝날 때마다 결과를 보고하고 다음 지시를 기다린다
8. **Phase 마무리**: `/check`, 필요 시 `code-reviewer`, Playwright 회귀 시나리오 통과 후 Phase 제목에 ✅

- 테스트·E2E·마무리 작업은 별도 파일이 없다. 상세 케이스는 짝지어진 구현 작업 파일의 "테스트 체크리스트"에 작업 ID와 함께 있다
- Playwright MCP 공통 전제: `npm run dev` 실행 중(`http://localhost:3000`), 데모 로그인(`demo@example.com` / 아무 비밀번호). 상태를 바꾸는 시나리오는 **Notion 샘플 데이터에서만** 실행

## 🗺️ Phase 한눈에 보기

| Phase | 이름 | 목표 (완료 시 데모 가능 상태) | 포함 기능 ID | 예상 기간 |
|-------|------|---------------------------|-------------|----------|
| 0 | 기반 준비 | 의존성 설치, 캐시·Notion API 사용법 확정, 서버 전용 환경변수 검증, Notion 샘플 데이터 준비. 기존 화면 정상 동작 | F009 | 3.25일 |
| 1 | 도메인 규칙 | 상태 전이·KST 주/월·연체·마스킹·검색·집계 규칙이 `npm test`로 검증됨 | F001~F008 | 6일 |
| 2 | 목록·상세 읽기 슬라이스 (목업) | 사이드바 "지급 요청"에서 목업 데이터로 검색·필터·연체만·페이지 이동, 행 클릭 → 상세 표시 | F001, F002, F003(준비), F007, F008, F011 | 9일 |
| 3 | Notion 연동 교체 | 같은 화면이 Notion 샘플 데이터로 동작, 60초 캐시 + 새로고침 버튼으로 즉시 반영 | F001, F002, F007, F008, F009 | 7.25일 |
| 4 | 상태 변경 | 상세에서 승인/지급완료/반려 → Notion 반영, 409 충돌 안내, 목록 즉시 갱신 | F003, F004, F009 | 5.25일 |
| 5 | 대시보드 집계 | 이번 주/달 금액, 상태별 건수, 연체 카드, 카드 클릭 → 조건 목록 이동 | F005, F006, F007, F009, F011 | 3.25일 |
| 6 | 정리·통합 | 주문 예제·목업 제거, 홈 문구 교체, 인증·설정 회귀 통과, 배포 | F009, F010, F011, F012, F013 | 4일 |

## 🔗 의존성 흐름

```
Phase 0: T001 설치 ─┬─ T002 Next 캐시 확인 ─┐
                   ├─ T003 Notion 확인 ────┼─ T004 서버 env ─ T006 Notion 샘플 (외부 준비, 병렬)
                   │                       │                         │
Phase 1: T008 타입 ─ T010 전이 / T012 KST ─ T014 규칙·변환 ─ T016 질의 / T018 집계
                   │                                         │
Phase 2:           └ T021 client ─ T023 목업 소스 ─ T025/T027 API ─ T029 호출·URL 훅
                                    ─ T031 툴바 ─ T033 테이블 / T035 상세 ─ T037 메뉴
                                                         │
Phase 3: T041 클라이언트 ─ T043 변환 / T045 오류 ─ T047 저장소 ─ T049 캐시 ─ T051 목업→Notion 교체(T006 필요) ─ T054 새로고침
                                                         │
Phase 4: T058 상태 변경 로직 ─ T060 API ─ T062 mutation ─ T064 처리 버튼 ─ T066 반려 다이얼로그
                                                         │
Phase 5: T069 요약 API / T071 링크 빌더 ─ T073 요약 카드·대시보드 교체
                                                         │
Phase 6: T076 주문·목업 제거 ─ T079 홈 문구 / T083 문서 ─ T084 배포
```

- **병렬 가능**
  - Phase 1은 Notion·Next 캐시와 무관한 순수 함수라 T001 직후 T002·T003·T004·T006과 병렬 진행 가능
  - Phase 1 안에서 T008 계열과 T012(KST 날짜)는 서로 독립
  - Phase 2(목업 읽기 슬라이스)와 Phase 3 앞부분(T041·T043·T045·T047)은 서로 독립 — 두 사람이면 병렬 진행 가능
  - T006(Notion 샘플 데이터)은 외부 준비라 늦어져도 Phase 1·2 진행에 영향 없음. **T051 착수 전까지만** 끝나면 됨
- 주문 예제·목업 제거(T076)는 대시보드 교체(T073)와 Notion 교체(T051)가 끝난 뒤 (현재 대시보드가 `queryOrders`를 직접 사용)

## 📋 Phase별 작업

### Phase 0: 기반 준비

**목표**: 구현에 필요한 라이브러리와 API 사용법을 확정하고, 서버 전용 환경변수와 Notion 샘플 데이터를 준비한다
**완료 기준**: `npm ls @notionhq/client`에 5.31 이상 표시, `node_modules/next/dist/docs/` 존재, T002·T003 결론이 "진행 메모"에 기록됨, `npx vitest run src/lib/env.server.test.ts` 통과, `/notion:setup`이 12개 속성·상태 옵션 4개를 통과, `/check` 통과, 회귀 시나리오 통과

| ID | 작업 | 유형 | 관련 기능 | 파일 | 선행 작업 | 크기 | 완료 기준 |
|----|------|------|----------|------|----------|------|----------|
| T001 | 의존성 설치·`package.json` 정리 | 구현(준비) | F009 | `package.json`, `package-lock.json` | - | S | `npm ls @notionhq/client server-only` 성공, `npm run build`·`npm test` 통과 |
| T002 | Next 16.3.8 캐시·Route Handler API 확인 | 조사 | F009 | `docs/ROADMAP.md`(진행 메모) | T001 | S | 진행 메모 T002 항목 5개에 결론·문서 경로 기록 |
| T003 | Notion API·SDK 사용법 확인 | 조사 | F009 | `docs/ROADMAP.md`(진행 메모) | T001 | S | 진행 메모 T003 항목 7개에 결론·근거 기록 |
| T004 | 서버 전용 환경변수 스키마 추가 | 구현 | F009 | `src/lib/env.server.ts`, `.env.example`, `README.md` | T001, T002 | S | 값 없을 때 `getServerEnv()`가 한국어 오류, 모듈 import만으로는 오류 없음 |
| T005 | T004 단위 테스트 | 테스트 | F009 | `src/lib/env.server.test.ts` | T004 | S | `npx vitest run src/lib/env.server.test.ts` 통과 (누락·빈 값·공백·정상·지연 평가) |
| T006 | Notion DB 연결 점검·샘플 데이터 입력 | 구현(준비) | F009 | (Notion), `.env.local` | T004 | S | `/notion:setup` 점검 통과, 샘플 약 30건이 체크리스트 분포 충족 |
| T007 | Phase 0 마무리 | 마무리 | - | - | T001~T006 | S | `/check` 통과, 회귀 시나리오 1~4 통과 |

- [ ] T001 의존성 설치·`package.json` 정리 — `npm install`로 `node_modules`(로컬 Next 문서 포함) 확보, `@notionhq/client@^5.31`·`server-only` 추가, `engines`·`typescript` 하한 명시. `npm audit fix --force` 금지 🔜 다음
  - See: `docs/tasks/T001-install-dependencies.md`
- [ ] T002 Next 16.3.8 캐시·Route Handler API 확인 — 태그 캐시 방식, Route Handler에서 즉시 만료 가능 API, 동적 `params`, 캐시 크기 상한, `server-only`
  - See: `docs/tasks/T002-verify-next-cache-api.md`
- [ ] T003 Notion API·SDK 사용법 확인 — `notionVersion: "2026-03-11"`, `dataSources.query` 커서, `pages.update` 속성 형식, 속도 제한·재시도, `last_edited_time` 정밀도, 오류 코드
  - See: `docs/tasks/T003-verify-notion-api.md`
- [ ] T004 서버 전용 환경변수 스키마 — `src/lib/env.server.ts`(`import "server-only"`, 지연 평가 `getServerEnv()`), `.env.example`에 `NOTION_TOKEN`·`NOTION_DATA_SOURCE_ID` 추가. `src/lib/env.ts`는 수정하지 않음
  - See: `docs/tasks/T004-server-env-schema.md`
- [ ] T005 T004 단위 테스트 — 케이스: 정상 / 누락 / 빈 문자열 / 공백만 / 메시지에 값 미노출 / import 시점 미평가 (상세: T004 파일의 테스트 체크리스트)
- [ ] T006 Notion DB 연결 점검·샘플 데이터 — `/notion:setup [DB ID]`, Notion MCP로 **샘플 데이터만** 약 30건 (외부 준비, Phase 1·2와 병렬)
  - See: `docs/tasks/T006-notion-db-sample-data.md`
- [ ] T007 Phase 0 마무리 — `/check` 실행, 아래 회귀 시나리오

**Playwright 회귀 시나리오 (Phase 0 완료 확인)** — 의존성 설치 후 기존 화면이 그대로 동작하는지

| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | `browser_navigate` `/` → `browser_snapshot` | 홈 Hero·메뉴 렌더링, `browser_console_messages` 오류 0건 |
| 2 | 미인증 상태로 `/dashboard` 이동 | `/login?next=%2Fdashboard`로 리다이렉트 |
| 3 | `browser_fill_form`으로 데모 로그인 → 제출 | `/dashboard` 이동, 기존 통계 카드 표시 |
| 4 | `/dashboard/orders` 이동 | 기존 주문 목록 표시, `browser_network_requests`에서 `/api/orders` 200 |

### Phase 1: 도메인 규칙

**목표**: Notion·Next와 무관한 업무 규칙을 서버·클라이언트 공용 순수 함수로 만들고 테스트로 고정한다
**완료 기준**: `npm test` 통과(T009~T019 포함), 공용 순수 모듈(`src/lib/payments/{types,transitions,rules,views,query,summary}.ts`, `src/lib/date-kst.ts`, `src/lib/validations/payment{s-query,-status}.ts`)이 `@notionhq/client`·`server-only`·`node:*`를 import하지 않음(Grep 0건), `/check`·`code-reviewer` 통과, 회귀 시나리오 통과

| ID | 작업 | 유형 | 관련 기능 | 파일 | 선행 작업 | 크기 | 완료 기준 |
|----|------|------|----------|------|----------|------|----------|
| T008 | 지급 요청 도메인 타입·상수·조회 조건 스키마 | 구현 | F001, F002, F005, F006, F007, F008 | `src/lib/payments/types.ts`, `src/lib/validations/payments-query.ts` | T001 | M | `paymentsQuerySchema.parse({ overdue: "true" })`가 `{ q: "", overdue: true, page: 1, pageSize: 10 }` 반환, `npx tsc --noEmit` 통과 |
| T009 | T008 단위 테스트 | 테스트 | F001 | `src/lib/validations/payments-query.test.ts` | T008 | S | `npx vitest run src/lib/validations/payments-query.test.ts` 통과 |
| T010 | 상태 전이 규칙·상태 변경 요청 스키마 | 구현 | F003, F004 | `src/lib/payments/transitions.ts`, `src/lib/validations/payment-status.ts` | T008 | S | `getAllowedActions("requested")` = `["approve","reject"]`, 공백 사유 반려 스키마 실패 |
| T011 | T010 단위 테스트 | 테스트 | F003, F004 | `src/lib/payments/transitions.test.ts`, `src/lib/validations/payment-status.test.ts` | T010 | S | 두 파일 `npx vitest run` 통과, 5상태 × 3동작 전 조합 표 기반 검증 |
| T012 | KST 날짜 유틸 (오늘·주·월 범위) | 구현 | F004, F005, F007 | `src/lib/date-kst.ts` | T001 | S | `toKstDateString(new Date("2026-11-15T15:00:00Z"))` = `"2026-11-16"` |
| T013 | T012 단위 테스트 | 테스트 | F004, F005, F007 | `src/lib/date-kst.test.ts` | T012 | S | `npx vitest run src/lib/date-kst.test.ts` 통과 + `TZ=UTC` 실행 확인 결과 기록 |
| T014 | 연체·마스킹·증빙 판별, 목록/상세 응답 변환 | 구현 | F002, F007, F008 | `src/lib/payments/rules.ts`, `src/lib/payments/views.ts` | T008, T012 | M | `toListItem` 결과에 `account` 키 없음, `toDetail`이 비마스킹 계좌를 `"(가려짐)"` + 경고로 변환 |
| T015 | T014 단위 테스트 | 테스트 | F002, F007, F008 | `src/lib/payments/rules.test.ts`, `src/lib/payments/views.test.ts` | T014 | S | 두 파일 `npx vitest run` 통과 |
| T016 | 목록 검색·필터·정렬·페이징 | 구현 | F001, F007 | `src/lib/payments/query.ts` | T014 | S | `queryPayments`가 `{ items, total, page, pageSize }` 반환, 빈 예정일 맨 뒤 |
| T017 | T016 단위 테스트 | 테스트 | F001, F007 | `src/lib/payments/query.test.ts` | T016 | S | `npx vitest run src/lib/payments/query.test.ts` 통과 |
| T018 | 대시보드 집계 계산 | 구현 | F005, F006, F007 | `src/lib/payments/summary.ts` | T012, T014 | S | `summarizePayments(records, today)`가 건수 4종·주/월 합계·연체 `{ count, amount }` 반환 |
| T019 | T018 단위 테스트 | 테스트 | F005, F006, F007 | `src/lib/payments/summary.test.ts` | T018 | S | `npx vitest run src/lib/payments/summary.test.ts` 통과 |
| T020 | Phase 1 마무리 | 마무리 | - | - | T008~T019 | S | `/check`·`code-reviewer` 지적 0건(또는 반영 완료), 회귀 시나리오 통과 |

- [ ] T008 도메인 타입·상수·조회 조건 스키마 — `PAYMENT_STATUSES`, Notion 옵션명 매핑, `PaymentRecord`/`PaymentListItem`(계좌 제외)/`PaymentDetail`/`PaymentsResponse`/`PaymentsSummary`, `paymentsQuerySchema`
  - See: `docs/tasks/T008-payment-domain-types.md`
- [ ] T009 T008 단위 테스트 — 케이스: 기본값 / `overdue` 문자열 변환 / 잘못된 status / page 0·음수 / pageSize 51 / q trim·최대 길이 (상세: T008 파일)
- [ ] T010 상태 전이 규칙·상태 변경 요청 스키마 — `getAllowedActions`·`canTransition`·`getNextStatus`, 반려 사유 trim 후 1~2000자
  - See: `docs/tasks/T010-status-transition-rules.md`
- [ ] T011 T010 단위 테스트 — 케이스: `it.each` 전 조합 / 요청 → 지급완료 거부 / unknown 빈 목록 / 사유 공백·2000자·2001자 / `lastEditedTime` 누락 (상세: T010 파일)
- [ ] T012 KST 날짜 유틸 — `now` 주입, `Intl` `timeZone: "Asia/Seoul"` 기반, 프로세스 `TZ` 비의존 (처리일 기록에도 사용)
  - See: `docs/tasks/T012-kst-date-utils.md`
- [ ] T013 T012 단위 테스트 — 케이스: KST 자정 경계 / 일→월 주 경계 / 월말·연말 / 윤년 / UTC 실행 (상세: T012 파일)
- [ ] T014 연체·마스킹·증빙 판별, 응답 변환 — `isOverdue`, `toSafeAccount`, `toEvidenceLink`, `toListItem`, `toDetail`
  - See: `docs/tasks/T014-payment-rules-and-views.md`
- [ ] T015 T014 단위 테스트 — 케이스: 연체 표 기반 / 마스킹 형식·비형식 / 증빙 프로토콜별 / 목록 항목 계좌 키 부재 (상세: T014 파일)
- [ ] T016 목록 검색·필터·정렬·페이징 — NFC 정규화 + 대소문자 무시, 연체만, 예정일 오름차순·빈 값 맨 뒤
  - See: `docs/tasks/T016-payments-query.md`
- [ ] T017 T016 단위 테스트 — 케이스: NFD 입력 일치 / 대소문자 / 상태+연체 조합 / `paid`+연체 빈 목록 / 페이지 경계 (상세: T016 파일)
- [ ] T018 대시보드 집계 — 상태별 건수, 이번 주·이번 달 합계(연체 중복 포함), 연체 건수·금액
  - See: `docs/tasks/T018-payments-summary.md`
- [ ] T019 T018 단위 테스트 — 케이스: 중복 집계 / 반려·지급완료 제외 / 빈 예정일 제외 / 주·월 경계 / 빈 배열 (상세: T018 파일)
- [ ] T020 Phase 1 마무리 — `/check`, `code-reviewer`로 서버 전용 의존성 혼입·`any` 사용 점검

**Playwright 회귀 시나리오 (Phase 1 완료 확인)** — UI 변경 없음, 기존 화면 무영향 확인

| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | `/` 이동 → `browser_snapshot` | 홈 정상 렌더링, 콘솔 오류 0건 |
| 2 | 데모 로그인 → `/dashboard/orders?status=paid` | 기존 주문 목록이 필터된 상태로 표시 |
| 3 | `/dashboard/settings`에서 표시 이름 저장 | 사이드바 이름 즉시 변경 |

### Phase 2: 목록·상세 읽기 슬라이스 (목업)

**목표**: Notion 준비 여부와 관계없이 목업 데이터로 지급 요청 목록·상세 화면 흐름 전체를 확인할 수 있다
**완료 기준**: 로그인 후 사이드바 "지급 요청"에서 목업 30건이 검색·상태 필터·연체만·페이지 이동되고 조건이 URL에 남음, 행 클릭 → 상세에 증빙·마스킹 계좌·연체 배지 표시, 없는 ID는 상세 안에서 오류 안내, breadcrumb에 "상세" 표시, `npm test` 통과, `/check`·`code-reviewer` 통과, 회귀 시나리오 통과

| ID | 작업 | 유형 | 관련 기능 | 파일 | 선행 작업 | 크기 | 완료 기준 |
|----|------|------|----------|------|----------|------|----------|
| T021 | API 클라이언트 오류에 HTTP 상태 포함 | 구현(수정) | F003, F009 | `src/lib/api/client.ts` | T001 | S | 409 응답 시 `ApiRequestError`의 `status === 409`, 기존 로그인 오류 메시지 표시 유지 |
| T022 | T021 단위 테스트 | 테스트 | F003, F009 | `src/lib/api/client.test.ts` | T021 | S | `npx vitest run src/lib/api/client.test.ts` 통과 |
| T023 | 개발용 목업 데이터 소스·서버 데이터 접근 함수 | 구현 | F001, F002 | `src/lib/mock/payments.ts`, `src/lib/payments/data.ts` | T008, T012 | S | `listPaymentRecords()`가 30건, `findPaymentRecord("없는ID")`가 `null` |
| T024 | T023 단위 테스트 | 테스트 | F001, F002 | `src/lib/mock/payments.test.ts` | T023 | S | `npx vitest run src/lib/mock/payments.test.ts` 통과 |
| T025 | 목록 API `GET /api/payments` | 구현 | F001, F007 | `src/app/api/payments/route.ts` | T014, T016, T023 | S | `GET /api/payments?status=approved`가 승인 건만 `{ items, total, page, pageSize }`, 미인증 401 |
| T026 | T025 Route Handler 테스트 | 테스트 | F001, F007 | `src/app/api/payments/route.test.ts` | T025 | S | `npx vitest run src/app/api/payments/route.test.ts` 통과 |
| T027 | 상세 API `GET /api/payments/[id]` | 구현 | F002, F008 | `src/app/api/payments/[id]/route.ts` | T014, T023 | S | 존재 ID 200 + 마스킹 계좌, 없는 ID 404 "지급 요청을 찾을 수 없습니다." |
| T028 | T027 Route Handler 테스트 | 테스트 | F002, F008 | `src/app/api/payments/[id]/route.test.ts` | T027 | S | `npx vitest run "src/app/api/payments/[id]/route.test.ts"` 통과 |
| T029 | 클라이언트 호출 함수·URL 조건 훅 | 구현 | F001, F002 | `src/lib/api/payments.ts`, `src/hooks/use-payments-params.ts` | T008, T021 | S | `toPaymentsSearchParams({ q: "", overdue: true, page: 2, pageSize: 10 })` = `"page=2&pageSize=10&overdue=true"` |
| T030 | T029 단위 테스트 | 테스트 | F001, F002 | `src/lib/api/payments.test.ts` | T029 | S | `npx vitest run src/lib/api/payments.test.ts` 통과 |
| T031 | 목록 페이지 셸·툴바·상태/연체 배지 | 구현(UI) | F001, F007, F011 | `src/components/payments/payment-status-badge.tsx`, `overdue-badge.tsx`, `payments-toolbar.tsx`, `src/app/dashboard/payments/page.tsx` | T029 | M | 툴바 조작 시 URL `q`·`status`·`overdue`·`page`가 바뀌고 새로고침 후 유지 |
| T032 | T031 화면 검증 | E2E | F001, F007 | - (Playwright MCP) | T031 | S | T031 파일 시나리오 1~8 통과, 콘솔 오류 0건 |
| T033 | 목록 테이블 연결 | 구현(UI) | F001, F007 | `src/components/payments/payments-table.tsx`, `src/app/dashboard/payments/page.tsx` | T025, T031 | M | 6개 컬럼(계좌 없음) 표시, 로딩·빈 상태·오류 재시도 분기 동작 |
| T034 | T033 화면 검증 | E2E | F001, F007 | - (Playwright MCP) | T033 | S | T033 파일 시나리오 1~10 통과, 375px·1280px |
| T035 | 상세 페이지 (읽기 전용) | 구현(UI) | F002, F007, F008, F011 | `src/app/dashboard/payments/[id]/page.tsx`, `src/components/payments/payment-detail.tsx` | T027, T029, T031 | M | 상세에 9개 표시 항목 + 상태·연체 배지, 없는 ID는 상세 안 Alert + "목록으로 돌아가기" |
| T036 | T035 화면 검증 | E2E | F002, F007, F008 | - (Playwright MCP) | T035 | S | T035 파일 시나리오 1~10 통과, 콘솔 오류 0건 |
| T037 | 사이드바 메뉴·breadcrumb 수정 | 구현(수정) | F011 | `src/config/site.ts`, `src/components/layout/dashboard-header.tsx`, `src/lib/breadcrumbs.ts` | T033, T035 | S | 사이드바 "지급 요청" 표시, `/dashboard/payments/<id>` breadcrumb 마지막 항목 "상세" |
| T038 | T037 단위 테스트 | 테스트 | F011 | `src/lib/breadcrumbs.test.ts` | T037 | S | `npx vitest run src/lib/breadcrumbs.test.ts` 통과 |
| T039 | T037 화면 검증 | E2E | F011 | - (Playwright MCP) | T038 | S | T037 파일 시나리오 1~6 통과 |
| T040 | Phase 2 마무리 | 마무리 | - | - | T021~T039 | S | `/check`·`code-reviewer`(client.ts·site.ts·dashboard-header.tsx 변경) 통과, 회귀 시나리오 통과 |

- [ ] T021 API 클라이언트 오류에 HTTP 상태 포함 — `ApiRequestError extends Error { status }`, 기존 호출부 호환 (F003의 409 구분 준비)
  - See: `docs/tasks/T021-api-client-error-status.md`
- [ ] T022 T021 단위 테스트 — 케이스: 성공 JSON / 서버 메시지 실패 / JSON 아닌 실패 본문 / status 보존 / `instanceof Error` (상세: T021 파일)
- [ ] T023 개발용 목업 데이터 소스 — `createMockPaymentRecords(today)`(오늘 기준 상대 날짜), `src/lib/payments/data.ts`의 `listPaymentRecords()`·`findPaymentRecord(id)`가 Route Handler의 유일한 데이터 진입점 (T051에서 Notion으로 교체)
  - See: `docs/tasks/T023-mock-payments-data-source.md`
- [ ] T024 T023 단위 테스트 — 케이스: 30건 / 상태별·연체·빈 예정일·비마스킹 계좌·`javascript:` 증빙 포함 / 같은 `today`면 같은 결과 / 없는 ID null (상세: T023 파일)
- [ ] T025 목록 API — `getSession()` 401 → `paymentsQuerySchema.safeParse` 400 → `queryPayments` → `toListItem`. `proxy.ts` matcher에 `/api` 없음 → Route Handler 자체 인증 필수
  - See: `docs/tasks/T025-payments-list-api.md`
- [ ] T026 T025 Route Handler 테스트 — 케이스: 401 / 400 / 200 형태 / 계좌 키 부재 / `overdue=true` 필터 (상세: T025 파일)
- [ ] T027 상세 API — 동적 `params` 형태는 T002 결론 적용, 캐시 없음
  - See: `docs/tasks/T027-payment-detail-api.md`
- [ ] T028 T027 Route Handler 테스트 — 케이스: 401 / 404 / 200 마스킹 계좌·경고 플래그 / 증빙 판정 (상세: T027 파일)
- [ ] T029 클라이언트 호출 함수·URL 훅 — `fetchPayments`·`paymentsQueryOptions`(키 `["payments","list",query]`), `paymentDetailQueryOptions`, `refreshPayments`(이 단계에서는 쿼리 무효화만), `usePaymentsParams`
  - See: `docs/tasks/T029-payments-client-and-url-params.md`
- [ ] T030 T029 단위 테스트 — 케이스: 검색 파라미터 직렬화 / 쿼리 키 / fetch URL / 404 `ApiRequestError` 전달 (상세: T029 파일)
- [ ] T031 목록 페이지 셸·툴바·배지 — 디바운스 검색, 상태 Select, 연체만 Switch, 새로고침 버튼, 조건 변경 시 page 초기화
  - See: `docs/tasks/T031-payments-toolbar-and-badges.md`
- [ ] T032 Playwright MCP 검증 — 검색 입력 → URL `q` 반영, 연체만 토글 → `overdue=true`, 새로고침 후 유지, 375px 세로 배치 (상세: T031 파일)
- [ ] T033 목록 테이블 연결 — 제목 셀 `Link`, 로딩 스켈레톤·빈 상태·오류 재시도, 범위 밖 페이지 보정
  - See: `docs/tasks/T033-payments-table.md`
- [ ] T034 Playwright MCP 검증 — 필터별 행 수, 빈 결과 안내, 페이지 이동, 행 클릭 → 상세 URL (상세: T033 파일)
- [ ] T035 상세 페이지 — 클라이언트 조회(`paymentDetailQueryOptions`), 증빙 3분기, 마스킹 경고 Alert, 오류는 상세 안 Alert
  - See: `docs/tasks/T035-payment-detail-page.md`
- [ ] T036 Playwright MCP 검증 — 증빙 새 탭 링크·"유효하지 않은 링크"·"증빙 없음", 비마스킹 경고, 없는 ID 안내 (상세: T035 파일)
- [ ] T037 사이드바 메뉴·breadcrumb — "주문" → "지급 요청"(`Banknote`), breadcrumb 계산을 `src/lib/breadcrumbs.ts` 순수 함수로 분리해 ID 세그먼트를 "상세"로
  - See: `docs/tasks/T037-nav-and-breadcrumbs.md`
- [ ] T038 T037 단위 테스트 — 케이스: 메뉴 경로 / 상세 ID → "상세" / 알 수 없는 세그먼트 / 루트 (상세: T037 파일)
- [ ] T039 Playwright MCP 검증 — 사이드바·커맨드 팔레트 "지급 요청", 상세 breadcrumb "상세" 클릭 이동 (상세: T037 파일)
- [ ] T040 Phase 2 마무리 — `/check`, `code-reviewer`(`client.ts`·`site.ts`·`dashboard-header.tsx` 변경 점검)

**Playwright 회귀 시나리오 (Phase 2 완료 확인)** — 목업 데이터 기준

| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | 미인증으로 `/dashboard/payments?status=approved` 이동 | `/login?next=%2Fdashboard%2Fpayments%3Fstatus%3Dapproved` |
| 2 | 데모 로그인 | 원래 URL로 복귀, 승인 건만 표시 |
| 3 | 사이드바 "지급 요청" 클릭 | `/dashboard/payments`, 전체 목록 첫 페이지 10건 |
| 4 | 검색창에 수령처 일부(대소문자 섞어) 입력 | 디바운스 후 URL `q` 반영, 일치 행만 표시 |
| 5 | 연체만 토글 → 브라우저 새로고침 | URL `overdue=true` 유지, 모든 행에 연체 배지 |
| 6 | 상태 "지급완료" + 연체만 | 빈 상태 안내 |
| 7 | 조건 해제 → 2페이지 이동 → 행 클릭 | 상세 페이지, breadcrumb "대시보드 / 지급 요청 / 상세" |
| 8 | `browser_navigate_back` | 2페이지·조건이 유지된 목록 |
| 9 | `/dashboard/payments/not-exist` | 상세 안 오류 안내 + 목록 링크, `/api/payments/not-exist` 404 |
| 10 | `browser_resize` 375px·1280px | 툴바·테이블·상세 레이아웃 깨짐 없음, 콘솔 오류·하이드레이션 경고 0건 |

### Phase 3: Notion 연동 교체

**목표**: 서버에서만 Notion을 조회·변환하고 60초 태그 캐시로 제공하며, Phase 2 화면이 목업 대신 Notion 샘플 데이터로 동작한다
**완료 기준**: `npm test` 통과(T042~T055), `/dashboard/payments`에 Notion 샘플 약 30건 표시, Notion에서 직접 고친 값이 새로고침 버튼으로 즉시 반영, `src/lib/notion/*`·`env.server.ts`·서버 전용 `src/lib/payments/{data,cache}.ts`가 `"use client"` 파일에서 import되지 않음(Grep), `/check`·`code-reviewer` 통과, 회귀 시나리오 통과

| ID | 작업 | 유형 | 관련 기능 | 파일 | 선행 작업 | 크기 | 완료 기준 |
|----|------|------|----------|------|----------|------|----------|
| T041 | Notion 클라이언트 생성 | 구현 | F009 | `src/lib/notion/client.ts` | T003, T004 | S | `getNotionClient()`가 같은 인스턴스 반환, 생성 시 `notionVersion` 전달 |
| T042 | T041 단위 테스트 | 테스트 | F009 | `src/lib/notion/client.test.ts` | T041 | S | `npx vitest run src/lib/notion/client.test.ts` 통과 |
| T043 | 속성 이름 상수·Notion 페이지 → `PaymentRecord` 변환 | 구현 | F001, F002, F007, F008, F009 | `src/lib/notion/payment-schema.ts`, `src/lib/notion/payment-mapper.ts` | T003, T008 | M | 픽스처 페이지가 `PaymentRecord`로 변환, 옵션명 불일치 → `"unknown"` |
| T044 | T043 단위 테스트 | 테스트 | F001, F002, F007, F008, F009 | `src/lib/notion/payment-mapper.test.ts` | T043 | S | `npx vitest run src/lib/notion/payment-mapper.test.ts` 통과 |
| T045 | Notion 오류 → HTTP 응답 매핑 | 구현 | F009 | `src/lib/notion/errors.ts` | T003 | S | `object_not_found` → 404, `rate_limited` → 503, 그 외 502, 메시지에 토큰·내부 ID 없음 |
| T046 | T045 단위 테스트 | 테스트 | F009 | `src/lib/notion/errors.test.ts` | T045 | S | `npx vitest run src/lib/notion/errors.test.ts` 통과 |
| T047 | 전체 조회·단건 조회 저장소 | 구현 | F001, F002, F009 | `src/lib/notion/payments-repository.ts` | T041, T043 | M | SDK 모킹 250건에서 커서 3회 반복 후 250건 반환, 10,000건 상한 |
| T048 | T047 단위 테스트 | 테스트 | F001, F002, F009 | `src/lib/notion/payments-repository.test.ts` | T047 | S | `npx vitest run src/lib/notion/payments-repository.test.ts` 통과 |
| T049 | 목록·집계용 60초 태그 캐시 | 구현 | F009 | `src/lib/payments/cache.ts`, (필요 시) `next.config.ts` | T002, T047 | S | 60초 안 두 번째 조회 시 Notion 호출 없음(서버 로그), 만료 함수 호출 후 재조회 |
| T050 | T049 단위 테스트 | 테스트 | F009 | `src/lib/payments/cache.test.ts` | T049 | S | `npx vitest run src/lib/payments/cache.test.ts` 통과 |
| T051 | 목업 → Notion 데이터 소스 교체 | 구현(교체) | F001, F002, F009 | `src/lib/payments/data.ts`, `src/app/api/payments/route.ts`, `src/app/api/payments/[id]/route.ts` | T006, T025, T027, T045, T049 | S | `/api/payments` 응답 `total`이 Notion 샘플 건수와 일치, Notion 오류가 404·502·503으로 응답 |
| T052 | T051 Route Handler·데이터 접근 테스트 갱신 | 테스트 | F001, F002, F009 | `src/app/api/payments/route.test.ts`, `src/app/api/payments/[id]/route.test.ts`, `src/lib/payments/data.test.ts` | T051 | S | 세 파일 `npx vitest run` 통과 (오류 매핑·캐시 사용 여부 케이스 추가) |
| T053 | T051 화면 검증 (Notion 샘플) | E2E | F001, F002, F008, F009 | - (Playwright MCP) | T052 | S | T051 파일 시나리오 1~5 통과 |
| T054 | 새로고침 API `POST /api/payments/refresh` 연결 | 구현 | F009 | `src/app/api/payments/refresh/route.ts`, `src/lib/api/payments.ts` | T029, T031, T049 | S | 새로고침 버튼 → `POST /api/payments/refresh` 200 → 목록 재조회 |
| T055 | T054 Route Handler 테스트 | 테스트 | F009 | `src/app/api/payments/refresh/route.test.ts`, `src/lib/api/payments.test.ts` | T054 | S | 두 파일 `npx vitest run` 통과 |
| T056 | T054 화면 검증 | E2E | F009 | - (Playwright MCP) | T051, T055 | S | Notion 직접 수정 → 새로고침 버튼으로 즉시 반영 (T054 파일 시나리오 1~6) |
| T057 | Phase 3 마무리 | 마무리 | - | - | T041~T056 | S | `/check`·`code-reviewer`(토큰 경계) 통과, 회귀 시나리오 통과 |

- [ ] T041 Notion 클라이언트 — `import "server-only"`, 지연 생성 싱글톤, 토큰 로그 금지
  - See: `docs/tasks/T041-notion-client.md`
- [ ] T042 T041 단위 테스트 — 케이스: 싱글톤 / `auth`·`notionVersion` 전달 / import 시 미생성 / env 누락 시 오류 (상세: T041 파일)
- [ ] T043 속성 상수·변환 — 12개 속성 이름 상수, 타입 가드(`any` 금지), rich_text 결합, date 날짜 부분, status 이름 → 코드, `last_edited_time` 보존, 쓰기 페이로드 빌더
  - See: `docs/tasks/T043-notion-payment-mapper.md`
- [ ] T044 T043 단위 테스트 — 케이스: 정상 / 속성 누락 / 빈 값 / 예상 밖 타입 / 알 수 없는 상태·분류 옵션 / datetime → 날짜 / 쓰기 페이로드 (상세: T043 파일)
- [ ] T045 Notion 오류 매핑 — `APIResponseError` 코드 → `{ status, message }`
  - See: `docs/tasks/T045-notion-error-mapping.md`
- [ ] T046 T045 단위 테스트 — 케이스: 401·403·404·400·409·429·5xx·타임아웃·일반 Error (상세: T045 파일)
- [ ] T047 저장소 — `queryAllPaymentRecords()` 100건 커서 반복·10,000건 상한·경고 로그·429 재시도, `getPaymentRecord(id)`
  - See: `docs/tasks/T047-notion-payments-repository.md`
- [ ] T048 T047 단위 테스트 — 케이스: SDK 모킹 3회 커서 / `has_more` 종료 / 상한 / 429 재시도·상한 / 오류 전파 / 단건 null (상세: T047 파일)
- [ ] T049 60초 태그 캐시 — `getCachedPaymentRecords()`(태그 `payments`), `expirePaymentsCache()`, 목록·집계 공유
  - See: `docs/tasks/T049-payments-tag-cache.md`
- [ ] T050 T049 단위 테스트 — 케이스: 태그·수명 지정 / 만료 API 호출 / 저장소 오류 전파 (상세: T049 파일)
- [ ] T051 목업 → Notion 교체 — `data.ts` 내부만 교체(목록은 캐시, 상세는 캐시 없음), Route Handler에 Notion 오류 매핑 적용. 목업 파일은 T076에서 제거
  - See: `docs/tasks/T051-switch-to-notion-source.md`
- [ ] T052 T051 테스트 갱신 — 케이스: 404·502·503 매핑 / 목록이 캐시 함수 사용 / 상세가 캐시 미사용 / 오류 본문에 원문 없음 (상세: T051 파일)
- [ ] T053 Playwright MCP 검증 — Notion 샘플로 Phase 2 회귀 시나리오 재실행, 비마스킹 계좌 경고 (상세: T051 파일)
- [ ] T054 새로고침 API 연결 — 로그인 확인 → `expirePaymentsCache()` → 클라이언트 `["payments"]` 무효화
  - See: `docs/tasks/T054-payments-refresh-api.md`
- [ ] T055 T054 테스트 — 케이스: 401 / 200 + 만료 호출 / 만료 오류 / `refreshPayments` 호출 순서·실패 시 무효화 미호출 (상세: T054 파일)
- [ ] T056 Playwright MCP 검증 — Notion에서 제목 수정 → 목록 이전 값 → 새로고침 버튼 → 새 값 (상세: T054 파일)
- [ ] T057 Phase 3 마무리 — `/check`, `code-reviewer`로 `NEXT_PUBLIC_` 없음·`server-only` 적용·토큰 로그 없음 점검

**Playwright 회귀 시나리오 (Phase 3 완료 확인)** — Notion 샘플 데이터 기준

| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | 데모 로그인 → `/dashboard/payments` | Notion 샘플 건수와 `total` 일치, `/api/payments` 200 |
| 2 | Phase 2 회귀 시나리오 3~9 재실행 | 동일하게 통과 |
| 3 | 비마스킹 계좌 샘플 건 상세 | "(가려짐)" + 경고 Alert, 응답 본문에 원문 없음(`browser_network_requests`) |
| 4 | Notion에서 샘플 1건 제목 수정 → 목록 새로고침(F5) | 60초 안에는 이전 값일 수 있음 |
| 5 | 새로고침 버튼 클릭 | `/api/payments/refresh` 200, 새 제목 표시, 성공 토스트 |
| 6 | 상세 페이지에서 F5 | 항상 최신 값 (상세는 캐시 없음) |
| 7 | `.env.local`의 `NOTION_DATA_SOURCE_ID`를 잘못된 값으로 바꾼 개발 서버에서 목록 | 오류 안내 + 재시도 버튼, 토큰·ID 노출 없음 (확인 후 원복) |

### Phase 4: 상태 변경

**목표**: 상세 페이지에서 전이 규칙에 맞는 처리만 가능하고, 결과가 Notion과 화면에 반영된다
**완료 기준**: 요청 건 승인 → Notion 상태·처리일(KST 오늘) 갱신, 승인 건 반려(사유 필수) → 반려 사유 기록, 지급완료·반려·unknown 건은 버튼 없음, 요청 → 지급완료 직접 전송 시 서버 422, Notion에서 먼저 고친 뒤 처리하면 409 안내 후 최신 상태 표시, 처리 후 목록에 즉시 반영, `npm test`·`/check`·`code-reviewer` 통과, 회귀 시나리오 통과

| ID | 작업 | 유형 | 관련 기능 | 파일 | 선행 작업 | 크기 | 완료 기준 |
|----|------|------|----------|------|----------|------|----------|
| T058 | 상태 변경 서버 로직 (재조회·충돌 검사·쓰기) | 구현 | F003, F004, F009 | `src/lib/payments/update-status.ts`, `src/lib/notion/payments-repository.ts`, `src/lib/notion/errors.ts` | T010, T012, T014, T045, T047 | M | `lastEditedTime` 불일치 → `PaymentConflictError`(쓰기 0회), 허용 전이 → `pages.update` 1회 |
| T059 | T058 단위 테스트 | 테스트 | F003, F004 | `src/lib/payments/update-status.test.ts` | T058 | S | `npx vitest run src/lib/payments/update-status.test.ts` 통과 |
| T060 | 상태 변경 API `POST /api/payments/[id]/status` | 구현 | F003, F004, F009 | `src/app/api/payments/[id]/status/route.ts` | T049, T058 | S | 성공 200 + 갱신 상세, 409·422·404·400·401 응답, 성공 시에만 캐시 만료 |
| T061 | T060 Route Handler 테스트 | 테스트 | F003, F004, F009 | `src/app/api/payments/[id]/status/route.test.ts` | T060 | S | `npx vitest run "src/app/api/payments/[id]/status/route.test.ts"` 통과 |
| T062 | 상태 변경 호출 함수·mutation 훅 | 구현 | F003, F009 | `src/lib/api/payments.ts`, `src/hooks/use-update-payment-status.ts` | T021, T029, T060 | S | 성공 시 상세 `setQueryData` + 목록·요약 무효화, 409 시 "다른 곳에서 수정" 안내 |
| T063 | T062 단위 테스트 | 테스트 | F003 | `src/lib/api/payments.test.ts` | T062 | S | `npx vitest run src/lib/api/payments.test.ts` 통과 (오류 메시지 매핑 케이스 추가) |
| T064 | 처리 버튼·확인창 (승인·지급완료) | 구현(UI) | F003, F004 | `src/components/payments/payment-actions.tsx`, `src/components/payments/payment-detail.tsx` | T035, T062 | M | 요청 건 "승인", 승인 건 "지급완료" 버튼(반려는 T066), 최종·unknown은 버튼 없이 안내 문구 |
| T065 | T064 화면 검증 | E2E | F003, F004 | - (Playwright MCP) | T051, T064 | S | T064 파일 시나리오 1~10 통과 (샘플 데이터) |
| T066 | 반려 사유 다이얼로그 | 구현(UI) | F003, F004 | `src/components/payments/reject-dialog.tsx`, `src/components/payments/payment-actions.tsx` | T064 | S | 공백 사유 제출 차단·오류 표시, 2000자 초과 차단, 성공 시 반려 사유 표시 |
| T067 | T066 화면 검증 | E2E | F003, F004 | - (Playwright MCP) | T066 | S | T066 파일 시나리오 1~8 통과 (샘플 데이터) |
| T068 | Phase 4 마무리 | 마무리 | - | - | T058~T067 | S | `/check`·`code-reviewer`(서버 측 전이 거부·쓰기 인증) 통과, 회귀 시나리오 통과 |

- [ ] T058 상태 변경 서버 로직 — 재조회 → `lastEditedTime` 비교(409) → `canTransition`(422) → `pages.update`(상태·처리일·반려 사유) → 갱신 상세 반환. `now` 주입
  - See: `docs/tasks/T058-update-status-service.md`
- [ ] T059 T058 단위 테스트 — 케이스: 허용 4전이 성공 / 불허 전이·unknown 422 / 충돌 409 / 없음 404 / 처리일 KST 경계 / 반려 사유 trim / Notion 오류 전파 (상세: T058 파일)
- [ ] T060 상태 변경 API — `getSession()` 401 → `parseBody` 400 → 서비스 → 성공 시 `expirePaymentsCache()`
  - See: `docs/tasks/T060-payment-status-api.md`
- [ ] T061 T060 Route Handler 테스트 — 케이스: 401 / 400 / 409 / 422 / 404 / 503·502 / 200 + 만료 호출 / 실패 시 만료 미호출 (상세: T060 파일)
- [ ] T062 mutation 훅 — `updatePaymentStatus(id, body)`, `getStatusUpdateErrorMessage(error)` 순수 함수, 토스트·재조회
  - See: `docs/tasks/T062-status-mutation-hook.md`
- [ ] T063 T062 단위 테스트 — 케이스: 요청 URL·본문 / 409·422·404·503·500·네트워크 오류 메시지 (상세: T062 파일)
- [ ] T064 처리 버튼·확인창 — `getAllowedActions`로 버튼 노출, `ConfirmDialog`, `isPending` 비활성화, 본문에 `lastEditedTime`
  - See: `docs/tasks/T064-payment-action-buttons.md`
- [ ] T065 Playwright MCP 검증 — 승인 → 확인창 → 토스트·배지·처리일 갱신, Notion 선수정 후 409 안내 (상세: T064 파일)
- [ ] T066 반려 사유 다이얼로그 — `ResponsiveDialog` + RHF + `zodResolver` + `form-textarea`, 글자 수 표시
  - See: `docs/tasks/T066-reject-dialog.md`
- [ ] T067 Playwright MCP 검증 — 사유 공백 차단, 정상 반려 → 반려 사유·처리일 표시, 버튼 사라짐 (상세: T066 파일)
- [ ] T068 Phase 4 마무리 — `/check`, `code-reviewer`로 서버 측 전이 거부(버튼 숨김에만 의존하지 않음)·쓰기 경로 인증·토큰 경계 점검

**Playwright 회귀 시나리오 (Phase 4 완료 확인)** — **Notion 샘플 데이터에서만** 실행

| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | 목록 상태 "요청" → 첫 행 상세 | "승인"·"반려" 버튼만 표시 |
| 2 | "승인" → 확인창 확인 | 처리 중 버튼 비활성화, 성공 토스트, 상태 "승인", 처리일 = KST 오늘, `POST .../status` 200 |
| 3 | 같은 건 "지급완료" → 확인 | 상태 "지급완료", 버튼 없음(읽기 전용 안내) |
| 4 | 다른 승인 건 "반려" → 사유 공백 제출 | 제출 차단·오류 문구 |
| 5 | 사유 입력 후 반려 | 반려 사유·처리일 표시, 버튼 없음 |
| 6 | 목록으로 이동 | 처리한 건의 상태가 즉시 갱신(새로고침 버튼 없이) |
| 7 | 요청 건 상세 열어 둔 채 Notion에서 같은 건 수정 → 웹에서 "승인" | "다른 곳에서 수정" 토스트 후 최신 상태 표시, `POST` 409 |
| 8 | 요청 상태 샘플 건 상세에서 `browser_evaluate`로 `fetch("/api/payments/<id>/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "pay", lastEditedTime }) })` 실행 (화면 버튼 우회) | 응답 422, 새로고침 후 상태 "요청" 그대로 (서버 측 전이 거부) |
| 9 | 375px에서 반려 다이얼로그 | Drawer 형태로 표시, 콘솔 오류 0건 |

### Phase 5: 대시보드 집계

**목표**: 대시보드에서 지급 현황을 한눈에 보고 카드로 조건 목록에 이동한다
**완료 기준**: `/dashboard`에 이번 주·이번 달 금액, 상태별 건수 4종, 연체 카드(0건이면 정상 색상) 표시, 상태·연체 카드 클릭 시 PRD "대시보드 카드 → 목록 조건"과 같은 URL로 이동, 상태 변경 후 대시보드 재방문 시 최신 값, 새로고침 버튼 동작, `npm test`·`/check` 통과, 회귀 시나리오 통과

| ID | 작업 | 유형 | 관련 기능 | 파일 | 선행 작업 | 크기 | 완료 기준 |
|----|------|------|----------|------|----------|------|----------|
| T069 | 요약 API `GET /api/payments/summary`·클라이언트 쿼리 옵션 | 구현 | F005, F006, F007, F009 | `src/app/api/payments/summary/route.ts`, `src/lib/api/payments.ts` | T018, T049, T051 | S | 200 응답이 `PaymentsSummary` 형태, 목록과 같은 캐시 함수 사용, 미인증 401 |
| T070 | T069 Route Handler 테스트 | 테스트 | F005, F006, F007, F009 | `src/app/api/payments/summary/route.test.ts`, `src/lib/api/payments.test.ts` | T069 | S | 두 파일 `npx vitest run` 통과 |
| T071 | 카드 → 목록 링크 빌더 | 구현 | F006, F007 | `src/lib/payments/links.ts` | T008, T029 | S | `buildPaymentsHref({ overdue: true })` = `/dashboard/payments?overdue=true` |
| T072 | T071 단위 테스트 | 테스트 | F006, F007 | `src/lib/payments/links.test.ts` | T071 | S | `npx vitest run src/lib/payments/links.test.ts` 통과 |
| T073 | 요약 카드·대시보드 페이지 교체 | 구현(UI) | F005, F006, F007, F009, F011 | `src/components/payments/payment-summary-cards.tsx`, `src/app/dashboard/page.tsx` | T054, T069, T071 | M | 하드코딩 카드·최근 주문 제거, 카드 7종 표시, 연체 1건 이상이면 경고 색상 |
| T074 | T073 화면 검증 | E2E | F005, F006, F007, F009 | - (Playwright MCP) | T073 | S | T073 파일 시나리오 1~9 통과, 375px·1280px |
| T075 | Phase 5 마무리 | 마무리 | - | - | T069~T074 | S | `/check` 통과, 회귀 시나리오 통과 |

- [ ] T069 요약 API — `getSession()` 401 → `getCachedPaymentRecords()` → `summarizePayments(records, toKstDateString(new Date()))`, `paymentsSummaryQueryOptions`(키 `["payments","summary"]`)
  - See: `docs/tasks/T069-payments-summary-api.md`
- [ ] T070 T069 테스트 — 케이스: 401 / 200 형태 / 캐시 함수 사용 / KST 날짜 경계 / Notion 오류 503·502 / 쿼리 키가 `["payments"]` 접두 (상세: T069 파일)
- [ ] T071 링크 빌더 — `use-payments-params.ts`의 키·직렬화와 일치
  - See: `docs/tasks/T071-dashboard-card-links.md`
- [ ] T072 T071 단위 테스트 — 케이스: 4개 상태 / 연체(상태 전체) / 인수 없음 / 조회 스키마 왕복 파싱 (상세: T071 파일)
- [ ] T073 요약 카드·대시보드 교체 — 금액 카드 2개(표시 전용, 중복 집계 안내), 상태 카드 4개·연체 카드 `Link`, 스켈레톤·재시도·새로고침
  - See: `docs/tasks/T073-dashboard-summary-cards.md`
- [ ] T074 Playwright MCP 검증 — 카드 값 = 목록 total, 카드 클릭 URL, 새로고침, 반응형 (상세: T073 파일)
- [ ] T075 Phase 5 마무리 — `/check` (`src/app/dashboard/page.tsx`는 Phase 6 최종 리뷰에서 함께 점검)

**Playwright 회귀 시나리오 (Phase 5 완료 확인)** — Notion 샘플 데이터 기준

| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | 로그인 직후 `/dashboard` | 카드 7종 표시, `/api/payments/summary` 200, 스켈레톤 → 값 |
| 2 | "요청 건수" 카드 클릭 | `/dashboard/payments?status=requested`, 목록 total = 카드 값 |
| 3 | 뒤로 → "연체" 카드 클릭 | `/dashboard/payments?overdue=true`, 상태 필터 "전체", total = 연체 건수 |
| 4 | 금액 카드 클릭 | 이동 없음 |
| 5 | 요청 건 1개 승인 후 `/dashboard` 재방문 | 요청 −1, 승인 +1 즉시 반영 |
| 6 | Notion에서 금액 수정 → 대시보드 새로고침 버튼 | 합계 즉시 갱신 |
| 7 | 375px·1280px | 1열 → 4열 배치, 콘솔 오류·하이드레이션 경고 0건 |

### Phase 6: 정리·통합

**목표**: 주문 예제와 개발용 목업을 걷어내고 서비스 문구로 바꾼 뒤, 기존 기능 회귀 없이 배포 가능한 상태로 만든다
**완료 기준**: `Grep "orders|Order|mock/payments"`가 `src/`에서 0건(의도적 예외는 진행 메모에 기록), 홈에 서비스명·소개 표시, 인증·설정 회귀 통과, `npm run build`(토큰 없이)·`npm test`·`npm run lint` 통과, `npm audit --omit=dev` 0건, Vercel 배포 주소에서 스모크 통과, `/check`·`code-reviewer` 통과

| ID | 작업 | 유형 | 관련 기능 | 파일 | 선행 작업 | 크기 | 완료 기준 |
|----|------|------|----------|------|----------|------|----------|
| T076 | 주문 예제·개발용 목업 제거 | 구현(제거) | F011 | 주문 파일 11개, `src/lib/mock/payments.ts`(+테스트), `src/config/examples.ts`, `src/lib/auth/session.test.ts` | T037, T051, T073 | S | `Grep "orders\|mock/payments" src/` 0건, `npm run build` 통과 |
| T077 | 기존 테스트 정리·전체 통과 | 테스트 | F011 | `src/config/examples.test.ts`, `src/lib/auth/session.test.ts` | T076 | S | `npm test` 전체 통과 |
| T078 | T076 화면 검증 | E2E | F011 | - (Playwright MCP) | T077 | S | `/dashboard/orders` 404, 예제 `usedIn` 링크 → `/dashboard/payments` (T076 파일 시나리오 1~5) |
| T079 | 홈·사이트 문구 교체 | 구현(UI 수정) | F013 | `src/config/site.ts`, `src/app/(marketing)/page.tsx` | T037 | S | 홈 Hero에 서비스명, 로그인 상태에서 대시보드 바로가기 |
| T080 | T079 화면 검증 | E2E | F013 | - (Playwright MCP) | T079 | S | T079 파일 시나리오 1~7 통과 |
| T081 | 기존 인증·설정·사이트 설정 단위 테스트 점검 | 테스트 | F010, F011, F012, F013 | `src/lib/auth/session.test.ts`, `src/lib/validations/auth.test.ts`, `src/lib/validations/settings.test.ts`, `src/config/site.test.ts`(신규) | T076, T079 | S | 네 파일 `npx vitest run` 통과, `next` 경로·오픈 리다이렉트·`siteConfig` 서비스명·메뉴 검증 포함 |
| T082 | 인증·레이아웃·설정 회귀 E2E | E2E | F010, F011, F012 | - (Playwright MCP) | T081 | S | 로그인·회원가입·로그아웃·리다이렉트·표시 이름 시나리오 통과 (T076 파일 T082 표) |
| T083 | README·CLAUDE.md 문서 갱신 | 구현(문서) | F009 | `README.md`, `CLAUDE.md` | T076 | S | README 라우트 표에 지급 요청 페이지 2개·API 5종, `orders` 언급 0건 |
| T084 | 배포 준비 | 구현(준비) | F009 | Vercel 프로젝트 설정 | T083 | S | 토큰 없이 `npm run build` 통과, Vercel에 서버 전용 변수 설정, `npm audit --omit=dev` 0건 |
| T085 | 배포 환경 스모크 | E2E | F009, F010 | - (Playwright MCP) | T084 | S | 배포 주소에서 T084 파일 시나리오 1~7 통과 |
| T086 | 최종 마무리 | 마무리 | - | - | T076~T085 | S | `/check`·`code-reviewer`(인증·토큰·캐시 만료 경로) 통과, 최종 회귀 시나리오 통과 |

- [ ] T076 주문 예제·개발용 목업 제거 — 주문 파일 11개 삭제, `src/lib/mock/payments.ts`(+테스트) 삭제, `examples.ts` `usedIn` 3곳·`session.test.ts` 경로 교체
  - See: `docs/tasks/T076-remove-orders-and-mock.md`
- [ ] T077 기존 테스트 정리 — 케이스: 예제 레지스트리 무결성 / 세션 리다이렉트 경로 / 삭제된 모듈 참조 없음 (상세: T076 파일)
- [ ] T078 Playwright MCP 검증 — `/dashboard/orders`·`/api/orders` 404, 커맨드 팔레트에 "주문" 없음, 예제 상세의 사용처 링크 (상세: T076 파일)
- [ ] T079 홈·사이트 문구 — `siteConfig.name`·`description`, Hero 문구. Stats·기능·예제·FAQ는 변경하지 않음
  - See: `docs/tasks/T079-home-copy.md`
- [ ] T080 Playwright MCP 검증 — 비로그인 "로그인" 버튼 → `/login`, 로그인 상태 대시보드 바로가기, 모바일 메뉴 (상세: T079 파일)
- [ ] T081 기존 인증·설정·사이트 설정 단위 테스트 점검 (기존 기능 활용) — 만료·위조 쿠키, `next` 오픈 리다이렉트 방지, 표시 이름 검증, `siteConfig` 서비스명·`dashboardNav`에 주문 없음 (상세: T076 파일, `site.test.ts`는 T079 파일)
- [ ] T082 Playwright MCP 회귀 (기존 기능 활용) — 로그인·회원가입·로그아웃, 보호 리다이렉트·복귀, 로그인 상태 `/login` → `/dashboard`, 표시 이름 (상세: T076 파일)
- [ ] T083 README·CLAUDE.md 갱신 — 라우트·폴더 구조·"실제 백엔드로 교체하기" 표·환경변수·테스트 설명, `CLAUDE.md`의 주문 예시 참조 교체
  - See: `docs/tasks/T083-update-docs.md`
- [ ] T084 배포 준비 — Vercel 서버 전용 변수 설정, 토큰 없는 빌드, `npm audit --omit=dev`, `.env.local` 미커밋 확인
  - See: `docs/tasks/T084-deploy-preparation.md`
- [ ] T085 Playwright MCP 배포 스모크 — 배포 주소 기준 (상세: T084 파일)
- [ ] T086 최종 마무리 — `/check`, `code-reviewer`로 전체 변경 점검

**Playwright 회귀 시나리오 (Phase 6 / MVP 완료 확인)** — 사용자 여정 전체, Notion 샘플 데이터에서만

| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | `/` 비로그인 | 서비스명·소개 문구, "로그인" 버튼 |
| 2 | 미인증 `/dashboard/payments?overdue=true` | `/login?next=...` 이동 |
| 3 | 데모 로그인 | 원래 URL 복귀, 연체 건만 표시 |
| 4 | 로그인 상태로 `/login` | `/dashboard` 이동 |
| 5 | 대시보드 카드 7종 → "승인 건수" 클릭 | 승인 목록, total 일치 |
| 6 | 행 클릭 → 상세 → "지급완료" 처리 | 토스트, 읽기 전용 전환, 처리일 KST 오늘 |
| 7 | 대시보드 재방문 | 승인 −1, 지급완료 +1 |
| 8 | 설정에서 표시 이름 변경 | 사이드바 즉시 반영 |
| 9 | 사이드바 로그아웃 | 로그아웃 후 `/dashboard` 재접근 시 로그인 페이지로 이동 |
| 10 | `/dashboard/orders` | 404 |
| 11 | 375px·1280px 전 화면 | 레이아웃 깨짐 없음, 콘솔 오류·하이드레이션 경고 0건 |

## ✅ 기능 ID ↔ 작업 매핑

| 기능 ID | 기능명 | 구현 작업 | 테스트 작업 (Vitest) | E2E 작업 (Playwright) | Phase |
|--------|--------|----------|--------------------|----------------------|-------|
| F001 | 지급 요청 목록 조회 | T008, T016, T023, T025, T029, T031, T033, T043, T047, T051 | T009, T017, T024, T026, T030, T044, T048, T052 | T032, T034, T053 | 1, 2, 3 |
| F002 | 지급 요청 상세 보기 | T008, T014, T023, T027, T029, T035, T043, T047, T051 | T015, T024, T028, T030, T044, T048, T052 | T036, T053 | 1, 2, 3 |
| F003 | 상태 변경 | T010, T021, T058, T060, T062, T064, T066 | T011, T022, T059, T061, T063 | T065, T067 | 1, 2, 4 |
| F004 | 반려 사유·처리일 기록 | T010, T012, T058, T060, T064, T066 | T011, T013, T059, T061 | T065, T067 | 1, 4 |
| F005 | 지급 예정 금액 요약 | T008, T012, T018, T069, T073 | T013, T019, T070 | T074 | 1, 5 |
| F006 | 상태별 건수 | T008, T018, T069, T071, T073 | T019, T070, T072 | T074 | 1, 5 |
| F007 | 연체 강조 | T008, T012, T014, T016, T018, T025, T031, T033, T035, T043, T069, T071, T073 | T013, T015, T017, T019, T026, T044, T070, T072 | T032, T034, T036, T074 | 1, 2, 3, 5 |
| F008 | 민감정보 마스킹 | T008, T014, T027, T035, T043 | T015, T028, T044 | T036, T053 | 1, 2, 3 |
| F009 | Notion 데이터 연동·캐시 | T001, T002, T003, T004, T006, T021, T041, T043, T045, T047, T049, T051, T054, T058, T060, T062, T069, T073, T083, T084 | T005, T022, T042, T044, T046, T048, T050, T052, T055, T061, T070 | T053, T056, T074, T085 | 0, 2, 3, 4, 5, 6 |
| F010 | 기본 인증 | 기존 기능 활용 (신규 구현 없음) | T081 | T082, T085 | 6 |
| F011 | 대시보드 레이아웃·접근 보호 | 기존 기능 활용 + T031, T035, T037, T073, T076 | T038, T077, T081 | T039, T078, T082 | 2, 5, 6 |
| F012 | 표시 이름 설정 | 기존 기능 활용 (신규 구현 없음) | T081 | T082 | 6 |
| F013 | 서비스 소개 홈 | 기존 기능 활용 + T079 (문구 수정) | T081 (`src/config/site.test.ts`) | T080 | 6 |

### 페이지 ↔ 작업

| 페이지 | 구분 | 작업 ID |
|-------|------|--------|
| 홈 페이지 | 수정 (문구) | T079, T080 |
| 로그인 페이지 | 기존 기능 활용 | T081, T082 |
| 회원가입 페이지 | 기존 기능 활용 | T081, T082 |
| 대시보드 페이지 | 수정 (집계 교체) | T073, T074 |
| 지급 요청 목록 페이지 | 신규 (주문 목록 대체) | T031, T033, T037, T054 |
| 지급 요청 상세 페이지 | 신규 | T035, T037, T064, T066 |
| 설정 페이지 | 기존 기능 활용 | T081, T082 |

### Notion 속성 ↔ 작업

| 속성 | 타입 | 도메인 필드 (예시) | 읽기/쓰기 | 목록 응답 | 작업 |
|------|------|-------------------|----------|----------|------|
| 제목 | title | `title` | 읽기 (검색 대상) | 포함 | T006, T008, T016, T043 |
| 요청자 | rich_text | `requester` | 읽기 (검색 대상) | 포함 (표 컬럼 아님) | T006, T008, T016, T043 |
| 수령처 | rich_text | `payee` | 읽기 (검색 대상) | 포함 | T006, T008, T016, T043 |
| 계좌 | rich_text | `account` + `accountMaskWarning` | 읽기 (마스킹 판별) | **제외** | T006, T008, T014, T043 |
| 금액 | number | `amount` | 읽기 (합계) | 포함 | T006, T008, T018, T043 |
| 지급 예정일 | date | `dueDate` (`YYYY-MM-DD`/null) | 읽기 (정렬·주/월·연체) | 포함 | T006, T008, T012~T018, T043 |
| 상태 | status | `status` (코드 또는 `unknown`) | 읽기·**쓰기** | 포함 | T006, T008, T010, T043, T058 |
| 분류 | select | `category` | 읽기 | 포함 | T006, T008, T043 |
| 증빙 | url | `evidence` (판정 결과) | 읽기 | 제외 | T006, T014, T043 |
| 반려 사유 | rich_text | `rejectReason` | 읽기·**쓰기** | 제외 | T006, T043, T058 |
| 처리일 | date | `processedDate` | 읽기·**쓰기** | 제외 | T006, T043, T058 |
| 메모 | rich_text | `memo` | 읽기 | 제외 | T006, T043 |
| (페이지 메타) `last_edited_time` | - | `lastEditedTime` | 읽기 (충돌 검사) | 제외 | T043, T058 |

## ⚠️ 리스크와 대응

| 리스크 | 영향 | 대응 | 관련 작업 |
|-------|------|------|----------|
| Next 16.3.8 캐시 API가 학습 지식과 다름 (태그 캐시 방식, `revalidateTag` 시그니처, Route Handler에서 즉시 만료 가능 여부, `cacheComponents` 설정이 기존 정적 페이지·`proxy.ts`에 주는 영향) `[확인 필요]` | 캐시 설계 전체, 상태 변경 후 목록 반영 | T002에서 로컬 문서로 먼저 확정하고 진행 메모에 기록. 정책과 어긋나면 `prd-generator`로 PRD 수정 후 진행 | T002, T049, T054, T060 |
| 로컬 `node_modules` 미설치로 Next 문서 확인 불가 | T002 착수 불가 | T001에서 `npm install` 먼저 실행 | T001, T002 |
| Notion 요청 속도 제한(평균 초당 약 3회로 알려짐 `[확인 필요]`) + 100건 단위 전체 조회 | 10,000건이면 요청 100회로 캐시 만료 직후 수십 초 지연 또는 429 | 목록·집계가 같은 캐시 항목 공유(60초에 최대 1회), 순차 요청·백오프(T003 결과에 따라), 429 → 503 "잠시 후 다시 시도". 샘플 규모(수십 건)에서는 영향 작음 | T003, T045, T047, T049 |
| 캐시 항목 크기 상한 `[확인 필요]` | 건수가 많으면 캐시 저장 실패로 매 요청 전체 조회 | T002에서 상한 확인, 캐시에는 필요한 필드만 담은 `PaymentRecord` 배열 저장 | T002, T049 |
| `last_edited_time` 정밀도가 분 단위일 가능성 `[확인 필요]` | 같은 분 안의 두 수정은 409로 걸러지지 않음 | T003에서 확인. 분 단위면 PRD가 수용한 "남은 경합 위험"에 포함됨을 진행 메모·README에 명시(추가 기능은 만들지 않음) | T003, T058, T083 |
| 즉시 만료 후에도 다른 인스턴스 캐시 반영 지연 (Vercel 다중 인스턴스) `[확인 필요]` | 처리 직후 목록에 이전 상태가 잠시 보일 수 있음 | 상세는 캐시하지 않음, 클라이언트는 `setQueryData` + 무효화로 즉시 갱신, 수동 새로고침 버튼 제공, T085에서 실제 확인 | T049, T054, T062, T085 |
| 상태 옵션 이름 불일치 (Notion에서 옵션명 변경·오타) | 모든 건이 "알 수 없음"으로 표시되고 처리 불가 | `/notion:setup`으로 옵션 점검, 변환 시 서버 경고 로그, 쓰기도 같은 상수 사용 | T006, T043 |
| 속성 이름·타입이 Notion에서 변경됨 | 변환 실패·빈 값 표시 | 속성 이름을 `payment-schema.ts` 한 곳에 상수로, 타입 가드 실패 시 빈 값 + 경고 로그, 오류 시 `notion-debugger` | T043, T044 |
| Notion 파일 URL 만료 (files 속성은 약 1시간) | 증빙 링크 깨짐 | PRD에서 증빙을 url 타입으로 확정. 샘플 입력 시 files 속성을 쓰지 않음 | T006, T014 |
| `NOTION_TOKEN` 클라이언트 번들 유출 | 공개 저장소·배포에서 토큰 노출 | `env.server.ts`·`lib/notion/*`·`lib/payments/{data,cache,update-status}.ts`에 `server-only`, `NEXT_PUBLIC_` 금지, `src/lib/env.ts`에 추가 금지, Phase 3·4·6 `code-reviewer` | T004, T041, T057, T068, T086 |
| 같은 `src/lib/payments/` 폴더에 공용 순수 모듈과 서버 전용 모듈이 섞임 | 클라이언트 컴포넌트가 서버 전용 모듈을 잘못 import | 서버 전용 3개 파일에 `server-only`(클라이언트 import 시 빌드 오류), 모듈 구분을 "로드맵 가정"에 명시, 마무리 리뷰에서 Grep 점검 | T023, T049, T058, T057 |
| 데모 로그인으로 누구나 상태 변경 가능 (PRD에서 수용) | 샘플 데이터 오염 | 샘플 데이터만 사용(PRD 가정), 상태 변경 E2E는 샘플에서만, 보안 강화는 백로그 | T006, T065, T084 |
| 모듈 로드 시 환경변수 검증 → 토큰 없는 환경에서 빌드 실패 | CI·로컬 빌드 실패 | 지연 평가 `getServerEnv()`로 요청 시점에만 검증 | T004, T084 |
| Vitest 설정이 `TZ=Asia/Seoul` 고정이라 UTC 운영 환경 버그를 못 잡음 | 주/월 경계·연체 판정 오류가 배포 후 드러남 | 날짜 유틸을 프로세스 시간대 비의존으로 구현, UTC instant 입력 테스트 + `TZ=UTC` 별도 실행 확인 `[확인 필요: config의 env.TZ가 외부 TZ를 덮어쓰는지]` | T012, T013 |
| 마스킹 형식 정규식이 PRD에 예시만 있음 | 정상 값이 가려지거나 원문 노출 | T014 착수 시 사용자와 확정, 판별 실패 시 "가림"이 기본(안전 쪽) | T014, T015 |
| `server-only`가 Vitest에서 import 오류를 낼 수 있음 `[확인 필요]` | 서버 모듈 테스트 불가 | 테스트에서 `vi.mock("server-only", () => ({}))` 또는 Vitest alias | T005, T042, T048, T050, T059 |
| Route Handler 테스트에서 `next/headers`(`getSession`) 사용 | 테스트 실행 오류 | `vi.mock("@/lib/auth/get-session")`으로 세션 모킹 | T026, T028, T052, T055, T061, T070 |
| 목업 → Notion 교체 시 필드 차이 | 목업에서 되던 화면이 실제 데이터에서 깨짐 | 목업이 `PaymentRecord` 타입을 그대로 사용, Notion 샘플을 목업과 같은 분포로 입력, T053에서 Phase 2 시나리오 재실행 | T006, T023, T053 |

## 📦 백로그 (MVP 이후)

- 보안 강화(허용 이메일·공유 비밀번호·쓰기 스위치·상세 조회 시 data source parent 검증 등) — 운영 전 필수. 선행: T086 완료, `src/app/api/auth/*`·`src/lib/payments/update-status.ts` 수정 지점
- 웹앱 내 지급 요청 등록·수정 폼 — Notion 입력으로 확정되어 제외. 착수 시 T043 변환의 역방향 매퍼 필요
- 승인일/지급일 별도 이력, 변경 이력 로그 — Notion 속성 추가와 T058 쓰기 확장 필요
- 알림(이메일·슬랙), 다중 사용자 권한(요청자/승인자 분리) — 실제 인증 도입 후
- 금액 합계 엑셀 내보내기, 분류별 통계 차트 — T018 집계 확장으로 가능
- 목록 내 일괄 승인 — 요청 속도 제한과 건별 충돌 검사(T058) 재설계 필요
- 지급완료·반려 건의 상태 되돌리기 — T010 전이 규칙 변경 필요
- 예제 페이지·FAQ 등 스타터킷 마케팅 메뉴 정리 — MVP 범위 밖, 현재 그대로 유지

## 📝 진행 메모

> 작업 중 확인한 사실과 결정을 여기에 기록한다. 완료 표시와 함께 보존한다.

### 미확인·미확정 (착수 시 기록)

- **T002 (Next 캐시 API)**: 미확인 — 확인 항목 5개는 `docs/tasks/T002-verify-next-cache-api.md`
- **T003 (Notion API)**: 미확인 — 확인 항목 7개는 `docs/tasks/T003-verify-notion-api.md`
- **T014 (마스킹 형식)**: 미확정 — 기본 가정 `<은행명> ***-<숫자 4자리>` (예: `국민 ***-1234`), 판별 실패 시 가림이 기본
- **T047 (10,000건 상한 초과 정책)**: 미확정 — 기본 가정 상한까지 반환 + 서버 경고 로그
- **T060 (상태 변경 메서드)**: 기본 `POST /api/payments/[id]/status`. T002 확인 시 PATCH가 더 적절하다는 근거가 있으면 변경
- **T012 (`@date-fns/tz` 도입)**: 미정 — `Intl`만으로 충분하면 도입하지 않음

### PRD ↔ 코드 불일치·확인 사항 (작업에 반영됨)

- [2026-11-15] `apiFetch`가 실패 시 `new Error(message)`만 던져 409·404를 구분할 수 없음 → T021에서 `ApiRequestError { status }` 추가
- [2026-11-15] `src/proxy.ts` matcher가 `/dashboard/:path*`, `/login`, `/signup`만 포함(`/api` 제외) → 모든 지급 요청 Route Handler에서 `getSession()` 401 직접 확인 (T025·T027·T054·T060·T069)
- [2026-11-15] `dashboard-header.tsx`의 breadcrumb이 `dashboardNav`에 없는 세그먼트를 원문 그대로 표시 → 상세 ID가 노출됨. T037에서 순수 함수로 분리해 "상세" 표시
- [2026-11-15] `src/app/dashboard/page.tsx`가 `queryOrders`를 서버에서 직접 호출 → 주문 제거(T076)는 대시보드 교체(T073) 후
- [2026-11-15] `src/config/examples.ts`의 `usedIn` 3곳(59·126·182행)이 `/dashboard/orders`를 가리킴 → T076에서 `/dashboard/payments`로 교체
- [2026-11-15] `src/lib/auth/session.test.ts`에 `/dashboard/orders?page=2` 경로 문자열(동작 무관) → T076에서 교체
- [2026-11-15] `src/lib/env.ts`는 `src/config/site.ts`를 통해 클라이언트에서도 import됨 → 서버 전용 변수는 `src/lib/env.server.ts`(T004)로 분리, `env.ts`는 수정하지 않음
- [2026-11-15] `vitest.config.mts`가 `env: { TZ: "Asia/Seoul" }` 고정 → UTC 실행 검증 방법을 T013에서 확인
- [2026-11-15] `package.json`에 `engines` 없음, `typescript`가 `^5`(PRD는 5.9 이상 하한 명시 요구) → T001
- [2026-11-15] `CLAUDE.md`·`README.md`가 주문 예시 파일(`src/lib/api/orders.ts`, `use-orders-params.ts`, `src/lib/mock/orders.ts`)을 참조 → T083에서 교체
- [2026-11-15] (신규 확인) `node_modules`가 설치되어 있지 않음 → `node_modules/next/dist/docs/`가 없어 T002 전에 T001 `npm install` 필수
- [2026-11-15] (신규 확인) `server-only` 패키지 미설치, 현재 코드에 `server-only` 사용처 없음(`session.ts`는 `node:crypto`로만 서버 전용) → T001에서 설치
- [2026-11-16] (의존성 보완) T056·T065 선행 작업에 T051 추가 — 두 E2E는 Notion 샘플 데이터 전제인데 T051 전에는 목록·상세가 목업(`data.ts`)을 사용. 특히 T058은 Notion 저장소를 직접 쓰므로 T051 전 상세에서 처리하면 목업 ID로 Notion 쓰기를 시도해 404
- [2026-11-15] (신규 결정) 도메인 타입 파일을 `src/lib/payments.ts`가 아닌 `src/lib/payments/types.ts`로 둠 (같은 이름의 파일·폴더 공존 회피), 조회 조건 스키마는 `src/lib/validations/payments-query.ts`

### 로드맵 개정 이력

- [2026-11-15] 보완된 `roadmap-generator` 규칙으로 재작성. 이전판(Phase 0~6, T001~T053) 대비: 구현 작업마다 Vitest 작업 분리, UI 작업마다 Playwright MCP 작업 추가, Phase별 회귀 시나리오 추가, 모든 작업에 완료 기준 칸 추가, 목업 우선 진행(Phase 2 목업 읽기 슬라이스 → Phase 3 Notion 교체 → Phase 6 목업 제거)으로 Phase 2·3 순서 변경, 작업 ID 전체 재부여(T001~T086), `docs/tasks/` 작업 파일 39개 신설
