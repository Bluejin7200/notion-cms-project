# T054: 새로고침 API `POST /api/payments/refresh`를 만들어 목록·대시보드 새로고침 버튼이 서버 캐시까지 비우게 함

> Phase 3 | 관련 기능: F009 | 선행 작업: T029, T031, T049 (T056 E2E는 T051 필요) | 크기: S | 상태: 대기

## 명세
- PRD "캐시·반영 정책": Notion에서 직접 고친 내용은 최대 60초 늦게 반영, 목록·대시보드의 **새로고침 버튼**으로 수동 갱신 ("캐시 무시 재조회").
- T031 툴바의 새로고침 버튼은 지금 클라이언트 쿼리만 무효화한다 → 서버 태그 캐시 만료를 먼저 호출하도록 `refreshPayments`를 바꾼다.
- T002 결과 Route Handler에서 즉시 만료가 불가하면 대안(GET에 캐시 우회 경로 등)을 진행 메모에 기록 후 적용 `[확인 필요]`.

## 관련 파일
- 생성: `src/app/api/payments/refresh/route.ts`
- 수정: `src/lib/api/payments.ts` (`refreshPayments`)
- 참고: `src/lib/payments/cache.ts`(T049), `src/components/payments/payments-toolbar.tsx`(T031)

## 착수 전 확인
- [ ] `next16-docs`로 Route Handler에서 만료 API 호출 가능 여부(T002 결론) 재확인

## 구현 단계
- [ ] 1. `POST`: `getSession()` 없으면 401 → `expirePaymentsCache()` → `{ ok: true }`
- [ ] 2. `GET` 등 다른 메서드는 정의하지 않음 (405는 Next 기본 동작 확인)
- [ ] 3. `refreshPayments(queryClient)`: `apiPost("/api/payments/refresh")` → `invalidateQueries({ queryKey: ["payments"] })`
- [ ] 4. 툴바 버튼 동작(비활성화·토스트)은 그대로, 실패 시 오류 토스트

## 완료 기준
- [ ] 새로고침 버튼 클릭 → `POST /api/payments/refresh` 200 → `GET /api/payments` 재요청
- [ ] 미인증 `POST /api/payments/refresh` → 401
- [ ] Notion 직접 수정 후 60초 안이라도 버튼 클릭으로 새 값 표시

## 테스트 체크리스트
**Vitest (T055)** — `npx vitest run src/app/api/payments/refresh/route.test.ts`
- [ ] 준비: 세션·`@/lib/payments/cache` 모킹
- [ ] 인증 없음 → 401, `expirePaymentsCache` 미호출
- [ ] 정상 → 200 `{ ok: true }`, `expirePaymentsCache` 1회
- [ ] 만료 함수 오류 → 500대 응답 + 한국어 메시지
- [ ] `refreshPayments`(`src/lib/api/payments.test.ts`에 추가): `POST` 호출 후 `invalidateQueries(["payments"])` 순서, POST 실패 시 무효화 미호출·오류 전파

**Playwright MCP (T056)** — 전제: `npm run dev`, 데모 로그인, **Notion 샘플 데이터에서만**
| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | `/dashboard/payments` 열기 | 목록 표시 |
| 2 | Notion MCP로 샘플 1건 제목 수정 | - |
| 3 | 브라우저 새로고침(F5) 즉시 | 60초 안이면 이전 제목 (캐시 동작) |
| 4 | 새로고침 버튼 클릭 | `POST /api/payments/refresh` 200, 이어서 `GET /api/payments` 200, 새 제목 표시, 성공 토스트 |
| 5 | 버튼 클릭 중 | 버튼 비활성화(중복 클릭 방지) |
| 6 | 테스트 후 Notion 제목 원복 | - |
- [ ] 콘솔 오류 0건

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
