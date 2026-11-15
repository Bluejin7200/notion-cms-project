# T037: 사이드바 "주문" 메뉴를 "지급 요청"으로 바꾸고 상세 breadcrumb에 ID 대신 "상세"를 표시

> Phase 2 | 관련 기능: F011 | 선행 작업: T033, T035 | 크기: S | 상태: 대기

## 명세
- PRD 메뉴 구조: 대시보드 사이드바 "💸 지급 요청 (기존 '주문' 메뉴 대체)". 상세는 별도 메뉴 없음.
- `siteConfig.dashboardNav`는 사이드바·커맨드 팔레트·breadcrumb 공용 → 한 곳만 수정하면 세 곳에 반영 (**수정**).
- 현재 `dashboard-header.tsx`의 `useBreadcrumbs`는 `dashboardNav`에 없는 세그먼트를 원문 그대로 표시 → 상세 페이지에서 Notion 페이지 ID가 노출된다 (PRD↔코드 불일치, 진행 메모).
- 테스트를 위해 breadcrumb 계산을 순수 함수 `src/lib/breadcrumbs.ts`로 분리한다.
- 주문 페이지(`/dashboard/orders`)는 메뉴에서만 빠지고 파일은 T076에서 제거한다.

## 관련 파일
- 생성: `src/lib/breadcrumbs.ts`
- 수정: `src/config/site.ts`, `src/components/layout/dashboard-header.tsx`
- 참고: `src/components/layout/app-sidebar.tsx`, `src/components/layout/command-menu.tsx`

## 착수 전 확인
- [ ] `lucide-react`에 `Banknote` 아이콘 존재 확인 (`node_modules/lucide-react`)

## 구현 단계
- [ ] 1. `dashboardNav`의 `{ title: "주문", href: "/dashboard/orders", icon: ShoppingCart }` → `{ title: "지급 요청", href: "/dashboard/payments", icon: Banknote }`
- [ ] 2. `buildBreadcrumbs(pathname, navItems, dynamicLabels)` — 메뉴에 있는 경로는 메뉴 제목, `/dashboard/payments/<id>` 패턴은 "상세", 그 외는 세그먼트 원문
- [ ] 3. `dashboard-header.tsx`의 `useBreadcrumbs`가 `buildBreadcrumbs(usePathname(), siteConfig.dashboardNav, ...)` 호출
- [ ] 4. 커맨드 팔레트에 "지급 요청" 항목이 나타나는지 확인 (코드 변경 없이 반영되어야 함)

## 완료 기준
- [ ] 사이드바·커맨드 팔레트에 "지급 요청", "주문" 없음
- [ ] `buildBreadcrumbs("/dashboard/payments/abc", nav)`의 제목 목록 = `["대시보드", "지급 요청", "상세"]`
- [ ] `/dashboard/settings` breadcrumb은 기존과 동일

## 테스트 체크리스트
**Vitest (T038)** — `npx vitest run src/lib/breadcrumbs.test.ts`
- [ ] 정상: `/dashboard` → `["대시보드"]`, `/dashboard/payments` → `["대시보드", "지급 요청"]`
- [ ] 상세: `/dashboard/payments/0f1e…` (UUID) → 마지막 항목 "상세", `href`는 전체 경로
- [ ] 경계값: 끝 슬래시 `/dashboard/payments/`, 루트 `/` → 빈 배열
- [ ] 알 수 없는 세그먼트: `/dashboard/unknown` → 원문 "unknown"
- [ ] 각 항목 `href` 누적 경로 정확성

**Playwright MCP (T039)** — 전제: `npm run dev`, 데모 로그인
| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | `/dashboard` → `browser_snapshot` | 사이드바 "대시보드 / 지급 요청 / 설정", "주문" 없음 |
| 2 | 사이드바 "지급 요청" 클릭 | `/dashboard/payments`, 메뉴 활성 표시 |
| 3 | 행 클릭해 상세 이동 | breadcrumb "대시보드 / 지급 요청 / 상세", ID 문자열 없음 |
| 4 | breadcrumb "지급 요청" 클릭 | `/dashboard/payments` 이동 |
| 5 | `browser_press_key` `Meta+K` → "지급" 입력 | 커맨드 팔레트에 "지급 요청" 항목, Enter로 이동 |
| 6 | `browser_resize` 375px → 사이드바 열기 | Sheet 사이드바에 "지급 요청" |
- [ ] 콘솔 오류 0건, 375px·1280px 확인

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
