# T012: 서버 실행 시간대와 무관한 KST 날짜 유틸(오늘·이번 주·이번 달)을 작성

> Phase 1 | 관련 기능: F004, F005, F007 | 선행 작업: T001 | 크기: S | 상태: 대기

## 명세
- PRD "날짜 규칙": 오늘·이번 주·이번 달·연체 판단은 모두 서버에서 KST 기준 `YYYY-MM-DD`로 처리 (운영 서버가 UTC여도 어긋나지 않게).
- PRD F005: 이번 주 = 월~일. PRD "상태 전이 규칙": 처리일 = 마지막 상태 변경 시점의 KST 오늘(날짜만).
- 모든 함수는 `now: Date`(또는 `today` 문자열)를 인수로 받는다 (테스트 주입).
- `vitest.config.mts`가 `TZ=Asia/Seoul`로 고정되어 있어 UTC 버그를 놓칠 수 있다 → 구현이 프로세스 `TZ`에 의존하지 않아야 한다.

## 관련 파일
- 생성: `src/lib/date-kst.ts`
- 참고: `src/lib/format.ts` (기존 날짜 포맷), `vitest.config.mts`

## 착수 전 확인
- [ ] `context7`로 `@date-fns/tz` `TZDate` 사용법 확인 → `Intl`만으로 충분하면 도입하지 않음 (결정을 진행 메모에 기록)

## 구현 단계
- [ ] 1. `toKstDateString(now: Date): string` — `Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year, month, day })`로 `YYYY-MM-DD`
- [ ] 2. 날짜 문자열 산술 헬퍼: `addDays(date: string, n)` — `Date.UTC` 기반으로 계산해 프로세스 TZ 비의존
- [ ] 3. `getKstWeekRange(today: string): { start, end }` — 월요일 시작, 일요일 끝 (`getUTCDay()`로 요일 계산)
- [ ] 4. `getKstMonthRange(today: string): { start, end }` — 1일 ~ 말일 (윤년 포함)
- [ ] 5. `isDateInRange(date, range)` — 문자열 사전순 비교 (`YYYY-MM-DD`)
- [ ] 6. 형식이 잘못된 `today` 입력 시 동작 정의 (오류 throw)

## 완료 기준
- [ ] `toKstDateString(new Date("2026-11-15T15:00:00Z"))` = `"2026-11-16"`, `toKstDateString(new Date("2026-11-15T14:59:59Z"))` = `"2026-11-15"`
- [ ] `getKstWeekRange("2026-11-15")`(일요일) = `{ start: "2026-11-09", end: "2026-11-15" }`
- [ ] 파일에 `getHours`·`getDate`·`getDay`(로컬 시간대 메서드) 사용 없음

## 테스트 체크리스트
**Vitest (T013)** — `npx vitest run src/lib/date-kst.test.ts`
- [ ] KST 자정 경계: `2026-11-15T14:59:59Z` → 15일, `2026-11-15T15:00:00Z` → 16일
- [ ] 주 경계: 일요일 `2026-11-15` → 11/09~11/15, 월요일 `2026-11-16` → 11/16~11/22
- [ ] 주가 월·연도를 넘는 경우: `2026-12-31`(목) → 12/28~2027-01-03
- [ ] 월 범위: 2026-02 → 02-01~02-28, 2028-02(윤년) → 02-29, 12월 → 12-31
- [ ] `it.each`로 요일 7일 모두의 주 시작이 월요일인지
- [ ] 잘못된 형식(`"2026-13-01"`, `""`) → 오류
- [ ] UTC 실행 확인: `TZ=UTC npx vitest run src/lib/date-kst.test.ts`로도 통과하는지 실행해 보고, config의 `env.TZ`가 외부 TZ를 덮어써 의미가 없으면 테스트 안에서 `process.env.TZ` 변경 없이 UTC instant 입력만으로 검증했음을 진행 메모에 기록 `[확인 필요]`

**Playwright MCP** — 해당 없음
- (UI 없음: 순수 함수)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
