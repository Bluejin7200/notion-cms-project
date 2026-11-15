# T003: Notion API·@notionhq/client 사용법을 확인해 조회·쓰기·오류 처리 방식을 확정

> Phase 0 | 관련 기능: F009 | 선행 작업: T001 | 크기: S | 상태: 대기

## 명세
- PRD "기술 스택": `@notionhq/client` ^5.31, `notionVersion: "2026-03-11"`, 서버 전용 `NOTION_TOKEN`·`NOTION_DATA_SOURCE_ID`.
- PRD F001: 100건 단위 커서 반복 전체 조회, F003: `last_edited_time` 비교로 동시성 검사, F004: 상태·반려 사유·처리일 쓰기.
- 아래 항목은 모두 `[확인 필요]`이며 설치된 SDK 버전 기준으로 확인한다.

## 관련 파일
- 수정: `docs/ROADMAP.md` (진행 메모 T003 항목)
- 참고: `node_modules/@notionhq/client/` (타입 정의), `package.json`

## 착수 전 확인
- [ ] `notion-api-docs`로 아래 확인 항목 조사 (설치된 SDK 버전·`Notion-Version` 기준)

## 구현 단계
- [ ] 1. SDK 버전이 `notionVersion: "2026-03-11"`을 지원하는지
- [ ] 2. `dataSources.query`: `data_source_id`, `page_size` 최대 100, `start_cursor`/`has_more`/`next_cursor`, 정렬·필터를 쓰지 않을 때 기본 순서
- [ ] 3. `pages.retrieve`: 응답 타입(부분 응답 `PartialPageObjectResponse` 구분 방법), 다른 data source의 페이지 ID 조회 시 동작
- [ ] 4. `pages.update` 속성 형식: status(옵션 이름 지정), rich_text(2000자 제한 여부), date(날짜만 `start: "YYYY-MM-DD"`)
- [ ] 5. 요청 속도 제한 수치, SDK 자동 재시도 여부·설정 옵션, `Retry-After` 헤더
- [ ] 6. `last_edited_time` 정밀도 (분 단위 반올림 여부)
- [ ] 7. 오류 코드와 HTTP 상태: `unauthorized`(401), `restricted_resource`(403), `object_not_found`(404), `conflict_error`(409), `rate_limited`(429), `validation_error`(400), 5xx. `APIResponseError`·`isNotionClientError` 등 판별 유틸
- [ ] 8. 결론과 근거 URL을 ROADMAP 진행 메모 T003 항목에 기록

## 완료 기준
- [ ] 진행 메모 T003 항목에 1~7번 결론·근거 기록
- [ ] `last_edited_time`이 분 단위면 리스크 표 대응(README 명시)을 T083 작업 파일에 추가
- [ ] SDK가 자동 재시도를 하면 T047의 재시도 구현 범위를 "SDK 설정만"으로 축소해 작업 파일에 반영

## 테스트 체크리스트
**Vitest** — 해당 없음
- (테스트 대상 아님: 문서 조사. 결론은 T044·T046·T048·T059 테스트로 검증)

**Playwright MCP** — 해당 없음
- (UI 없음: 조사 작업)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
