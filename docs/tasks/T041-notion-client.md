# T041: 서버 전용 Notion 클라이언트를 지연 생성 싱글톤으로 작성

> Phase 3 | 관련 기능: F009 | 선행 작업: T003, T004 | 크기: S | 상태: 대기

## 명세
- PRD 기술 스택: `@notionhq/client` ^5.31, `notionVersion: "2026-03-11"`, 토큰은 서버 전용.
- 토큰 없는 빌드가 실패하지 않도록 모듈 로드가 아니라 첫 호출 시점에 생성한다 (T004 `getServerEnv()` 지연 평가와 같은 이유).
- SDK 재시도·타임아웃 옵션은 T003 결론을 따른다 `[확인 필요]`.

## 관련 파일
- 생성: `src/lib/notion/client.ts`
- 참고: `src/lib/env.server.ts`(T004)

## 착수 전 확인
- [ ] `notion-api-docs`로 `new Client({ auth, notionVersion, ... })` 옵션(재시도·타임아웃·로그 레벨) 확인

## 구현 단계
- [ ] 1. 첫 줄 `import "server-only"`
- [ ] 2. `NOTION_VERSION = "2026-03-11"` 상수
- [ ] 3. `getNotionClient(): Client` — 모듈 변수에 캐시, 없으면 `new Client({ auth: getServerEnv().NOTION_TOKEN, notionVersion: NOTION_VERSION })`
- [ ] 4. SDK 로그 레벨이 토큰을 출력하지 않는지 확인 (기본 로거 사용 시 요청 헤더 미출력 확인)
- [ ] 5. `getDataSourceId()` — `getServerEnv().NOTION_DATA_SOURCE_ID` 반환

## 완료 기준
- [ ] `getNotionClient()` 두 번 호출 시 같은 인스턴스
- [ ] 모듈 import만으로는 `Client` 생성·환경변수 검증이 일어나지 않음
- [ ] `Grep "NOTION_TOKEN" src --glob "!**/env.server*"` 결과가 이 파일 외 0건

## 테스트 체크리스트
**Vitest (T042)** — `npx vitest run src/lib/notion/client.test.ts`
- [ ] 준비: `vi.mock("@notionhq/client")`로 `Client` 생성자 스파이, `vi.mock("server-only", () => ({}))`, 환경변수 주입(`vi.stubEnv`)
- [ ] 정상: 생성자에 `auth`·`notionVersion: "2026-03-11"` 전달
- [ ] 싱글톤: 두 번 호출 시 생성자 1회
- [ ] 지연 평가: import 직후 생성자 0회
- [ ] 실패: `NOTION_TOKEN` 없음 → `getNotionClient()`가 한국어 오류, 생성자 미호출

**Playwright MCP** — 해당 없음
- (UI 없음: 서버 모듈)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
