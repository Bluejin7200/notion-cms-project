# T043: Notion 속성 이름 상수와 Notion 페이지 → PaymentRecord 변환 함수를 타입 안전하게 작성

> Phase 3 | 관련 기능: F001, F002, F007, F008, F009 | 선행 작업: T003, T008 | 크기: M | 상태: 대기

## 명세
- PRD 데이터 모델 12개 속성 + 페이지 메타 `last_edited_time`을 `PaymentRecord`로 변환한다.
- PRD: 상태 옵션 이름이 4개와 다르면 "알 수 없음". 지급 예정일 빈 값 허용. 금액은 원 단위 정수.
- 속성 이름이 Notion에서 바뀌는 위험에 대비해 이름은 한 파일에 상수로 둔다. 타입 가드 실패 시 빈 값 + 서버 경고 로그 (`any` 금지).
- 변환 결과의 마스킹·증빙 판정은 하지 않는다 (T014 `views.ts`가 담당). `PaymentRecord.account`는 서버 내부에만 존재.

## 관련 파일
- 생성: `src/lib/notion/payment-schema.ts`, `src/lib/notion/payment-mapper.ts`
- 참고: `src/lib/payments/types.ts`(T008), `node_modules/@notionhq/client` 타입 정의(`PageObjectResponse`)

## 착수 전 확인
- [ ] `notion-api-docs`로 2026-03-11 버전의 속성 값 구조(title·rich_text·number·date·status·select·url) 확인
- [ ] 부분 응답(`PartialPageObjectResponse`)과 전체 응답 판별 유틸(`isFullPage`) 확인

## 구현 단계
- [ ] 1. `PAYMENT_PROPERTY_NAMES` = `{ title: "제목", requester: "요청자", payee: "수령처", account: "계좌", amount: "금액", dueDate: "지급 예정일", status: "상태", category: "분류", evidence: "증빙", rejectReason: "반려 사유", processedDate: "처리일", memo: "메모" } as const`
- [ ] 2. 속성 타입별 읽기 함수: `readTitle`, `readRichText`(`plain_text` 결합), `readNumber`(null 허용, 정수 아님 → 반올림 여부 결정), `readDate`(`start`의 앞 10자리, datetime이면 KST 날짜로 변환 여부 결정 `[확인 필요]`), `readStatusName`, `readSelectName`, `readUrl`
- [ ] 3. 각 함수는 속성이 없거나 타입이 다르면 빈 값 반환 + `console.warn("[notion] 속성 타입 불일치: <속성명>")` (값은 로그에 넣지 않음)
- [ ] 4. `toStatusCode(name): PaymentStatusOrUnknown` — `NOTION_STATUS_NAMES` 역매핑, 불일치 시 `"unknown"` + 경고
- [ ] 5. `toPaymentRecord(page: PageObjectResponse): PaymentRecord` — `id`, `last_edited_time` 보존
- [ ] 6. 쓰기용 `toStatusUpdateProperties({ status, processedDate, rejectReason? })` — 상태 옵션 이름·date·rich_text 페이로드 (T058에서 사용, 형식은 T003 결론)

## 완료 기준
- [ ] 정상 픽스처 페이지가 12개 필드 + `lastEditedTime`이 채워진 `PaymentRecord`로 변환
- [ ] 상태 이름 `"보류"` → `status: "unknown"` + 경고 로그 1회
- [ ] 두 파일에 `any`·`as unknown as` 없음, `npx tsc --noEmit` 통과

## 테스트 체크리스트
**Vitest (T044)** — `npx vitest run src/lib/notion/payment-mapper.test.ts`
- [ ] 준비: 테스트 파일 안에 `PageObjectResponse` 형태 픽스처 빌더, `console.warn` 스파이
- [ ] 정상: 전체 속성 변환, rich_text 여러 조각 결합, `lastEditedTime` 보존
- [ ] 속성 누락: "메모" 속성 자체가 없음 → `memo: ""` + 경고
- [ ] 빈 값: 금액 null, 지급 예정일 null, 분류 null, 증빙 null, 빈 rich_text 배열
- [ ] 예상 밖 타입: "금액"이 rich_text로 옴 → `amount: null` + 경고
- [ ] 알 수 없는 옵션: 상태 `"보류"` → unknown, 분류 `"기부금"` → 원문 문자열 유지
- [ ] 날짜: `"2026-11-15"` 그대로, datetime `"2026-11-15T23:30:00.000+09:00"` → 결정한 규칙대로
- [ ] 보안: 경고 로그 문자열에 속성 값(계좌 등)이 포함되지 않음
- [ ] 쓰기 페이로드: 승인 → `{ 상태: { status: { name: "승인" } }, 처리일: { date: { start: "2026-11-16" } } }`, 반려 → 반려 사유 rich_text 포함

**Playwright MCP** — 실제 데이터 표시는 T053에서 확인
- (UI 없음: 변환 계층)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
