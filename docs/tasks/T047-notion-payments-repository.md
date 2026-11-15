# T047: Notion 지급 요청 전체 조회(커서 반복·상한)와 단건 조회 저장소를 작성

> Phase 3 | 관련 기능: F001, F002, F009 | 선행 작업: T041, T043 | 크기: M | 상태: 대기

## 명세
- PRD F001: 서버가 Notion 전체를 조회(100건 단위 커서 반복). 데이터 규모 수천 건 이하, **상한 10,000건**.
- 상한 초과 시 정책은 미확정 → 기본 가정 "상한까지 반환 + 서버 경고 로그", **착수 시 사용자 확인** `[확인 필요]`.
- 요청 속도 제한(평균 초당 약 3회로 알려짐 `[확인 필요]`) → 순차 요청, 429 시 백오프 재시도(SDK가 자동 재시도하면 SDK 설정만 사용, T003 결론).
- 상세는 캐시 없이 `pages.retrieve`. 다른 data source의 페이지 ID 검증(parent 검증)은 PRD 백로그(보안 강화)이므로 하지 않는다.

## 관련 파일
- 생성: `src/lib/notion/payments-repository.ts`
- 참고: `src/lib/notion/client.ts`(T041), `src/lib/notion/payment-mapper.ts`(T043)

## 착수 전 확인
- [ ] `notion-api-docs`로 `dataSources.query` 파라미터·응답, `pages.retrieve` 응답 타입, SDK 재시도 동작 확인
- [ ] 10,000건 초과 정책을 사용자와 확정해 ROADMAP 진행 메모 T047 항목 갱신

## 구현 단계
- [ ] 1. `import "server-only"`, `MAX_RECORDS = 10_000`, `PAGE_SIZE = 100`
- [ ] 2. `queryAllPaymentRecords(): Promise<PaymentRecord[]>` — `do { dataSources.query({ data_source_id, page_size: 100, start_cursor }) } while (has_more && next_cursor && 수집 < MAX)`
- [ ] 3. 응답 결과 중 전체 페이지만(`isFullPage`) `toPaymentRecord`로 변환
- [ ] 4. 상한 도달 시 중단 + `console.warn("[notion] 지급 요청이 10,000건을 넘어 일부만 조회했습니다.")`
- [ ] 5. 429 재시도: SDK 미지원 시 최대 3회, `Retry-After` 또는 지수 백오프(1s·2s·4s), 초과 시 오류 전파 (`sleep`은 주입 가능하게 해 테스트에서 즉시 처리)
- [ ] 6. `getPaymentRecord(id): Promise<PaymentRecord | null>` — `pages.retrieve({ page_id })`, `object_not_found` → `null`, 그 외 오류는 전파
- [ ] 7. 쓰기 함수 자리(`updatePaymentPage`)는 T058에서 추가

## 완료 기준
- [ ] SDK 모킹 250건(3회 응답) → 250건 반환, `query` 3회 호출, 두 번째부터 `start_cursor` 전달
- [ ] 개발 서버에서 Notion 샘플 약 30건이 `PaymentRecord`로 변환됨 (임시 로그로 확인, 커밋하지 않음)
- [ ] 없는 ID → `null`

## 테스트 체크리스트
**Vitest (T048)** — `npx vitest run src/lib/notion/payments-repository.test.ts`
- [ ] 준비: `vi.mock("@/lib/notion/client")`로 `dataSources.query`·`pages.retrieve` 모킹, `server-only` 모킹
- [ ] 페이지네이션: 100+100+50 → 250건, 커서 순서 검증
- [ ] 종료: `has_more: false` 즉시 종료, 결과 0건 → 빈 배열
- [ ] 상한: 매 응답 100건 + `has_more: true` 무한 → 10,000건에서 중단, `query` 100회, 경고 로그 1회
- [ ] 부분 응답(`object: "page"`이지만 properties 없음) 제외
- [ ] 429 재시도: 1회 429 후 성공 → 결과 정상, 재시도 1회 / 4회 연속 429 → 오류 전파 (재시도 상한)
- [ ] 오류 전파: 401·404(전체 조회)·5xx → 그대로 throw (매핑은 Route Handler에서)
- [ ] 단건: 존재 → 레코드, `object_not_found` → `null`, `restricted_resource` → throw

**Playwright MCP** — 실제 연동은 T053에서 확인
- (UI 없음: 저장소)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
