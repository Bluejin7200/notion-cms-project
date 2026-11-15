# T083: README와 CLAUDE.md를 지급 요청 구현 기준으로 갱신

> Phase 6 | 관련 기능: F009 | 선행 작업: T076 | 크기: S | 상태: 대기

## 명세
- 주문 예제 제거(T076) 후 README의 라우트 표·폴더 구조·"실제 백엔드로 교체하기" 표·테스트 설명과 CLAUDE.md의 예시 파일 참조가 실제와 어긋난다 (PRD↔코드 불일치, 진행 메모).
- Notion 연동 환경변수 표를 확정하고, `last_edited_time` 정밀도에 따른 남은 경합 위험(T003 결론)과 데모 로그인 보안 위험(PRD 가정)을 명시한다.

## 관련 파일
- 수정: `README.md`, `CLAUDE.md`
- 참고: `docs/PRD.md`, `docs/ROADMAP.md` 진행 메모

## 착수 전 확인
- [ ] T002·T003 진행 메모 결론 확인 (캐시 방식·정밀도 문구에 반영)

## 구현 단계
- [ ] 1. README "프로젝트 소개 > 진행 상황"·"주요 기능 (계획)" → 구현 완료 기준 문구
- [ ] 2. 라우트 표: `/dashboard/orders`·`/api/orders` 삭제, `/dashboard/payments`·`/dashboard/payments/[id]`, API 5종(`GET /api/payments`, `GET /api/payments/[id]`, `POST /api/payments/[id]/status`, `GET /api/payments/summary`, `POST /api/payments/refresh`) 추가
- [ ] 3. 폴더 구조: `lib/notion/`, `lib/payments/`, `components/payments/`, `lib/env.server.ts`, `lib/mock/` 삭제 반영
- [ ] 4. "실제 백엔드로 교체하기" 표: 주문 목업 행 삭제, 대시보드 행을 "Notion 집계"로, Notion 저장소 행 추가
- [ ] 5. 환경변수 표: "구현 예정" 제거, 서버 전용 표시, data source ID 확인 방법
- [ ] 6. 테스트 설명: 상태 전이·KST 날짜·마스킹·검색 정규화·Notion 변환·Route Handler 테스트
- [ ] 7. 캐시 정책·남은 경합 위험·보안 비범위 문구
- [ ] 8. CLAUDE.md: "데이터 흐름"의 `src/lib/api/orders.ts`·`use-orders-params.ts` 예시 → `src/lib/api/payments.ts`·`use-payments-params.ts`, "라우트 그룹"의 `orders` Route Handler → `payments`, 목업 설명 갱신

## 완료 기준
- [ ] `Grep "orders|주문" README.md CLAUDE.md` 0건 (스타터킷 역사 설명 등 의도적 예외는 진행 메모에 기록)
- [ ] README 라우트 표에 지급 요청 페이지 2개·API 5종
- [ ] 문서에 나온 파일 경로가 모두 실제 존재 (Glob으로 확인)

## 테스트 체크리스트
**Vitest** — 해당 없음
- (테스트 대상 아님: 문서 변경)

**Playwright MCP** — 해당 없음
- (UI 없음: 문서 변경)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
