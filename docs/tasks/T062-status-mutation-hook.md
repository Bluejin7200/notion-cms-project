# T062: 상태 변경 호출 함수와 mutation 훅을 만들어 성공 시 상세 즉시 갱신·목록/요약 무효화, 실패 시 안내·재조회

> Phase 4 | 관련 기능: F003, F009 | 선행 작업: T021, T029, T060 | 크기: S | 상태: 대기

## 명세
- PRD 사용자 여정 5: 처리 성공 → 상세 즉시 갱신, 목록·대시보드는 다음 조회 때 최신 값 (클라이언트 쿼리 무효화).
- PRD 상세: 성공/실패 토스트, "다른 곳에서 수정됨" 안내 후 최신 상태 재조회, 실패(전이 불가·충돌·Notion 오류) → 오류 안내 후 재조회.
- 오류 → 메시지 매핑은 테스트를 위해 순수 함수로 분리한다.

## 관련 파일
- 생성: `src/hooks/use-update-payment-status.ts`
- 수정: `src/lib/api/payments.ts`
- 참고: `src/components/auth/login-form.tsx`(`useMutation` 패턴), `src/lib/api/client.ts`(`ApiRequestError`)

## 착수 전 확인
- [ ] `context7`로 TanStack Query 5 `useMutation`의 `onSuccess`/`onError`/`onSettled`와 `setQueryData` 확인

## 구현 단계
- [ ] 1. `updatePaymentStatus(id, body: PaymentStatusRequest): Promise<PaymentDetail>` — `apiPost(`/api/payments/${encodeURIComponent(id)}/status`, body)`
- [ ] 2. `getStatusUpdateErrorMessage(error: unknown): { message: string; refetch: boolean }` — 409 "다른 곳에서 수정되었습니다. 최신 내용을 불러왔습니다." / 422 "현재 상태에서는 처리할 수 없습니다." / 404 "지급 요청을 찾을 수 없습니다." / 503 서버 메시지 / 그 외 서버 메시지 또는 기본 문구, 모두 `refetch: true`
- [ ] 3. `useUpdatePaymentStatus(id)`: 성공 → `setQueryData(paymentsKeys.detail(id), data)` + `invalidateQueries({ queryKey: ["payments", "list"] })`·`["payments", "summary"]` + 성공 토스트("승인했습니다" 등 동작별 문구)
- [ ] 4. 실패 → `toast.error(message)` + `invalidateQueries(paymentsKeys.detail(id))`
- [ ] 5. 반환: `mutate`, `isPending`

## 완료 기준
- [ ] 성공 시 상세 쿼리 데이터가 응답으로 교체되고 목록·요약 쿼리가 stale 상태
- [ ] `getStatusUpdateErrorMessage(new ApiRequestError("...", 409)).message`가 "다른 곳에서 수정" 문구 포함
- [ ] `npx tsc --noEmit` 통과

## 테스트 체크리스트
**Vitest (T063)** — `npx vitest run src/lib/api/payments.test.ts`
- [ ] `updatePaymentStatus`: `fetch` 스텁으로 URL(`/api/payments/<id>/status`, ID 인코딩)·메서드 POST·본문 JSON 확인
- [ ] 오류 메시지 매핑(`it.each`): 409·422·404·503·500 `ApiRequestError`, 일반 `TypeError`(네트워크) → 기대 문구, 모두 `refetch: true`
- [ ] 알 수 없는 값(`null`, 문자열) → 기본 문구
- (훅 자체는 React 환경이 필요해 단위 테스트 대상 아님 → T065 화면 검증)

**Playwright MCP** — 훅 동작은 T065에서 확인
- (UI 없음: 훅·호출 함수만 작성)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
