# T058: 상태 변경 서버 로직(재조회 → 충돌 검사 → 전이 검사 → Notion 쓰기)을 작성

> Phase 4 | 관련 기능: F003, F004, F009 | 선행 작업: T010, T012, T014, T045, T047 | 크기: M | 상태: 대기

## 명세
- PRD F003: 처리 직전 서버가 건을 재조회해 전이 규칙을 검사하고, 클라이언트가 보낸 `last_edited_time`과 다르면 409 "다른 곳에서 수정됨". 재조회~쓰기 사이 남은 경합은 수용.
- PRD 상태 전이 규칙: 허용되지 않은 전이(알 수 없음 포함)는 서버에서도 거부.
- PRD F004: 모든 처리 시 처리일 = KST 오늘(날짜만), 반려 시 사유(trim 값) 기록. 승인일은 별도 보존하지 않음.
- `last_edited_time` 정밀도가 분 단위이면 같은 분 안의 수정은 걸러지지 않는다 (T003 결론, PRD가 수용한 위험).

## 관련 파일
- 생성: `src/lib/payments/update-status.ts`
- 수정: `src/lib/notion/payments-repository.ts` (`updatePaymentPage` 추가), `src/lib/notion/errors.ts` (도메인 오류 매핑 추가)
- 참고: `src/lib/payments/transitions.ts`(T010), `src/lib/notion/payment-mapper.ts`의 `toStatusUpdateProperties`(T043)

## 착수 전 확인
- [ ] `notion-api-docs`로 `pages.update` 속성 페이로드(status 옵션 이름, date `start`만, rich_text 2000자 제한) 확인
- [ ] `pages.update` 응답이 갱신된 전체 페이지인지 확인 (재조회 필요 여부)

## 구현 단계
- [ ] 1. 도메인 오류 클래스: `PaymentNotFoundError`(404), `PaymentConflictError`(409 "다른 곳에서 수정됨"), `PaymentTransitionError`(422 "현재 상태에서는 처리할 수 없습니다.") — `errors.ts`의 매핑에 추가
- [ ] 2. `updatePaymentPage(id, properties)` — `pages.update` 호출 후 `toPaymentRecord` 반환 (429 재시도 정책은 T047과 동일)
- [ ] 3. `updatePaymentStatus(input: PaymentStatusRequest & { id }, now: Date): Promise<PaymentDetail>`
- [ ] 4. 순서: (1) `getPaymentRecord(id)` → null이면 NotFound (2) `record.lastEditedTime !== input.lastEditedTime` → Conflict (3) `!canTransition(record.status, input.action)` → Transition (4) `toStatusUpdateProperties({ status: getNextStatus(action), processedDate: toKstDateString(now), rejectReason })` → `updatePaymentPage` (5) `toDetail(updated, today)` 반환
- [ ] 5. 승인·지급완료 처리 시 반려 사유는 건드리지 않음 (기존 값 유지)
- [ ] 6. `import "server-only"`

## 완료 기준
- [ ] `lastEditedTime` 불일치 시 `pages.update` 미호출 + `PaymentConflictError`
- [ ] 요청 → 지급완료 입력 시 `pages.update` 미호출 + `PaymentTransitionError`
- [ ] 허용 전이 시 `pages.update` 정확히 1회, 처리일이 `toKstDateString(now)`

## 테스트 체크리스트
**Vitest (T059)** — `npx vitest run src/lib/payments/update-status.test.ts`
- [ ] 준비: `vi.mock("@/lib/notion/payments-repository")`(`getPaymentRecord`·`updatePaymentPage`), `server-only` 모킹
- [ ] 정상(`it.each`): 요청→승인, 요청→반려, 승인→지급완료, 승인→반려 — 쓰기 페이로드의 상태 옵션 이름 확인
- [ ] 불허 전이(`it.each`): 요청→지급완료, 지급완료→반려, 반려→승인, unknown→승인 → `PaymentTransitionError`, 쓰기 0회
- [ ] 충돌: `lastEditedTime` 불일치 → `PaymentConflictError`, 쓰기 0회 (전이 검사보다 먼저)
- [ ] 없음: `getPaymentRecord` → null → `PaymentNotFoundError`
- [ ] 날짜 경계: `now = 2026-11-15T15:30:00Z` → 처리일 `"2026-11-16"`, `now = 2026-11-15T14:59:59Z` → `"2026-11-15"`
- [ ] 반려 사유: trim된 값 기록, 승인 시 반려 사유 속성이 페이로드에 없음
- [ ] Notion 오류: `updatePaymentPage`가 `rate_limited`·`conflict_error` throw → 그대로 전파
- [ ] 반환값: 갱신된 상세(마스킹 적용)

**Playwright MCP** — 화면 연결은 T065·T067
- (UI 없음: 서버 로직)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
