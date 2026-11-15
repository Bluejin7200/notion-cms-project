# T025: 지급 요청 목록 API `GET /api/payments`를 만들어 검색·필터·페이징 결과를 반환

> Phase 2 | 관련 기능: F001, F007 | 선행 작업: T014, T016, T023 | 크기: S | 상태: 대기

## 명세
- PRD F001: 서버가 전체 조회 후 검색·필터·정렬·페이징, `{ items, total, page, pageSize }` 반환. PRD F008: 목록 응답에 계좌 없음.
- `src/proxy.ts` matcher가 `/api`를 포함하지 않는다 → **Route Handler에서 직접 `getSession()` 확인**.
- 이 단계의 데이터 소스는 목업(`data.ts`). Notion 오류 매핑은 T051에서 추가.

## 관련 파일
- 생성: `src/app/api/payments/route.ts`
- 참고: `src/app/api/orders/route.ts`, `src/lib/api/response.ts`, `src/lib/auth/get-session.ts`

## 착수 전 확인
- [ ] `next16-docs`로 Route Handler GET 기본 캐시 동작·`NextRequest.nextUrl.searchParams` 확인 (T002 결론 참고)

## 구현 단계
- [ ] 1. `getSession()` 없으면 `apiError("로그인이 필요합니다.", 401)`
- [ ] 2. `Object.fromEntries(searchParams)` → `paymentsQuerySchema.safeParse` 실패 시 첫 이슈 메시지로 400
- [ ] 3. `listPaymentRecords()` → `queryPayments(query, records, toKstDateString(new Date()))` → `NextResponse.json`
- [ ] 4. 응답이 Route Handler 캐시에 남지 않는지 확인 (T002 결론에 따라 필요 시 동적 처리)

## 완료 기준
- [ ] 로그인 상태에서 `GET /api/payments?status=approved`가 승인 건만 `{ items, total, page, pageSize }`로 반환
- [ ] 미인증 `GET /api/payments` → 401 `{ message: "로그인이 필요합니다." }`
- [ ] `GET /api/payments?page=0` → 400

## 테스트 체크리스트
**Vitest (T026)** — `npx vitest run src/app/api/payments/route.test.ts`
- [ ] 준비: `vi.mock("@/lib/auth/get-session")`, `vi.mock("@/lib/payments/data")`(픽스처 레코드), `server-only` 모킹
- [ ] 인증 없음 → 401, 데이터 함수 미호출
- [ ] 잘못된 입력: `status=foo`, `page=0`, `pageSize=100`, `overdue=yes` → 400 + 한국어 메시지 (`it.each`)
- [ ] 정상: 응답 형태 `{ items, total, page, pageSize }`, 기본 `page=1·pageSize=10`
- [ ] 정상: `overdue=true` → 연체 건만, `q=acme` → 대소문자 무시 일치
- [ ] 보안: 모든 `items`에 `account` 키 없음

**Playwright MCP** — 화면 연결은 T034에서 확인
- (UI 없음: API 단독 작업)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
