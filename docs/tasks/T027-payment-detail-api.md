# T027: 지급 요청 상세 API `GET /api/payments/[id]`를 만들어 마스킹된 상세를 캐시 없이 반환

> Phase 2 | 관련 기능: F002, F008 | 선행 작업: T014, T023 | 크기: S | 상태: 대기

## 명세
- PRD F002: 전체 속성, 증빙 판정, 반려 사유, 처리일, 메모. PRD F008: 상세에만 마스킹 계좌 + 경고 플래그.
- PRD "캐시·반영 정책": 상세는 캐시하지 않음 (항상 최신).
- PRD 사용자 여정: 없는 건 → 상세 페이지 안에서 오류 안내 → API는 404 "지급 요청을 찾을 수 없습니다."

## 관련 파일
- 생성: `src/app/api/payments/[id]/route.ts`
- 참고: `src/app/api/payments/route.ts`(T025), `src/lib/payments/views.ts`의 `toDetail`

## 착수 전 확인
- [ ] `next16-docs`로 동적 Route Handler의 두 번째 인수 `{ params }` 형태(Promise 여부) 확인 (T002 결론)

## 구현 단계
- [ ] 1. `getSession()` 없으면 401
- [ ] 2. `const { id } = await params` (T002 결론에 맞춤)
- [ ] 3. `findPaymentRecord(id)` → `null`이면 `apiError("지급 요청을 찾을 수 없습니다.", 404)`
- [ ] 4. `toDetail(record, toKstDateString(new Date()))` 반환 (원문 `account` 대신 마스킹 결과만)

## 완료 기준
- [ ] 존재 ID → 200, 응답 `account`가 마스킹 값 또는 `"(가려짐)"`, `accountMaskWarning` 포함
- [ ] 없는 ID → 404 `{ message: "지급 요청을 찾을 수 없습니다." }`
- [ ] 미인증 → 401

## 테스트 체크리스트
**Vitest (T028)** — `npx vitest run "src/app/api/payments/[id]/route.test.ts"` (경로의 `[]` 때문에 따옴표 사용)
- [ ] 준비: 세션·`data.ts` 모킹, `params`를 `Promise.resolve({ id })`로 전달
- [ ] 인증 없음 → 401
- [ ] 없는 ID → 404 + 메시지
- [ ] 정상: 마스킹 형식 계좌 → 그대로, `accountMaskWarning: false`
- [ ] 보안: 비마스킹 계좌 → `"(가려짐)"` + `true`, 응답 JSON 문자열에 원문 계좌번호가 없음
- [ ] 증빙 판정: valid·invalid·none 각각, 연체 여부
- [ ] `lastEditedTime` 포함

**Playwright MCP** — 화면 연결은 T036에서 확인
- (UI 없음: API 단독 작업)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
