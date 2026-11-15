# T073: 대시보드의 하드코딩 통계·최근 주문을 Notion 집계 요약 카드로 교체

> Phase 5 | 관련 기능: F005, F006, F007, F009, F011 | 선행 작업: T054, T069, T071 | 크기: M | 상태: 대기

## 명세
- PRD 대시보드 페이지: 기존 하드코딩 통계 카드를 Notion 집계로 교체. 이번 주/이번 달 금액 카드(요청·승인, 연체 중복 포함, 예정일 빈 건 제외), 상태별 건수 카드 4종, **연체 카드**(건수·금액 경고 색상, 0건이면 정상), **새로고침** 버튼, 로딩 스켈레톤, 조회 실패 시 재시도.
- 카드 클릭 → T071 링크. 금액 카드는 이동 없음.
- 현재 `src/app/dashboard/page.tsx`는 `queryOrders`를 서버에서 직접 호출 → 이 작업에서 제거해야 T076(주문 제거)이 가능.

## 관련 파일
- 생성: `src/components/payments/payment-summary-cards.tsx`
- 수정: `src/app/dashboard/page.tsx` (**수정**: 통계 카드·최근 주문 테이블 제거)
- 참고: `src/components/motion/stagger.tsx`(`Stagger immediate`), `src/components/ui/tooltip.tsx`, `src/lib/format.ts`, `src/components/motion/animated-number.tsx`

## 착수 전 확인
- [ ] `shadcn` MCP로 Base UI `Tooltip` 사용법(`render` 규칙) 확인

## 구현 단계
- [ ] 1. `PaymentSummaryCards`: `useQuery(paymentsSummaryQueryOptions())`
- [ ] 2. 금액 카드 2개(이번 주·이번 달) — `formatCurrency`, 안내 툴팁 "요청·승인 건 기준, 연체 건 포함, 예정일 없는 건 제외"
- [ ] 3. 상태 카드 4개 — `Link href={DASHBOARD_CARD_LINKS[status]}`, 카드 전체 클릭 영역, 포커스 링
- [ ] 4. 연체 카드 — 건수·금액, 1건 이상이면 경고 색상(테두리·아이콘 + "연체" 텍스트), 0건이면 일반 색상, `?overdue=true` 링크
- [ ] 5. 로딩 스켈레톤(카드 7개), 오류 → 메시지 + "다시 시도"
- [ ] 6. 새로고침 버튼(`refreshPayments`, T054) — `PageHeader` 액션 영역
- [ ] 7. `src/app/dashboard/page.tsx`: `statCards`·`queryOrders`·`OrderStatusBadge`·최근 주문 테이블 제거, 설명 "지급 현황을 한눈에 확인하세요."
- [ ] 8. 반응형: 1열 → `sm` 2열 → `xl` 4열, `Stagger immediate`

## 완료 기준
- [ ] `/dashboard`에 카드 7종(금액 2·상태 4·연체 1)
- [ ] `Grep "orders|Order" src/app/dashboard/page.tsx` 0건
- [ ] 연체 0건 샘플 상태에서 연체 카드가 일반 색상

## 테스트 체크리스트
**Vitest** — 해당 없음
- (테스트 대상 아님: `.tsx` UI. 집계는 T019, API는 T070, 링크는 T072에서 검증)

**Playwright MCP (T074)** — 전제: `npm run dev`, 데모 로그인, Notion 샘플 데이터
| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | `/dashboard` → `browser_snapshot` | 카드 7종, "총 매출"·"최근 주문" 없음, `/api/payments/summary` 200 |
| 2 | 각 상태 카드 값 기록 → "승인 건수" 클릭 | `/dashboard/payments?status=approved`, 상태 Select "승인", 목록 total = 카드 값 |
| 3 | 뒤로 → "연체" 카드 클릭 | `?overdue=true`, 스위치 켜짐, 상태 "전체", total = 연체 건수 |
| 4 | 금액 카드 클릭 | URL 변화 없음 |
| 5 | 금액 카드 툴팁 호버 | 중복 집계·제외 조건 안내 |
| 6 | 연체 카드 색상 | 1건 이상이면 경고 스타일 + "연체" 텍스트 |
| 7 | Notion에서 샘플 금액 수정 → 새로고침 버튼 | `POST /api/payments/refresh` 200 → 합계 갱신 |
| 8 | 네트워크 차단(`/api/payments/summary` 실패 유도) | 오류 메시지 + "다시 시도" |
| 9 | `browser_resize` 375px·1280px | 1열 ↔ 4열 |
- [ ] 콘솔 오류 0건, 하이드레이션 경고 없음, 375px·1280px 확인

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
