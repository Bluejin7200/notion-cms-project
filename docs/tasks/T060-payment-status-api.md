# T060: 상태 변경 API `POST /api/payments/[id]/status`를 만들어 성공 시 캐시를 즉시 만료

> Phase 4 | 관련 기능: F003, F004, F009 | 선행 작업: T049, T058 | 크기: S | 상태: 대기

## 명세
- PRD F003·F004: 승인/지급완료/반려 처리, 반려 사유 필수. PRD 캐시 정책: 상태 변경 성공 시 해당 태그 즉시 만료.
- `proxy.ts` matcher에 `/api` 없음 → 쓰기 경로도 Route Handler에서 직접 인증 확인.
- 메서드는 기본 `POST` (ROADMAP 진행 메모). T002에서 PATCH 근거가 나오면 변경.
- 응답 코드: 200(갱신된 상세) / 400(입력) / 401 / 404 / 409(충돌) / 422(전이 불가) / 502·503(Notion).

## 관련 파일
- 생성: `src/app/api/payments/[id]/status/route.ts`
- 참고: `src/lib/api/response.ts`(`parseBody`), `src/lib/validations/payment-status.ts`(T010), `src/lib/payments/update-status.ts`(T058), `src/lib/payments/cache.ts`(T049)

## 착수 전 확인
- [ ] `next16-docs`로 동적 Route Handler `params`, Route Handler에서 만료 API 호출(T002 결론) 재확인
- [ ] `parseBody`의 실패 응답 형태 확인 (`src/lib/api/response.ts`)

## 구현 단계
- [ ] 1. `getSession()` 없으면 401
- [ ] 2. `parseBody(request, paymentStatusRequestSchema)` 실패 시 400 (첫 이슈 메시지)
- [ ] 3. `updatePaymentStatus({ id, ...body }, new Date())`
- [ ] 4. 성공 시 `expirePaymentsCache()` 후 200 + 상세
- [ ] 5. 실패 시 `notionErrorResponse(error)` (도메인 오류 404·409·422 포함), 캐시 만료 호출하지 않음

## 완료 기준
- [ ] 로그인 상태에서 요청 샘플 건에 `{ action: "approve", lastEditedTime }` POST → 200, Notion 상태 "승인"·처리일 KST 오늘
- [ ] 같은 요청을 이전 `lastEditedTime`으로 다시 보내면 409 "다른 곳에서 수정됨"
- [ ] 미인증 POST → 401, Notion 값 변화 없음

## 테스트 체크리스트
**Vitest (T061)** — `npx vitest run "src/app/api/payments/[id]/status/route.test.ts"`
- [ ] 준비: 세션·`update-status`·`cache` 모킹, `new Request(url, { method: "POST", body })`
- [ ] 인증 없음 → 401, 서비스 미호출
- [ ] 잘못된 입력(`it.each`): 본문 없음, JSON 아님, `action: "cancel"`, 반려 사유 공백, `lastEditedTime` 누락 → 400
- [ ] 서버 측 규칙 위반: 서비스가 `PaymentTransitionError` → 422, `PaymentConflictError` → 409, `PaymentNotFoundError` → 404
- [ ] Notion 오류: `rate_limited` → 503, `unauthorized` → 502
- [ ] 정상: 200 + 상세 형태, `expirePaymentsCache` 1회
- [ ] 캐시 만료: 모든 실패 경우 `expirePaymentsCache` 0회

**Playwright MCP** — 화면 연결은 T065·T067 (서버 측 거부는 Phase 4 회귀 8번)
- (UI 없음: API 단독 작업)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
