# T023: 개발용 지급 요청 목업 데이터와 서버 데이터 접근 함수를 만들어 Notion 준비 전 화면 개발을 가능하게 함

> Phase 2 | 관련 기능: F001, F002 | 선행 작업: T008, T012 | 크기: S | 상태: 대기

## 명세
- Notion 토큰·DB 공유·샘플 데이터(T006)는 외부 준비라 늦어질 수 있다. 목업으로 Phase 2의 목록·상세 화면을 먼저 완성하고 **T051에서 Notion으로 교체, T076에서 목업 제거**한다.
- Route Handler는 데이터를 오직 `src/lib/payments/data.ts`를 통해서만 얻는다 → 교체 시 이 파일 내부만 바뀐다.
- 목업 날짜는 실행일(KST 오늘) 기준 상대값으로 만들어 연체·이번 주 건이 항상 존재하게 한다.
- 분포는 T006 Notion 샘플과 같게 맞춘다.

## 관련 파일
- 생성: `src/lib/mock/payments.ts`, `src/lib/payments/data.ts`
- 참고: `src/lib/mock/orders.ts` (시드 고정 생성 방식), `src/lib/date-kst.ts`의 `addDays`

## 착수 전 확인
- [ ] T002 결론의 `server-only` 사용 방법 (`data.ts`에 적용)

## 구현 단계
- [ ] 1. `createMockPaymentRecords(today: string): PaymentRecord[]` — 30건 고정 목록(난수 없이 배열로 정의), 날짜는 `addDays(today, offset)`
- [ ] 2. 분포: 상태 요청 10·승인 8·지급완료 7·반려 5, 연체 요청 2·승인 2, 연체 날짜 반려 1, 빈 예정일 2, 이번 주·이번 달·다음 달 건, 비마스킹 계좌 1, 증빙 `https`·`http`·`javascript:`·빈 값, `Acme Studio` 수령처, 반려 사유·메모 있는 건, 상태 `unknown` 1건
- [ ] 3. `id`는 Notion 페이지 ID 형태(UUID) 고정값, `lastEditedTime`은 고정 ISO 문자열
- [ ] 4. `src/lib/payments/data.ts`(`import "server-only"`): `listPaymentRecords(): Promise<PaymentRecord[]>`, `findPaymentRecord(id): Promise<PaymentRecord | null>` — 내부에서 `createMockPaymentRecords(toKstDateString(new Date()))` 사용
- [ ] 5. 파일 상단 주석: "개발용 목업 — T051에서 Notion으로 교체, T076에서 삭제"

## 완료 기준
- [ ] `await listPaymentRecords()`가 30건 반환
- [ ] `await findPaymentRecord("없는-ID")`가 `null`
- [ ] 목업 파일이 `"use client"` 파일에서 import되지 않음 (Grep)

## 테스트 체크리스트
**Vitest (T024)** — `npx vitest run src/lib/mock/payments.test.ts`
- [ ] 정상: `createMockPaymentRecords("2026-11-15")` 30건, `id` 중복 없음
- [ ] 결정성: 같은 `today`면 같은 결과 (`toEqual`)
- [ ] 분포: 상태별 건수, `isOverdue` 4건 이상, 빈 예정일 2건, 비마스킹 계좌 1건, `javascript:` 증빙 1건, unknown 1건 존재
- [ ] 상대 날짜: `today`가 월말(`2026-11-30`)이어도 날짜 문자열이 모두 유효한 `YYYY-MM-DD`
- [ ] `data.ts`: `findPaymentRecord`가 존재 ID → 레코드, 없는 ID → `null` (`server-only` 모킹 필요 시 `vi.mock`)

**Playwright MCP** — 해당 없음
- (UI 없음: 데이터 소스. 화면 확인은 T034·T036)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
