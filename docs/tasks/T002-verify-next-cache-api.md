# T002: Next 16.3.8 로컬 문서로 캐시·Route Handler API를 확인해 캐시 설계를 확정

> Phase 0 | 관련 기능: F009 | 선행 작업: T001 | 크기: S | 상태: 대기

## 명세
- PRD "미확인 항목": Next 16.3.8 로컬 문서로 태그 캐시·즉시 만료 API 재확인.
- PRD "캐시·반영 정책": 목록·집계는 태그 캐시 60초, 상태 변경 성공 시 해당 태그 즉시 만료, 상세는 캐시하지 않음.
- Next 16은 학습 데이터와 API가 다르므로 기억으로 단정하지 않고 문서 경로를 근거로 기록한다. 아래 모든 항목은 `[확인 필요]`.

## 관련 파일
- 수정: `docs/ROADMAP.md` ("진행 메모 > 미확인·미확정"의 T002 항목)
- 참고: `node_modules/next/dist/docs/`, `next.config.ts`, `src/proxy.ts`, `src/app/(marketing)/` (정적 생성 페이지)

## 착수 전 확인
- [ ] `next16-docs`로 아래 확인 항목 조사 (로컬 문서 우선)

## 구현 단계
- [ ] 1. **60초 태그 캐시 방식**: `"use cache"` + `cacheTag` + `cacheLife` 와 `unstable_cache`(tags·revalidate) 중 16.3.8 권장 방식. `next.config.ts`의 `cacheComponents` 등 설정 필요 여부와 기존 정적 마케팅 페이지·`proxy.ts`·`dashboard/loading.tsx`에 미치는 영향
- [ ] 2. **즉시 만료 API**: `revalidateTag` 시그니처(두 번째 인수 프로필 필요 여부), `updateTag` 등 Server Action 전용 API 여부, **Route Handler에서 호출 가능한 API**
- [ ] 3. **Route Handler**: GET 기본 캐시 동작, 동적 라우트 `params`가 Promise인지 (`src/app/api/payments/[id]/route.ts`, `src/app/dashboard/payments/[id]/page.tsx`에 적용)
- [ ] 4. **캐시 항목 크기 상한**: 지급 요청 배열(최대 10,000건) 저장 가능 여부
- [ ] 5. **`import "server-only"`**: 사용 방법, 클라이언트 import 시 빌드 오류 형태
- [ ] 6. 결론과 문서 경로를 ROADMAP 진행 메모 T002 항목에 기록. 정책과 어긋나면 `prd-generator`로 PRD 수정 요청

## 완료 기준
- [ ] 진행 메모 T002 항목에 1~5번 각각 "결론 + 근거 문서 경로" 기록
- [ ] T049(캐시)·T054(새로고침)·T060(상태 변경)에서 사용할 함수 이름이 확정되어 해당 작업 파일 "착수 전 확인"에 반영
- [ ] PRD 캐시 정책과의 차이 여부가 "있음(PRD 수정 요청함) / 없음"으로 기록

## 테스트 체크리스트
**Vitest** — 해당 없음
- (테스트 대상 아님: 문서 조사. 결론은 T050·T055·T061 테스트로 검증)

**Playwright MCP** — 해당 없음
- (UI 없음: 조사 작업)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
