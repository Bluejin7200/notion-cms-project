# T066: 반려 사유 입력 다이얼로그를 만들어 사유 필수(trim 후 1~2000자) 검증 후 반려 처리

> Phase 4 | 관련 기능: F003, F004 | 선행 작업: T064 | 크기: S | 상태: 대기

## 명세
- PRD F004·상세: 반려 선택 시 사유 입력 필수(trim 후 1~2000자), 처리 전 확인, 처리 중 버튼 비활성화, 처리 후 반려 사유·처리일 표시.
- 서버와 같은 스키마(T010 `rejectReasonFormSchema`)를 `zodResolver`로 사용한다.
- 요청·승인 상태 모두 반려 가능 (승인 후 반려 = 지급 전 취소).

## 관련 파일
- 생성: `src/components/payments/reject-dialog.tsx`
- 수정: `src/components/payments/payment-actions.tsx`
- 참고: `src/components/common/responsive-dialog.tsx`(모바일 Drawer 전환), `src/components/form/form-textarea.tsx`, `src/components/settings/preferences-form.tsx`(RHF 패턴)

## 착수 전 확인
- [ ] `form-textarea` props(`maxLength`, 설명 문구, 글자 수 표시 지원 여부) 확인

## 구현 단계
- [ ] 1. `RejectDialog({ detail, open, onOpenChange })` — `ResponsiveDialog` 안에 폼
- [ ] 2. `useForm({ resolver: zodResolver(rejectReasonFormSchema), defaultValues: { reason: "" } })`
- [ ] 3. `FormTextarea` + 글자 수 표시(`n / 2000`, trim 기준 여부 명시)
- [ ] 4. 제출 → `mutate({ action: "reject", reason, lastEditedTime })`, `isPending` 동안 제출·취소 비활성화
- [ ] 5. 성공 시 다이얼로그 닫힘 + 폼 초기화, 실패 시 다이얼로그 유지(토스트는 T062 훅)
- [ ] 6. `PaymentActions`에 "반려" 버튼(요청·승인 상태) 연결

## 완료 기준
- [ ] 공백만 입력 후 제출 → 요청 없이 "반려 사유를 입력해 주세요." 표시
- [ ] 2001자 입력 → "2000자 이하" 오류, 제출 차단
- [ ] 정상 반려 후 상세에 반려 사유·처리일 표시, 버튼 사라짐

## 테스트 체크리스트
**Vitest** — 해당 없음
- (테스트 대상 아님: `.tsx` UI. 사유 검증 규칙은 T011, 서버 400은 T061에서 검증)

**Playwright MCP (T067)** — 전제: `npm run dev`, 데모 로그인, **Notion 샘플 데이터에서만**
| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | 승인 상태 샘플 상세 → "반려" 클릭 | 다이얼로그, 사유 입력란·글자 수 `0 / 2000` |
| 2 | 공백 3칸 입력 → 제출 | "반려 사유를 입력해 주세요.", `POST` 요청 없음 |
| 3 | `browser_evaluate`로 2001자 입력 → 제출 | "2000자 이하" 오류, 요청 없음 |
| 4 | "  지급 계좌 확인 필요  " 입력 → 제출 | 처리 중 버튼 비활성화, `POST` 200, 다이얼로그 닫힘, 성공 토스트 |
| 5 | 상세 확인 | 배지 "반려", 반려 사유 "지급 계좌 확인 필요"(trim), 처리일 KST 오늘, 버튼 없음 |
| 6 | Notion MCP로 같은 건 조회 | 반려 사유·처리일 기록됨 |
| 7 | 요청 상태 샘플에서 반려 → 취소 | 다이얼로그 닫힘, 상태 변화 없음 |
| 8 | `browser_resize` 375px → 반려 클릭 | Drawer 형태, 입력란·버튼 화면 안 |
- [ ] 콘솔 오류 0건, 375px·1280px 확인
- [ ] 테스트 후 샘플 원복 여부 기록

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
