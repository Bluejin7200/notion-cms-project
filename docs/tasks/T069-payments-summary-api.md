# T069: 대시보드 요약 API `GET /api/payments/summary`와 클라이언트 쿼리 옵션을 작성

> Phase 5 | 관련 기능: F005, F006, F007, F009 | 선행 작업: T018, T049, T051 | 크기: S | 상태: 대기

## 명세
- PRD F005·F006·F007: 이번 주/이번 달 지급 예정 금액, 상태별 건수, 연체 건수·금액. 날짜 판단은 서버에서 KST.
- PRD 캐시 정책: 집계도 60초 태그 캐시 → 목록과 **같은 캐시 항목**(`getCachedPaymentRecords`)을 사용해 Notion 조회를 늘리지 않는다.
- 정적 세그먼트 `summary`가 동적 `[id]`보다 우선하는지 확인 `[확인 필요]`.

## 관련 파일
- 생성: `src/app/api/payments/summary/route.ts`
- 수정: `src/lib/api/payments.ts` (`fetchPaymentsSummary`, `paymentsSummaryQueryOptions`)
- 참고: `src/lib/payments/summary.ts`(T018), `src/app/api/payments/route.ts`(T025·T051)

## 착수 전 확인
- [ ] `next16-docs`로 같은 폴더의 정적 세그먼트(`summary`·`refresh`)와 동적 세그먼트(`[id]`) 우선순위 확인

## 구현 단계
- [ ] 1. `GET`: `getSession()` 없으면 401
- [ ] 2. `getCachedPaymentRecords()` → `summarizePayments(records, toKstDateString(new Date()))` → JSON
- [ ] 3. Notion 오류는 `notionErrorResponse`
- [ ] 4. 클라이언트: `fetchPaymentsSummary()`, `paymentsSummaryQueryOptions()`(키 `paymentsKeys.summary` = `["payments", "summary"]`)

## 완료 기준
- [ ] 로그인 상태 `GET /api/payments/summary` → 200, `{ counts, unknownCount, thisWeekAmount, thisMonthAmount, overdue }`
- [ ] 요약의 상태별 건수 합 + unknownCount = 목록 전체 `total`
- [ ] 미인증 → 401

## 테스트 체크리스트
**Vitest (T070)** — `npx vitest run src/app/api/payments/summary/route.test.ts`
- [ ] 준비: 세션·`@/lib/payments/cache` 모킹(픽스처 레코드), `vi.useFakeTimers` + `setSystemTime`으로 `now` 고정
- [ ] 인증 없음 → 401, 캐시 함수 미호출
- [ ] 정상: 응답 형태와 값(픽스처 기준 기대 합계)
- [ ] 캐시 공유: `getCachedPaymentRecords` 호출, 저장소 직접 호출 없음
- [ ] 날짜: 시스템 시간 `2026-11-15T15:30:00Z`(KST 16일 월요일) → 새 주 범위로 계산
- [ ] Notion 오류: `rate_limited` → 503, 그 외 → 502
- [ ] 쿼리 키(`src/lib/api/payments.test.ts`에 추가): `paymentsSummaryQueryOptions().queryKey`가 `["payments", "summary"]` (무효화 대상 포함)

**Playwright MCP** — 화면 연결은 T074
- (UI 없음: API 단독 작업)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
