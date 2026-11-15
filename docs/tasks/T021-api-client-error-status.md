# T021: API 클라이언트 오류에 HTTP 상태를 담아 409·404를 구분할 수 있게 수정

> Phase 2 | 관련 기능: F003, F009 | 선행 작업: T001 | 크기: S | 상태: 대기

## 명세
- 현재 `apiFetch`는 실패 시 `new Error(message)`만 던져 상태 코드를 알 수 없다 (PRD↔코드 불일치, 진행 메모).
- PRD F003: 409 "다른 곳에서 수정됨" 안내 후 재조회, PRD 상세 페이지: 없는 건(404)·Notion 오류 구분 안내.
- 기존 호출부(로그인·회원가입 폼)는 `error.message`만 사용하므로 `Error`를 상속해 호환을 유지한다 (**수정**, 신규 아님).

## 관련 파일
- 수정: `src/lib/api/client.ts`
- 참고: `src/lib/api/response.ts`(`ApiError` 타입), `src/components/auth/login-form.tsx`, `src/components/auth/signup-form.tsx`

## 착수 전 확인
- (외부 API 없음)

## 구현 단계
- [ ] 1. `export class ApiRequestError extends Error { readonly status: number }` (`name = "ApiRequestError"`)
- [ ] 2. `apiFetch` 실패 분기에서 `throw new ApiRequestError(body?.message ?? "요청을 처리하지 못했습니다.", response.status)`
- [ ] 3. 판별 헬퍼 `isApiRequestError(error: unknown): error is ApiRequestError`
- [ ] 4. 로그인·회원가입 폼 동작 변화 없음 확인

## 완료 기준
- [ ] 409 응답 시 `ApiRequestError`가 던져지고 `status === 409`, `message`는 서버 메시지
- [ ] 로그인 실패 시 기존과 같은 오류 문구가 폼에 표시됨 (수동 확인)
- [ ] `npx tsc --noEmit` 통과

## 테스트 체크리스트
**Vitest (T022)** — `npx vitest run src/lib/api/client.test.ts`
- [ ] 준비: `vi.stubGlobal("fetch", vi.fn())`로 `Response` 스텁
- [ ] 정상: 200 JSON → 본문 반환, `Content-Type: application/json` 헤더 전송
- [ ] 실패: 409 + `{ message: "다른 곳에서 수정됨" }` → `ApiRequestError`, `status` 409, 메시지 일치
- [ ] 실패: 500 + JSON 아닌 본문 → 기본 메시지 "요청을 처리하지 못했습니다.", `status` 500
- [ ] 실패: 404·401·422·503 각각 `status` 보존 (`it.each`)
- [ ] 호환: `error instanceof Error === true`, `isApiRequestError` 판별
- [ ] `apiPost`: 본문 JSON 직렬화, 본문 없음 시 `body` undefined

**Playwright MCP** — 해당 없음
- (UI 없음: 화면 변화 없음. 로그인 오류 표시는 T082 회귀에서 확인)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
