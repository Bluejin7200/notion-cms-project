# T071: 대시보드 카드 → 목록 조건 링크 빌더를 목록 URL 파라미터와 같은 규칙으로 작성

> Phase 5 | 관련 기능: F006, F007 | 선행 작업: T008, T029 | 크기: S | 상태: 대기

## 명세
- PRD "대시보드 카드 → 목록 조건": 요청/승인/지급완료/반려 건수 → 상태 = 해당 상태, 연체 → 연체만 켜짐·상태 전체, 이번 주/이번 달 금액 → 이동 없음.
- 링크 쿼리 키·값은 `use-payments-params.ts`(T029)와 일치해야 목록 툴바가 그 상태로 열린다.

## 관련 파일
- 생성: `src/lib/payments/links.ts`
- 참고: `src/hooks/use-payments-params.ts`, `src/lib/api/payments.ts`의 `toPaymentsSearchParams`

## 착수 전 확인
- [ ] nuqs `parseAsBoolean`의 직렬화 값(`true`) 확인 (T029와 동일)

## 구현 단계
- [ ] 1. `PAYMENTS_LIST_PATH = "/dashboard/payments"`
- [ ] 2. `buildPaymentsHref({ status?, overdue? }): string` — `status`만 → `?status=<code>`, `overdue: true` → `?overdue=true`(status 없음), 인수 없음 → 경로만
- [ ] 3. `page`는 넣지 않음 (기본 1)
- [ ] 4. `DASHBOARD_CARD_LINKS` 상수: 상태 4종·연체 카드별 href

## 완료 기준
- [ ] `buildPaymentsHref({ status: "requested" })` = `/dashboard/payments?status=requested`
- [ ] `buildPaymentsHref({ overdue: true })` = `/dashboard/payments?overdue=true`
- [ ] 생성된 링크로 목록을 열면 툴바가 같은 상태로 표시 (T074에서 확인)

## 테스트 체크리스트
**Vitest (T072)** — `npx vitest run src/lib/payments/links.test.ts`
- [ ] 표 기반(`it.each`): 4개 상태 → 각 `?status=<code>`
- [ ] 연체: `{ overdue: true }` → `?overdue=true`, `status` 파라미터 없음
- [ ] 경계값: 인수 없음·`{ overdue: false }` → `/dashboard/payments`
- [ ] 일관성: `buildPaymentsHref`의 쿼리 문자열을 `paymentsQuerySchema`로 파싱하면 같은 조건 (`status`·`overdue`)

**Playwright MCP** — 카드 이동은 T074
- (UI 없음: 순수 함수)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
