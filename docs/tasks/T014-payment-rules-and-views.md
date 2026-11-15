# T014: 연체·마스킹·증빙 판별 규칙과 목록/상세 응답 변환 함수를 작성

> Phase 1 | 관련 기능: F002, F007, F008 | 선행 작업: T008, T012 | 크기: M | 상태: 대기

## 명세
- PRD F007: 연체 = 지급 예정일 < 오늘 && 상태 ∈ {요청, 승인}. 반려·지급완료·알 수 없음·빈 예정일 제외. 목록 "연체만" 필터와 같은 규칙.
- PRD F008: 서버 변환 단계에서 마스킹 형식이 아닌 값은 원문 대신 가림 처리 + 경고 플래그. 목록 응답에는 계좌 없음, 상세에만 마스킹 값.
- PRD F002: 증빙은 http/https만 링크, 그 외 "유효하지 않은 링크", 없으면 "증빙 없음".
- 마스킹 형식은 PRD에 예시(`국민 ***-1234`)만 있음 → 기본 가정 `<은행명> ***-<숫자 4자리>`, **착수 시 사용자와 확정** `[확인 필요]`. 판별 실패 시 가림이 기본(안전 쪽).

## 관련 파일
- 생성: `src/lib/payments/rules.ts`, `src/lib/payments/views.ts`
- 참고: `src/lib/payments/types.ts`(T008), `src/lib/date-kst.ts`(T012)

## 착수 전 확인
- [ ] 마스킹 형식 정규식을 사용자와 확정하고 ROADMAP 진행 메모 T014 항목 갱신

## 구현 단계
- [ ] 1. `isOverdue({ status, dueDate }, today: string): boolean`
- [ ] 2. `ACCOUNT_MASK_PATTERN` (기본: `/^\S+ \*{3}-\d{4}$/`), `isMaskedAccount(value)`
- [ ] 3. `toSafeAccount(value: string): { account: string; warning: boolean }` — 빈 값 → `{ account: "", warning: false }`, 형식 일치 → 그대로, 불일치 → `{ account: "(가려짐)", warning: true }`
- [ ] 4. `toEvidenceLink(url: string | null): EvidenceLink` — 빈 값 `none`, `new URL()` 실패·프로토콜이 `http:`/`https:`가 아니면 `invalid`, 그 외 `{ kind: "valid", href }`
- [ ] 5. `views.ts`: `toListItem(record, today): PaymentListItem` — **명시적으로 필드를 골라 담기**(스프레드 금지, 계좌가 새지 않게)
- [ ] 6. `toDetail(record, today): PaymentDetail` — `toSafeAccount`·`toEvidenceLink`·`isOverdue` 적용

## 완료 기준
- [ ] `Object.keys(toListItem(record, today))`에 `account`·`evidenceUrl`·`memo`·`rejectReason`이 없음
- [ ] `toDetail({ ...record, account: "국민 123456789012" }, today)`가 `account: "(가려짐)"`, `accountMaskWarning: true`
- [ ] `toEvidenceLink("javascript:alert(1)")` = `{ kind: "invalid" }`

## 테스트 체크리스트
**Vitest (T015)** — `npx vitest run src/lib/payments/rules.test.ts src/lib/payments/views.test.ts`
- [ ] 연체 표 기반(`it.each`): 5상태 × (예정일 어제 / 오늘 / 내일 / 빈 값) — 요청·승인 + 어제만 `true`
- [ ] 경계값: 예정일 = 오늘 → 연체 아님, 월말·연말을 넘는 어제
- [ ] 마스킹 정상: `국민 ***-1234`, `카카오뱅크 ***-0001`
- [ ] 마스킹 실패: 원문 계좌번호, `***-1234`(은행명 없음), `국민 ***-123`(3자리), `국민 ***-12345`, 앞뒤 공백 → 가림 + 경고
- [ ] 마스킹 빈 값: `""` → 경고 없음
- [ ] 증빙: `https://…` valid, `http://…` valid, `javascript:alert(1)`·`ftp://…`·`data:…`·`not a url`·`//example.com` invalid, `null`·`""` none
- [ ] `toListItem`: 계좌 등 제외 키 부재, `isOverdue` 계산
- [ ] `toDetail`: 마스킹·증빙·연체 결과 반영, `lastEditedTime` 보존

**Playwright MCP** — 해당 없음
- (UI 없음: 순수 함수. 화면 표시는 T036)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
