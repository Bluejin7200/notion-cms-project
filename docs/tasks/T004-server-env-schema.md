# T004: 서버 전용 환경변수 스키마를 만들어 Notion 토큰이 클라이언트에 섞이지 않게 함

> Phase 0 | 관련 기능: F009 | 선행 작업: T001, T002 | 크기: S | 상태: 대기

## 명세
- PRD "기술 스택 > 환경변수": 서버 전용 `NOTION_TOKEN`, `NOTION_DATA_SOURCE_ID`를 서버 전용 Zod 스키마로 검증, `.env.example`에 추가, `NEXT_PUBLIC_` 금지.
- `src/lib/env.ts`는 공개 변수 전용이며 `src/config/site.ts`를 통해 클라이언트에서도 import된다 → **수정하지 않는다**.
- 토큰이 없는 환경(CI, 토큰 미설정 로컬)에서도 `next build`가 모듈 로드만으로 실패하지 않도록 **지연 평가**(`getServerEnv()` 호출 시점 검증)로 만든다.

## 관련 파일
- 생성: `src/lib/env.server.ts`
- 수정: `.env.example`, `README.md` ("Notion 연동 환경변수 (구현 예정)" 표 문구)
- 참고: `src/lib/env.ts` (Zod 스키마 패턴), `src/lib/auth/session.ts` (`SESSION_SECRET` 처리 방식)

## 착수 전 확인
- [ ] T002 결론의 `server-only` 사용 방법 확인
- [ ] `next16-docs`로 서버 환경변수 접근 방식(`process.env` 런타임 참조) 확인

## 구현 단계
- [ ] 1. `src/lib/env.server.ts` 첫 줄 `import "server-only"`
- [ ] 2. `serverEnvSchema = z.object({ NOTION_TOKEN: z.string().trim().min(1, "..."), NOTION_DATA_SOURCE_ID: z.string().trim().min(1, "...") })` (한국어 오류 메시지)
- [ ] 3. `getServerEnv()`: 처음 호출 시 `safeParse(process.env)` → 실패 시 누락 변수 이름만 담은 한국어 `Error` (값은 출력하지 않음), 성공 시 결과 메모이즈. 테스트용 `parseServerEnv(source)` 순수 함수 분리
- [ ] 4. `.env.example`에 두 변수와 한국어 설명 추가 (`SESSION_SECRET` 주석 형식 따름, "서버 전용 — NEXT_PUBLIC_ 금지")
- [ ] 5. README 환경변수 표의 "구현 예정" 제거, `src/lib/env.server.ts` 위치 안내

## 완료 기준
- [ ] `getServerEnv()`가 `NOTION_TOKEN` 누락 시 "NOTION_TOKEN" 이름이 포함된 한국어 오류를 던지고 토큰 값은 메시지에 없음
- [ ] `import "@/lib/env.server"`만으로는 오류가 나지 않음 (지연 평가)
- [ ] `Grep "NOTION_" src/lib/env.ts` 0건, `Grep "NEXT_PUBLIC_NOTION" .` 0건
- [ ] `.env.example`에 두 변수가 빈 값으로 존재

## 테스트 체크리스트
**Vitest (T005)** — `npx vitest run src/lib/env.server.test.ts`
- [ ] 준비: `vi.mock("server-only", () => ({}))` 필요 여부 확인 `[확인 필요]`
- [ ] 정상: 두 값이 있으면 trim된 값 반환
- [ ] 실패: `NOTION_TOKEN` 누락 → 오류 메시지에 변수 이름 포함
- [ ] 실패: `NOTION_DATA_SOURCE_ID` 빈 문자열·공백만 → 오류
- [ ] 실패: 둘 다 누락 → 두 이름 모두 메시지에 포함
- [ ] 보안: 오류 메시지에 입력 토큰 값이 포함되지 않음
- [ ] 지연 평가: 모듈 import 시점에는 throw하지 않음 (`vi.resetModules` 후 동적 import)

**Playwright MCP** — 해당 없음
- (UI 없음: 서버 설정 모듈)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
