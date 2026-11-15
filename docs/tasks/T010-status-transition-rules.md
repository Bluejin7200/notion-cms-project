# T010: 상태 전이 규칙과 상태 변경 요청 스키마를 서버·클라이언트 공용으로 정의

> Phase 1 | 관련 기능: F003, F004 | 선행 작업: T008 | 크기: S | 상태: 대기

## 명세
- PRD "상태 전이 규칙": 요청 → 승인·반려, 승인 → 지급완료·반려, 지급완료·반려·알 수 없음 → 없음. 허용되지 않은 전이는 서버에서도 거부.
- PRD F004: 반려 사유 trim 후 1~2000자 필수.
- PRD F003: 클라이언트가 `last_edited_time`을 보내고 서버가 비교.
- 클라이언트 반려 폼(T066)과 서버 Route Handler(T060)가 **같은 스키마**를 쓴다.

## 관련 파일
- 생성: `src/lib/payments/transitions.ts`, `src/lib/validations/payment-status.ts`
- 참고: `src/lib/validations/auth.ts` (한국어 오류 메시지 패턴)

## 착수 전 확인
- [ ] `context7`로 Zod 4 `z.discriminatedUnion` 사용법 확인

## 구현 단계
- [ ] 1. `PAYMENT_ACTIONS = ["approve", "pay", "reject"] as const`, `PaymentAction`, `PAYMENT_ACTION_LABELS`(승인·지급완료·반려)
- [ ] 2. `getAllowedActions(status: PaymentStatusOrUnknown): PaymentAction[]` — 표로 정의 (`Record<PaymentStatusOrUnknown, readonly PaymentAction[]>`)
- [ ] 3. `canTransition(status, action): boolean`, `getNextStatus(action): PaymentStatus` (approve → approved, pay → paid, reject → rejected)
- [ ] 4. `paymentStatusRequestSchema`: `action` 구분 유니온 — `approve`·`pay`는 `{ action, lastEditedTime }`, `reject`는 `{ action, reason, lastEditedTime }`
- [ ] 5. `reason`: `z.string().trim().min(1, "반려 사유를 입력해 주세요.").max(2000, "반려 사유는 2000자 이하로 입력해 주세요.")`
- [ ] 6. `lastEditedTime`: 비어 있지 않은 문자열 (ISO 형식 검사 여부는 T003 결과로 결정)
- [ ] 7. 반려 폼 전용 `rejectReasonFormSchema = z.object({ reason })` 별도 export (T066 폼에서 사용)

## 완료 기준
- [ ] `getAllowedActions("requested")` = `["approve", "reject"]`, `getAllowedActions("approved")` = `["pay", "reject"]`, 나머지 3상태는 `[]`
- [ ] `paymentStatusRequestSchema.safeParse({ action: "reject", reason: "   ", lastEditedTime: "x" }).success === false` 이고 메시지가 "반려 사유를 입력해 주세요."
- [ ] 두 파일에 서버 전용 import 없음

## 테스트 체크리스트
**Vitest (T011)** — `npx vitest run src/lib/payments/transitions.test.ts src/lib/validations/payment-status.test.ts`
- [ ] 표 기반(`it.each`): 5상태(요청·승인·지급완료·반려·unknown) × 3동작 = 15조합의 `canTransition` 기대값
- [ ] 정상: 요청→승인, 요청→반려, 승인→지급완료, 승인→반려
- [ ] 실패: 요청→지급완료, 지급완료→반려, 반려→승인, unknown→승인
- [ ] `getNextStatus` 3동작 매핑
- [ ] 스키마 정상: approve·pay(사유 없음), reject(사유 있음, 앞뒤 공백 trim됨)
- [ ] 스키마 실패: 알 수 없는 action, `lastEditedTime` 누락·빈 문자열, reject 사유 누락
- [ ] 경계값: 사유 공백만 → 실패, 1자 통과, 2000자 통과, 2001자 실패, 앞뒤 공백 포함 2002자이지만 trim 후 2000자 → 통과
- [ ] 오류 메시지 한국어 문구 일치

**Playwright MCP** — 해당 없음
- (UI 없음: 순수 함수·스키마. 화면 적용은 T065·T067)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
