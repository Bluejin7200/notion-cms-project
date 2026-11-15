# T001: 의존성을 설치하고 package.json을 PRD 기술 스택에 맞게 정리

> Phase 0 | 관련 기능: F009 | 선행 작업: - | 크기: S | 상태: 대기

## 명세
- 현재 저장소에는 `node_modules`가 없어 로컬 Next 문서(`node_modules/next/dist/docs/`)를 읽을 수 없다. T002(캐시 API 확인)의 전제 조건이다.
- PRD "기술 스택": `@notionhq/client` ^5.31 추가, Node 22 이상(`engines`), TypeScript 5.9 이상 하한 명시.
- 서버 전용 모듈 경계를 위해 `server-only` 패키지를 추가한다 (사용 방법은 T002에서 확인).
- `@date-fns/tz`는 T012에서 `Intl`만으로 부족하다고 판단될 때만 추가한다 (이 작업에서는 설치하지 않음).

## 관련 파일
- 수정: `package.json`, `package-lock.json`
- 참고: `CLAUDE.md` ("`npm audit fix --force` 금지")

## 착수 전 확인
- [ ] `npm view @notionhq/client version`으로 5.31 이상이 배포되어 있는지 확인 `[확인 필요]`

## 구현 단계
- [ ] 1. `npm install` 실행 → `node_modules/next/dist/docs/` 생성 확인
- [ ] 2. `npm install @notionhq/client@^5.31 server-only`
- [ ] 3. `package.json`에 `"engines": { "node": ">=22" }` 추가
- [ ] 4. `devDependencies.typescript`를 `^5.9`로 변경 후 `npm install`
- [ ] 5. `npm audit --omit=dev` 결과 확인 (`npm audit fix --force` 실행 금지)

## 완료 기준
- [ ] `npm ls @notionhq/client server-only`가 오류 없이 버전 출력 (`@notionhq/client` 5.31 이상)
- [ ] `ls node_modules/next/dist/docs/`에 문서 폴더 존재
- [ ] `npm run build`, `npm test`, `npm run lint`가 설치 전과 동일하게 통과
- [ ] `npm audit --omit=dev` 0건 (아니면 진행 메모에 기록)

## 테스트 체크리스트
**Vitest** — 해당 없음
- (테스트 대상 아님: 의존성 설치·설정 변경. 기존 `npm test` 전체 통과로 회귀만 확인)

**Playwright MCP** — Phase 0 회귀 시나리오(ROADMAP)에서 기존 화면 동작 확인
- (UI 없음: 화면 변경 없음)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
