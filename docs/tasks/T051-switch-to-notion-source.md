# T051: 서버 데이터 접근 함수를 목업에서 Notion(캐시 목록·비캐시 상세)으로 교체하고 Route Handler에 오류 매핑 적용

> Phase 3 | 관련 기능: F001, F002, F009 | 선행 작업: T006, T025, T027, T045, T049 | 크기: S | 상태: 대기

## 명세
- T023에서 만든 `src/lib/payments/data.ts`의 내부만 교체한다. 화면·Route Handler의 데이터 흐름은 그대로.
- PRD "캐시·반영 정책": 목록 → `getCachedPaymentRecords()`(60초 태그 캐시), 상세 → `getPaymentRecord(id)`(캐시 없음).
- Notion 오류를 T045 매핑으로 404·409·502·503 응답.
- 목업 파일(`src/lib/mock/payments.ts`)은 이 작업 후 import되지 않지만 **삭제는 T076**에서 한다 (Phase 3 문제 발생 시 되돌리기용).
- 전제: T006 완료(`.env.local`에 토큰·data source ID, 샘플 데이터).

## 관련 파일
- 수정: `src/lib/payments/data.ts`, `src/app/api/payments/route.ts`, `src/app/api/payments/[id]/route.ts`
- 참고: `src/lib/payments/cache.ts`(T049), `src/lib/notion/payments-repository.ts`(T047), `src/lib/notion/errors.ts`(T045)

## 착수 전 확인
- [ ] `notion-api-docs`로 `pages.retrieve` 오류 코드(없는 ID·잘못된 형식) 재확인
- [ ] `/notion:setup`으로 연결 상태 재점검

## 구현 단계
- [ ] 1. `listPaymentRecords = getCachedPaymentRecords`, `findPaymentRecord = getPaymentRecord`로 교체 (목업 import 제거)
- [ ] 2. 목록·상세 Route Handler에서 데이터 호출을 `try/catch`로 감싸 `notionErrorResponse(error)` 반환
- [ ] 3. 개발 서버에서 `/api/payments` 응답 `total`이 Notion 샘플 건수와 같은지 확인
- [ ] 4. 연동 오류 시 `notion-debugger`로 401/403/404/빈 목록 진단

## 완료 기준
- [ ] `GET /api/payments`의 `total`이 Notion 샘플 건수와 일치
- [ ] `Grep "mock/payments" src/lib/payments src/app` 0건
- [ ] Notion 토큰을 일부러 틀리게 한 개발 서버에서 `/api/payments` → 502 + "Notion 연결을 확인해 주세요." (확인 후 원복)

## 테스트 체크리스트
**Vitest (T052)** — `npx vitest run src/app/api/payments/route.test.ts "src/app/api/payments/[id]/route.test.ts"`
- [ ] 준비: `vi.mock("@/lib/payments/data")` 유지(교체 후에도 같은 모킹 지점)
- [ ] 목록: 데이터 함수가 `APIResponseError(rate_limited)` throw → 503, `unauthorized` → 502
- [ ] 상세: `null` → 404, `restricted_resource` throw → 502, 일반 Error → 502
- [ ] 보안: 오류 응답 본문에 원문 오류 메시지 없음
- [ ] `data.ts` 단위: 목록은 `getCachedPaymentRecords`, 상세는 `getPaymentRecord` 호출 (캐시 미사용) — `src/lib/payments/data.test.ts`에 추가
- [ ] 기존 T026·T028 케이스 전부 계속 통과

**Playwright MCP (T053)** — 전제: `npm run dev`, 데모 로그인, **Notion 샘플 데이터**
| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | `/dashboard/payments` | Notion 샘플 행 표시, `total`이 Notion 건수와 일치, `/api/payments` 200 |
| 2 | Phase 2 회귀 시나리오 3~9 재실행 | 목업 때와 동일하게 통과 (검색·필터·연체만·페이지·상세·없는 ID) |
| 3 | 비마스킹 계좌 샘플 상세 | "(가려짐)" + 경고, 응답 본문에 원문 없음 |
| 4 | `javascript:` 증빙 샘플 상세 | "유효하지 않은 링크" |
| 5 | Notion에서 상태 옵션명이 4개 밖인 샘플(있다면) | "알 수 없음" 배지 |
- [ ] 콘솔 오류 0건, 375px·1280px 확인

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
