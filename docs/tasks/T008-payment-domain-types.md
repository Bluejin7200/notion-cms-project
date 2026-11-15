# T008: 지급 요청 도메인 타입·상수와 목록 조회 조건 스키마를 정의

> Phase 1 | 관련 기능: F001, F002, F005, F006, F007, F008 | 선행 작업: T001 | 크기: M | 상태: 대기

## 명세
- PRD "데이터 모델" 12개 속성 + `last_edited_time`을 도메인 타입으로 옮긴다. 서버·클라이언트 공용이므로 `@notionhq/client`·`server-only`·`node:*` import 금지.
- PRD F001: 목록 응답 `{ items, total, page, pageSize }`, 조건은 검색어·상태·연체만·페이지. F008: **목록 응답에는 계좌 필드 없음**, 상세에만 마스킹 값.
- PRD "상태 전이 규칙": 옵션 이름 불일치 → "알 수 없음".
- 파일 위치: `src/lib/payments.ts`가 아니라 `src/lib/payments/types.ts` (같은 이름의 파일·폴더 공존 회피, 진행 메모 참고). 조회 조건 Zod 스키마는 `src/lib/validations/payments-query.ts`.

## 관련 파일
- 생성: `src/lib/payments/types.ts`, `src/lib/validations/payments-query.ts`
- 참고: `src/lib/orders.ts` (상수·라벨 맵·조회 조건 스키마·응답 타입 구조), `src/lib/validations/common.ts`

## 착수 전 확인
- [ ] `context7`로 Zod 4의 `z.coerce`·`z.stringbool`(또는 `z.enum(["true"])` 변환) 사용법 확인

## 구현 단계
- [ ] 1. `PAYMENT_STATUSES = ["requested", "approved", "paid", "rejected"] as const`, `PaymentStatus`, `PaymentStatusOrUnknown = PaymentStatus | "unknown"`
- [ ] 2. `NOTION_STATUS_NAMES: Record<PaymentStatus, string>` = 요청·승인·지급완료·반려, `PAYMENT_STATUS_LABELS`(unknown → "알 수 없음"), 배지 variant 맵
- [ ] 3. `PAYMENT_CATEGORIES = ["정산금", "용역비", "경비", "기타"]`, 타입은 `string | null`(옵션 밖 값은 원문 그대로 표시 — 로드맵 가정)
- [ ] 4. `PaymentRecord`: `id, title, requester, payee, account, amount(number|null), dueDate(YYYY-MM-DD|null), status, category, evidenceUrl, rejectReason, processedDate, memo, lastEditedTime`
- [ ] 5. `PaymentListItem`(계좌·증빙·메모·반려 사유 제외 + `isOverdue`), `EvidenceLink`(`valid`/`invalid`/`none` 구분 유니온), `PaymentDetail`(마스킹 `account` + `accountMaskWarning: boolean`, `evidence: EvidenceLink`, `isOverdue`, `lastEditedTime`)
- [ ] 6. `PaymentsResponse = { items: PaymentListItem[]; total; page; pageSize }`, `PaymentsSummary = { counts: Record<PaymentStatus, number>; unknownCount; thisWeekAmount; thisMonthAmount; overdue: { count; amount } }`
- [ ] 7. `paymentsQuerySchema`: `q`(trim, 최대 100자, 기본 ""), `status`(`PAYMENT_STATUSES` 선택), `overdue`(`"true"` → `true`, 없음 → `false`, 그 외 문자열 오류), `page`(정수 ≥1, 기본 1), `pageSize`(1~50, 기본 10), `PaymentsQuery = z.output<...>`

## 완료 기준
- [ ] `paymentsQuerySchema.parse({ overdue: "true" })`가 `{ q: "", overdue: true, page: 1, pageSize: 10 }`(status 없음) 반환
- [ ] `PaymentListItem` 타입에 `account` 키가 없음 (타입 수준)
- [ ] `npx tsc --noEmit` 통과, 두 파일에 `any`·`@notionhq/client`·`server-only` 없음

## 테스트 체크리스트
**Vitest (T009)** — `npx vitest run src/lib/validations/payments-query.test.ts`
- [ ] 정상: 빈 입력 → 기본값 (`q: ""`, `overdue: false`, `page: 1`, `pageSize: 10`)
- [ ] 정상: `{ q: "  Acme  ", status: "approved", overdue: "true", page: "2" }` → trim·변환
- [ ] 실패: `status: "unknown"`·`"요청"` → 오류
- [ ] 실패: `overdue: "yes"` → 오류 (또는 정의한 규칙대로)
- [ ] 경계값(`it.each`): `page` 0·-1·1.5 실패, `pageSize` 0·51 실패 / 1·50 통과, `q` 100자 통과·101자 실패
- [ ] 라벨 맵: `PAYMENT_STATUSES` 전부와 `"unknown"`에 라벨이 존재

**Playwright MCP** — 해당 없음
- (UI 없음: 타입·스키마)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
