# T045: Notion API 오류를 사용자에게 안전한 HTTP 응답(상태·한국어 메시지)으로 매핑

> Phase 3 | 관련 기능: F009 | 선행 작업: T003 | 크기: S | 상태: 대기

## 명세
- PRD 사용자 여정: Notion 조회 실패 → 오류 안내 + 재시도. PRD 상세: 실패(전이 불가·수정 충돌·Notion 오류) 구분 안내.
- 오류 메시지에 토큰·data source ID·내부 스택을 노출하지 않는다 (공개 저장소·데모 로그인).
- 통합 공유 누락(401·403)은 사용자 잘못이 아니므로 502로 응답하고 서버 로그에 점검 안내를 남긴다.
- 오류 코드 이름·판별 유틸은 T003 결론을 따른다 `[확인 필요]`.

## 관련 파일
- 생성: `src/lib/notion/errors.ts`
- 참고: `src/lib/api/response.ts`(`apiError`)

## 착수 전 확인
- [ ] `notion-api-docs`로 `APIResponseError`·`isNotionClientError`·`APIErrorCode`·`ClientErrorCode`(타임아웃) 확인

## 구현 단계
- [ ] 1. `toNotionHttpError(error: unknown): { status: number; message: string }`
- [ ] 2. 매핑: `object_not_found`·`validation_error`(잘못된 ID 형식) → 404 "지급 요청을 찾을 수 없습니다." / `rate_limited` → 503 "요청이 많아 잠시 후 다시 시도해 주세요." / `unauthorized`·`restricted_resource` → 502 "Notion 연결을 확인해 주세요." / `conflict_error` → 409 "다른 곳에서 수정됨" / 5xx·타임아웃·기타 → 502 "Notion 조회에 실패했습니다."
- [ ] 3. `console.error("[notion]", code, status)` — 코드·상태만 기록, 401·403은 "통합 공유와 NOTION_TOKEN을 확인하세요" 안내 추가
- [ ] 4. 도메인 오류(`ConflictError`·`TransitionError`·`NotFoundError`)는 T058에서 정의 후 같은 함수에서 처리하도록 확장 포인트 마련
- [ ] 5. `notionErrorResponse(error)` = `apiError(message, status)` 편의 함수

## 완료 기준
- [ ] `object_not_found` → 404, `rate_limited` → 503, `unauthorized` → 502, 일반 `Error` → 502
- [ ] 반환 메시지에 `NOTION_TOKEN`·ID·원문 오류 메시지가 포함되지 않음

## 테스트 체크리스트
**Vitest (T046)** — `npx vitest run src/lib/notion/errors.test.ts`
- [ ] 표 기반(`it.each`): 401 `unauthorized`, 403 `restricted_resource`, 404 `object_not_found`, 400 `validation_error`, 409 `conflict_error`, 429 `rate_limited`, 500·502·503 → 기대 `{ status, message }`
- [ ] 타임아웃(`ClientErrorCode.RequestTimeout` 등) → 502
- [ ] 알 수 없는 값(`"문자열"`, `null`, 일반 `Error`) → 502
- [ ] 보안: 원문 오류 메시지에 토큰 형태 문자열이 있어도 반환 메시지에 없음
- [ ] 로그: `console.error` 호출 인수에 원문 메시지·토큰 없음

**Playwright MCP** — 오류 화면은 Phase 3 회귀 7번에서 확인
- (UI 없음: 서버 유틸)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
