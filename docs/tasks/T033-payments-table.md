# T033: 지급 요청 목록 테이블을 목록 API와 연결해 로딩·빈 상태·오류 재시도·페이지 이동을 구현

> Phase 2 | 관련 기능: F001, F007 | 선행 작업: T025, T031 | 크기: M | 상태: 대기

## 명세
- PRD 목록 페이지: 표 컬럼 제목·수령처·금액·지급 예정일·분류·상태 (**계좌 표시 안 함**), 정렬은 서버 결과 그대로, 연체 배지·"알 수 없음" 배지, 빈 상태·오류 재시도, 행 클릭 → 상세.
- 행 클릭은 키보드 접근을 위해 제목 셀을 `Link`로 만든다.

## 관련 파일
- 생성: `src/components/payments/payments-table.tsx`
- 수정: `src/app/dashboard/payments/page.tsx`
- 참고: `src/components/orders/orders-table.tsx`(로딩/빈/오류 분기, 범위 밖 페이지 보정 `useEffect`), `src/components/common/data-pagination.tsx`, `src/components/common/empty-state.tsx`, `src/lib/format.ts`(`formatCurrency`, `formatDate`)

## 착수 전 확인
- [ ] `context7`로 TanStack Query 5 `useQuery` + `placeholderData` 사용 시 `isPlaceholderData` 처리 확인

## 구현 단계
- [ ] 1. `usePaymentsParams()` → `paymentsQueryOptions({ q, status, overdue, page, pageSize: 10 })` → `useQuery`
- [ ] 2. 컬럼: 제목(`Link href="/dashboard/payments/{id}"`), 수령처, 금액(`formatCurrency`, null → "-"), 지급 예정일(빈 값 "-"), 분류(null → "-"), 상태(`PaymentStatusBadge` + 연체면 `OverdueBadge`)
- [ ] 3. 로딩: 행 스켈레톤 10줄, 이전 데이터 표시 중에는 흐리게
- [ ] 4. 빈 상태: 조건 있음 → "조건에 맞는 지급 요청이 없습니다" + 조건 초기화 버튼, 조건 없음 → "지급 요청이 없습니다"
- [ ] 5. 오류: 메시지 + "다시 시도" 버튼(`refetch`)
- [ ] 6. `DataPagination`으로 페이지 이동, `total`이 줄어 범위 밖이면 마지막 페이지로 보정
- [ ] 7. 모바일: 테이블 가로 스크롤 허용 또는 덜 중요한 컬럼(분류) 숨김

## 완료 기준
- [ ] 목업 30건 기준 1페이지 10건, 6개 컬럼, 계좌 컬럼 없음
- [ ] `status=paid&overdue=true` → 빈 상태 안내
- [ ] 오류 응답(개발 도구로 `/api/payments` 차단) 시 "다시 시도" 버튼 → 재요청
- [ ] 제목 링크 Tab 포커스 후 Enter → 상세 이동

## 테스트 체크리스트
**Vitest** — 해당 없음
- (테스트 대상 아님: `.tsx` UI. 데이터·정렬 규칙은 T017·T026에서 검증)

**Playwright MCP (T034)** — 전제: `npm run dev`, 데모 로그인, 목업 데이터
| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | `/dashboard/payments` → `browser_snapshot` | 테이블 헤더 6개(제목·수령처·금액·지급 예정일·분류·상태), 10행, "계좌" 헤더 없음 |
| 2 | `browser_network_requests` | `GET /api/payments?page=1&pageSize=10` 200 |
| 3 | 마지막 페이지 이동 | 예정일 빈 건이 맨 끝, 지급 예정일 "-" |
| 4 | `?overdue=true` | 모든 행에 "연체" 배지, 상태는 요청·승인만 |
| 5 | `?status=paid&overdue=true` | 빈 상태 문구 + 조건 초기화 버튼 → 클릭 시 전체 목록 |
| 6 | 상태 "알 수 없음" 건이 있는 페이지 | "알 수 없음" 배지 |
| 7 | 2페이지에서 행 제목 클릭 | `/dashboard/payments/<id>`로 이동 |
| 8 | `browser_navigate_back` | 2페이지·조건 유지 |
| 9 | `?page=99` | 마지막 페이지로 보정 |
| 10 | `browser_resize` 375px | 테이블 가로 스크롤 또는 축약 표시, 페이지네이션 사용 가능 |
- [ ] 콘솔 오류 0건, 하이드레이션 경고 없음, 375px·1280px 확인

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
