# T035: 지급 요청 상세 페이지(읽기 전용)를 만들어 증빙·마스킹 계좌·연체 배지와 오류 안내를 표시

> Phase 2 | 관련 기능: F002, F007, F008, F011 | 선행 작업: T027, T029, T031 | 크기: M | 상태: 대기

## 명세
- PRD 상세 페이지: 제목·요청자·수령처·마스킹 계좌·금액·지급 예정일·분류·메모 표시, 상태·처리일·반려 사유 표시.
- 증빙: http/https만 새 탭 링크, 그 외 "유효하지 않은 링크", 없으면 "증빙 없음". 계좌가 마스킹 형식이 아니면 원문 대신 가림 + 경고.
- 없는 건 또는 조회 실패 → **상세 페이지 안에서** 오류 안내 + 목록으로 돌아가기 (`error.tsx` 경계가 아님).
- 처리 후 즉시 갱신(T064)을 위해 클라이언트 컴포넌트가 `paymentDetailQueryOptions`로 조회한다. 처리 버튼 영역은 T064에서 추가.

## 관련 파일
- 생성: `src/app/dashboard/payments/[id]/page.tsx`, `src/components/payments/payment-detail.tsx`
- 참고: `src/components/ui/alert.tsx`, `src/components/ui/card.tsx`, `src/components/common/loading-state.tsx`, `src/lib/api/client.ts`의 `isApiRequestError`

## 착수 전 확인
- [ ] `next16-docs`로 동적 라우트 페이지 `params`(Promise 여부)와 `generateMetadata` 확인 (T002 결론)

## 구현 단계
- [ ] 1. 서버 페이지: `params`에서 `id`만 꺼내 `<PaymentDetail id={id} />` 렌더 (`metadata.title = "지급 요청 상세"`)
- [ ] 2. `PaymentDetail`: `useQuery(paymentDetailQueryOptions(id))`, 로딩 스켈레톤
- [ ] 3. 헤더: 제목 + `PaymentStatusBadge` + 연체면 `OverdueBadge`, "목록으로" 링크(`router.back()` 대신 `/dashboard/payments` 링크; 이전 조건 유지가 필요하면 `history` 사용 여부 결정)
- [ ] 4. 정의 목록(`dl`): 요청자, 수령처, 계좌, 금액, 지급 예정일, 분류, 처리일, 반려 사유(반려일 때), 메모(줄바꿈 유지)
- [ ] 5. 계좌 경고: `accountMaskWarning`이면 계좌 옆 "(가려짐)" + 경고 `Alert`("마스킹 형식이 아닌 계좌 값이 있어 가렸습니다. Notion에서 확인하세요.")
- [ ] 6. 증빙: valid → `<a target="_blank" rel="noopener noreferrer">` + 외부 링크 아이콘, invalid → "유효하지 않은 링크", none → "증빙 없음"
- [ ] 7. 오류: `ApiRequestError` 404 → "지급 요청을 찾을 수 없습니다.", 그 외 → 서버 메시지 + "다시 시도"; 둘 다 "목록으로 돌아가기" 링크
- [ ] 8. 반응형: 모바일 1열, 데스크톱 2열 정의 목록

## 완료 기준
- [ ] 목업 상세에 9개 표시 항목 + 상태·연체 배지 표시
- [ ] `javascript:` 증빙 건에 클릭 가능한 링크가 없음 (`a` 요소 없음)
- [ ] `/dashboard/payments/not-exist`에서 상세 안 오류 Alert + 목록 링크, 전역 오류 화면이 아님

## 테스트 체크리스트
**Vitest** — 해당 없음
- (테스트 대상 아님: `.tsx` UI. 마스킹·증빙 판정은 T015·T028에서 검증)

**Playwright MCP (T036)** — 전제: `npm run dev`, 데모 로그인, 목업 데이터
| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | 목록에서 `https` 증빙 건 클릭 → `browser_snapshot` | 제목·요청자·수령처·계좌·금액·지급 예정일·분류·메모 표시, `/api/payments/<id>` 200 |
| 2 | 증빙 링크 속성 확인 | `target="_blank"`, `rel="noopener noreferrer"` |
| 3 | `javascript:` 증빙 건 상세 | "유효하지 않은 링크" 텍스트, 링크 요소 없음 |
| 4 | 증빙 빈 건 상세 | "증빙 없음" |
| 5 | 비마스킹 계좌 건 상세 | 계좌 "(가려짐)" + 경고 Alert, 네트워크 응답 본문에 원문 없음 |
| 6 | 연체 건 상세 | "연체" 배지 |
| 7 | 반려 건 상세 | 반려 사유·처리일 표시 |
| 8 | `/dashboard/payments/not-exist` | 상세 안 "지급 요청을 찾을 수 없습니다." + "목록으로 돌아가기", `/api/payments/not-exist` 404 |
| 9 | "목록으로 돌아가기" 클릭 | `/dashboard/payments` |
| 10 | `browser_resize` 375px·1280px | 1열 ↔ 2열 배치 |
- [ ] 콘솔 오류 0건, 하이드레이션 경고 없음, 375px·1280px 확인

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
