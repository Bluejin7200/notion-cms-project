# T029: 지급 요청 클라이언트 호출 함수·쿼리 옵션과 목록 조건 URL 동기화 훅을 작성

> Phase 2 | 관련 기능: F001, F002 | 선행 작업: T008, T021 | 크기: S | 상태: 대기

## 명세
- PRD F001·목록 페이지: 검색어·상태·연체만·페이지를 URL과 동기화 (nuqs).
- PRD "캐시·반영 정책": 상태 변경 성공 시 클라이언트 쿼리 무효화 → 모든 지급 요청 쿼리 키를 `["payments", ...]` 접두로 통일.
- `refreshPayments()`는 이 단계에서 **클라이언트 쿼리 무효화만** 하고, T054에서 서버 캐시 만료 API 호출을 추가한다.

## 관련 파일
- 생성: `src/lib/api/payments.ts`, `src/hooks/use-payments-params.ts`
- 참고: `src/lib/api/orders.ts`, `src/hooks/use-orders-params.ts`

## 착수 전 확인
- [ ] `context7`로 nuqs 2 `parseAsBoolean`·`parseAsStringLiteral`·`useQueryStates` 옵션(`history`, `clearOnDefault`) 확인
- [ ] `context7`로 TanStack Query 5 `queryOptions`·`keepPreviousData` 확인

## 구현 단계
- [ ] 1. `paymentsKeys = { all: ["payments"], list: (q) => ["payments", "list", q], detail: (id) => ["payments", "detail", id], summary: ["payments", "summary"] }`
- [ ] 2. `toPaymentsSearchParams(query): string` 순수 함수 — `page`·`pageSize` 항상, `q`·`status`는 값 있을 때, `overdue`는 `true`일 때만
- [ ] 3. `fetchPayments(query)`, `paymentsQueryOptions(query)`(`placeholderData: keepPreviousData`)
- [ ] 4. `fetchPaymentDetail(id)`(`encodeURIComponent`), `paymentDetailQueryOptions(id)`
- [ ] 5. `refreshPayments(queryClient)` — `invalidateQueries({ queryKey: paymentsKeys.all })`
- [ ] 6. `usePaymentsParams()` — `q`(`parseAsString.withDefault("")`), `status`(`parseAsStringLiteral(PAYMENT_STATUSES)`), `overdue`(`parseAsBoolean.withDefault(false)`), `page`(`parseAsInteger.withDefault(1)`), `{ history: "replace" }`. 기본값은 URL에서 제거되는지 확인

## 완료 기준
- [ ] `toPaymentsSearchParams({ q: "", overdue: true, page: 2, pageSize: 10 })` = `"page=2&pageSize=10&overdue=true"`
- [ ] 모든 쿼리 키가 `"payments"`로 시작
- [ ] `npx tsc --noEmit` 통과

## 테스트 체크리스트
**Vitest (T030)** — `npx vitest run src/lib/api/payments.test.ts`
- [ ] 직렬화(`it.each`): 기본값만 / `q` 포함(한글·공백 인코딩) / `status` 포함 / `overdue: false`는 생략 / 전체 조합
- [ ] 쿼리 키: `list`·`detail`·`summary`가 `paymentsKeys.all` 접두를 가짐
- [ ] `fetchPayments`: `fetch` 스텁으로 호출 URL `/api/payments?...` 확인
- [ ] `fetchPaymentDetail`: 특수문자 ID 인코딩, 404 응답 시 `ApiRequestError` `status` 404 전달
- [ ] `refreshPayments`: `invalidateQueries`가 `["payments"]`로 호출됨 (QueryClient 모킹)

**Playwright MCP** — URL 동기화는 T032에서 확인
- (UI 없음: 훅·호출 함수만 작성)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
