# T016: 지급 요청 목록의 검색·상태 필터·연체만·정렬·페이징을 순수 함수로 작성

> Phase 1 | 관련 기능: F001, F007 | 선행 작업: T014 | 크기: S | 상태: 대기

## 명세
- PRD F001: 서버가 전체 데이터를 받은 뒤 검색·필터·정렬·페이징. 검색은 제목·수령처·요청자, **NFC 정규화 + 대소문자 무시 부분 일치**. 정렬은 지급 예정일 오름차순, **예정일 빈 건은 맨 뒤**. 응답 `{ items, total, page, pageSize }`.
- PRD: "연체만"은 요청·승인 상태만 남기므로 상태 필터가 지급완료·반려와 함께 켜지면 빈 목록.
- 알 수 없는 상태 건은 상태 필터 "전체"에서만 나타난다.

## 관련 파일
- 생성: `src/lib/payments/query.ts`
- 참고: `src/lib/mock/orders.ts`의 `queryOrders(query, source)` 구조, `src/lib/payments/rules.ts`, `src/lib/payments/views.ts`

## 착수 전 확인
- (외부 API 없음)

## 구현 단계
- [ ] 1. `normalizeSearchText(s) = s.normalize("NFC").toLowerCase()`
- [ ] 2. `queryPayments(query: PaymentsQuery, records: PaymentRecord[], today: string): PaymentsResponse`
- [ ] 3. 필터 순서: 검색어(정규화 후 `title`·`payee`·`requester` 중 하나라도 포함) → 상태 → `overdue`면 `isOverdue`
- [ ] 4. 정렬: `dueDate` 오름차순, `null` 맨 뒤, 동률 시 `title` → `id` 순 (안정적인 2차 키)
- [ ] 5. `(page - 1) * pageSize` 슬라이스 후 `toListItem` 적용, `total`은 필터 후 건수
- [ ] 6. 입력 배열을 변경하지 않음 (복사 후 정렬)

## 완료 기준
- [ ] `queryPayments({ q: "", overdue: false, page: 1, pageSize: 10 }, records, today)`가 `{ items, total, page: 1, pageSize: 10 }` 반환
- [ ] 예정일 빈 건이 마지막 페이지 끝에 위치
- [ ] 호출 후 원본 `records` 순서 불변

## 테스트 체크리스트
**Vitest (T017)** — `npx vitest run src/lib/payments/query.test.ts`
- [ ] 검색 정규화: NFD로 분해된 "정산"(`"정산".normalize("NFD")`) 입력이 NFC 데이터와 일치
- [ ] 대소문자: `"acme"`가 `Acme Studio` 수령처와 일치, 요청자 필드 검색
- [ ] 검색 결과 없음 → `items: []`, `total: 0`
- [ ] 상태 필터 4종 각각 해당 상태만, unknown 건은 상태 필터 시 제외·전체 시 포함
- [ ] 연체만: 요청·승인 연체 건만, 반려 연체 날짜 건 제외
- [ ] 조합: `status: "paid"` + `overdue: true` → 빈 목록
- [ ] 정렬: 예정일 오름차순, 빈 예정일 맨 뒤, 동일 예정일은 제목순
- [ ] 페이지 경계: 25건·pageSize 10 → 3페이지 5건, 범위 밖 page 4 → `items: []`, `total: 25`
- [ ] 목록 항목에 `account` 키 없음

**Playwright MCP** — 해당 없음
- (UI 없음: 순수 함수. 화면 확인은 T034)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
