# T076: 주문 예제와 개발용 지급 요청 목업을 제거하고 남은 주문 참조를 지급 요청으로 교체

> Phase 6 | 관련 기능: F011 | 선행 작업: T037, T051, T073 | 크기: S | 상태: 대기

## 명세
- PRD 전제: 기존 "주문" 예제 화면은 지급 요청 화면이 대체 (주문 메뉴·페이지·목업 데이터 제거, 목록 패턴만 재사용).
- 개발용 지급 요청 목업(T023)은 T051 이후 사용되지 않는다 → 함께 제거.
- 이 작업 파일은 Phase 6의 기존 기능 회귀 테스트(T077·T081·T082)도 함께 관리한다.

## 관련 파일
- 삭제: `src/lib/orders.ts`, `src/lib/orders.test.ts`, `src/lib/mock/orders.ts`, `src/lib/mock/orders.test.ts`, `src/lib/api/orders.ts`, `src/app/api/orders/route.ts`, `src/hooks/use-orders-params.ts`, `src/components/orders/order-status-badge.tsx`, `src/components/orders/orders-table.tsx`, `src/components/orders/orders-toolbar.tsx`, `src/app/dashboard/orders/page.tsx`, `src/lib/mock/payments.ts`, `src/lib/mock/payments.test.ts` (빈 `src/lib/mock/`·`src/components/orders/` 폴더 정리)
- 수정: `src/config/examples.ts` (`usedIn` 59·126·182행), `src/lib/auth/session.test.ts` (`/dashboard/orders?page=2` 문자열)
- 참고: `src/config/examples.test.ts`

## 착수 전 확인
- [ ] `Grep "orders|Order|mock/payments" src/`로 삭제 전 참조 목록 확보 (대시보드는 T073에서 이미 제거되었는지 확인)

## 구현 단계
- [ ] 1. 위 삭제 목록 삭제
- [ ] 2. `examples.ts` `usedIn`: `/dashboard/orders` → `/dashboard/payments`, 라벨 "주문 목록 …" → "지급 요청 목록 …" (59행 "대시보드 로딩·오류 경계"는 href만)
- [ ] 3. `session.test.ts`: `/dashboard/orders?page=2` → `/dashboard/payments?page=2`
- [ ] 4. `Grep "orders|Order|mock/payments" src/` 0건 확인 (의도적 예외가 있으면 진행 메모에 기록)
- [ ] 5. `npm run build`, `npm run lint`

## 완료 기준
- [ ] `Grep "orders|Order|mock/payments" src/` 0건
- [ ] `npm run build`·`npm run lint` 통과
- [ ] `src/lib/mock/` 폴더 없음

## 테스트 체크리스트
**Vitest (T077)** — `npm test`
- [ ] 예제 레지스트리 무결성(`src/config/examples.test.ts`) 통과 — `usedIn` 변경 후
- [ ] 세션 리다이렉트 경로 테스트가 `/dashboard/payments?page=2`로 통과
- [ ] 삭제된 모듈을 import하는 테스트 없음 (전체 실행 오류 0건)

**Vitest (T081)** — `npx vitest run src/lib/auth/session.test.ts src/lib/validations/auth.test.ts src/lib/validations/settings.test.ts src/config/site.test.ts` (기존 기능 활용 F010·F011·F012 + F013)
- [ ] 세션: 만료 쿠키 → 무효, 위조 서명 → 무효, 정상 → 사용자 정보
- [ ] `next` 파라미터: `/dashboard/payments?status=approved` 허용, `//evil.com`·`https://evil.com` 거부(오픈 리다이렉트 방지) — 기존 케이스 없으면 추가
- [ ] 로그인·회원가입 스키마: 이메일 형식·비밀번호 길이
- [ ] 설정 스키마: 표시 이름 trim·길이 한도
- [ ] `site.test.ts` 케이스는 T079 파일 참고

**Playwright MCP (T078)** — 전제: `npm run dev`, 데모 로그인
| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | `/dashboard/orders` | 404 페이지 |
| 2 | `/api/orders` (`browser_navigate`) | 404 |
| 3 | `Meta+K` 커맨드 팔레트 → "주문" 입력 | 결과 없음 |
| 4 | `/examples`의 해당 예제 상세 → 사용처 링크 | `/dashboard/payments`로 이동 |
| 5 | `/dashboard/payments` | 목록 정상 (목업 제거 후에도 Notion 데이터) |
- [ ] 콘솔 오류 0건

**Playwright MCP (T082)** — 기존 기능 회귀 (F010·F011·F012)
| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | 비로그인 `/signup` → 형식 맞게 가입 | `/dashboard` 이동, 사이드바 표시 |
| 2 | 사이드바 로그아웃 | 로그아웃, `/dashboard` 접근 시 `/login?next=%2Fdashboard` |
| 3 | `/login`에서 잘못된 이메일 형식 제출 | 폼 오류 메시지 (T021 수정 후에도 기존 문구) |
| 4 | 미인증 `/dashboard/payments?status=approved` → 로그인 | 원래 URL(`status=approved`)로 복귀 |
| 5 | 로그인 상태 `/login`·`/signup` | `/dashboard`로 이동 |
| 6 | 만료·위조 쿠키(`browser_evaluate`로 `session` 쿠키 값 변조 불가 시 생략, httpOnly) 대신 로그아웃 후 뒤로가기 | 보호 페이지 재접근 시 로그인 이동 |
| 7 | `/dashboard/settings` 표시 이름 변경 → 저장 | 사이드바 이름 즉시 변경, 새로고침 후 유지 |
| 8 | 375px | 로그인 카드·설정 폼 반응형 |
- [ ] 콘솔 오류 0건, 하이드레이션 경고 없음

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
