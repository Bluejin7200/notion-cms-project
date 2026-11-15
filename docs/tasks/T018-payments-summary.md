# T018: 대시보드용 상태별 건수·주/월 지급 예정 금액·연체 집계를 순수 함수로 작성

> Phase 1 | 관련 기능: F005, F006, F007 | 선행 작업: T012, T014 | 크기: S | 상태: 대기

## 명세
- PRD F005: 이번 주(월~일)·이번 달 지급 예정 금액 합계, 상태 요청·승인 건 기준. 범위 안 연체 건도 포함 → 연체 카드와 **중복 집계**. 예정일 빈 건 제외.
- PRD F006: 요청·승인·지급완료·반려 건수.
- PRD F007: 연체 건수·금액 (요청·승인 + 예정일 < 오늘).
- 금액이 `null`인 건은 합계에 0으로 더한다 (건수에는 포함). 알 수 없는 상태는 `unknownCount`로 따로 세고 카드에는 표시하지 않는다.

## 관련 파일
- 생성: `src/lib/payments/summary.ts`
- 참고: `src/lib/date-kst.ts`, `src/lib/payments/rules.ts`

## 착수 전 확인
- (외부 API 없음)

## 구현 단계
- [ ] 1. `summarizePayments(records: PaymentRecord[], today: string): PaymentsSummary`
- [ ] 2. 상태별 건수(4종 + `unknownCount`)
- [ ] 3. `getKstWeekRange(today)`·`getKstMonthRange(today)` 범위에 `dueDate`가 들어가고 상태가 요청·승인인 건의 `amount` 합
- [ ] 4. 연체: `isOverdue` 통과 건의 수와 금액 합
- [ ] 5. 한 번의 순회로 계산

## 완료 기준
- [ ] 빈 배열 → 모든 값 0
- [ ] 이번 주 범위 안의 어제 예정 요청 건(연체)이 `thisWeekAmount`와 `overdue.amount`에 모두 포함됨
- [ ] 반환 타입이 T008의 `PaymentsSummary`와 일치

## 테스트 체크리스트
**Vitest (T019)** — `npx vitest run src/lib/payments/summary.test.ts`
- [ ] 정상: 상태별 건수 4종 + unknownCount
- [ ] 중복 집계: 이번 주 안 연체 요청 건 → 주 합계·월 합계·연체 금액 모두 포함
- [ ] 제외: 반려·지급완료 건은 주/월 합계·연체에서 제외, 빈 예정일 건은 합계·연체 제외(건수에는 포함)
- [ ] 경계값: 주 시작(월)·끝(일) 날짜 포함, 다음 주 월요일 제외, 월말 포함·다음 달 1일 제외
- [ ] `today`가 일요일·월요일·월말·연말일 때 (`it.each`)
- [ ] 금액 `null` 건 → 합계 0 기여, 금액 0원
- [ ] 연체 0건 → `{ count: 0, amount: 0 }`

**Playwright MCP** — 해당 없음
- (UI 없음: 순수 함수. 화면 확인은 T074)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
