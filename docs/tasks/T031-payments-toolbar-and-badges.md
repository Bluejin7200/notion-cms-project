# T031: 지급 요청 목록 페이지 셸과 검색·상태·연체만 툴바, 상태/연체 배지를 만들어 조건을 URL과 동기화

> Phase 2 | 관련 기능: F001, F007, F011 | 선행 작업: T029 | 크기: M | 상태: 대기

## 명세
- PRD 목록 페이지: 검색(제목·수령처·요청자, 디바운스), 상태 필터(전체/요청/승인/지급완료/반려), **연체만 토글**, 페이지 이동 — 모두 URL과 동기화. **새로고침 버튼**.
- PRD F007: 연체 배지. 알 수 없는 상태는 "알 수 없음" 배지.
- 이 작업에서는 페이지 셸 + 툴바 + 배지 컴포넌트까지. 테이블은 T033.
- `/dashboard/payments`는 `dashboard/` 아래라 `proxy.ts`가 자동 보호 (F011, 기존 기능 활용).

## 관련 파일
- 생성: `src/components/payments/payment-status-badge.tsx`, `src/components/payments/overdue-badge.tsx`, `src/components/payments/payments-toolbar.tsx`, `src/app/dashboard/payments/page.tsx`
- 참고: `src/components/orders/orders-toolbar.tsx`(디바운스), `src/components/orders/order-status-badge.tsx`, `src/app/dashboard/orders/page.tsx`, `src/components/ui/switch.tsx`, `src/components/ui/select.tsx`

## 착수 전 확인
- [ ] `next16-docs`로 페이지 `metadata` export, nuqs 사용 클라이언트 컴포넌트를 서버 페이지에 둘 때 `Suspense` 필요 여부 확인
- [ ] `shadcn` MCP로 Base UI `Select`·`Switch` 사용법(`render` 규칙) 확인

## 구현 단계
- [ ] 1. `PaymentStatusBadge({ status })` — 4상태 + unknown("알 수 없음", outline)
- [ ] 2. `OverdueBadge()` — 경고 색상(destructive 계열), 텍스트 "연체" (색상만으로 구분하지 않음)
- [ ] 3. `PaymentsToolbar` — 검색 Input(placeholder "제목·수령처·요청자 검색", 디바운스 300ms), 상태 Select, "연체만" Switch + Label, 새로고침 Button(`RefreshCw`, 처리 중 비활성화·회전, 성공 토스트)
- [ ] 4. 조건 변경 시 `page`를 1로 초기화
- [ ] 5. 모바일: 세로 배치, 데스크톱: 한 줄 (`flex-col sm:flex-row`)
- [ ] 6. `src/app/dashboard/payments/page.tsx` — `metadata.title = "지급 요청"`, `PageHeader`("지급 요청", 설명), `Card` 안에 툴바 (테이블 자리는 T033)

## 완료 기준
- [ ] 검색 입력 후 300ms 뒤 URL `?q=...` 반영, 상태 선택 시 `status=approved`, 연체만 켜면 `overdue=true`
- [ ] 조건을 바꾸면 URL의 `page`가 제거(1로 초기화)됨
- [ ] 브라우저 새로고침 후 툴바 값이 URL 값으로 복원됨
- [ ] `npm run lint` 통과

## 테스트 체크리스트
**Vitest** — 해당 없음
- (테스트 대상 아님: `.tsx` UI 컴포넌트 — 프로젝트는 `.ts`만 테스트. 직렬화 로직은 T030에서 검증)

**Playwright MCP (T032)** — 전제: `npm run dev`, 데모 로그인
| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | `browser_navigate` `/dashboard/payments` → `browser_snapshot` | 제목 "지급 요청", 검색창·상태 선택·"연체만" 스위치·새로고침 버튼 존재 |
| 2 | `browser_type` 검색창에 "acme" | 약 300ms 후 URL에 `q=acme` |
| 3 | 상태 Select에서 "승인" 선택 | URL `status=approved`, `page` 없음 |
| 4 | "연체만" 스위치 `browser_click` | URL `overdue=true`, 스위치 `checked` |
| 5 | `browser_navigate`로 같은 URL 다시 열기 | 검색어·상태·스위치가 URL 값으로 복원 |
| 6 | URL에 `?page=3` 붙여 연 뒤 상태 변경 | `page` 파라미터 제거 |
| 7 | 새로고침 버튼 클릭 | 버튼 일시 비활성화, 성공 토스트 |
| 8 | `browser_resize` 375px → `browser_take_screenshot` | 툴바 세로 배치, 가로 스크롤 없음 |
- [ ] 콘솔 오류 0건(`browser_console_messages`), 하이드레이션 경고 없음, 375px·1280px 확인

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
