# T079: 홈 Hero와 사이트 이름·설명을 지급 요청·승인 트래커 문구로 교체

> Phase 6 | 관련 기능: F013 | 선행 작업: T037 | 크기: S | 상태: 대기

## 명세
- PRD F013(기존 기능 활용, 문구만 수정): 비로그인 진입 화면, 서비스명·소개 문구, 로그인 버튼, 로그인 상태면 대시보드 바로가기.
- PRD 메뉴 구조: 상단 메뉴의 기능·예제·FAQ는 스타터킷 그대로 (Stats·기능·예제·FAQ 섹션 변경 없음).
- "시작하기" → `/login`은 로그인 상태면 `proxy.ts`가 `/dashboard`로 보낸다 (기존 기능). 헤더의 `HeaderAuth`(데스크톱)·모바일 메뉴가 로그인 상태에서 대시보드 링크를 보여주는지 확인하고 **누락 시에만** 보완.

## 관련 파일
- 수정: `src/config/site.ts` (`name`, `description`), `src/app/(marketing)/page.tsx` (Hero `badge`·`title`·`description`·`actions`)
- 생성: `src/config/site.test.ts`
- 참고: `src/components/sections/hero.tsx`, `src/components/layout/header-auth.tsx`, `src/components/layout/mobile-nav.tsx`, `src/hooks/use-logged-in.ts`

## 착수 전 확인
- [ ] `next16-docs`로 루트 `metadata`(title template)가 `siteConfig.name`을 쓰는 방식 확인 (`src/app/layout.tsx`)

## 구현 단계
- [ ] 1. `siteConfig.name = "지급 요청·승인 트래커"`(또는 확정된 서비스명), `description` = PRD 목적 문장 요약
- [ ] 2. 홈 Hero: 제목·설명을 서비스 소개로, 버튼 "로그인" → `/login`(로그인 상태면 proxy가 대시보드로), 보조 버튼은 기존 유지 여부 결정
- [ ] 3. 로그인 상태 대시보드 바로가기: `HeaderAuth`·모바일 메뉴 동작 확인 → 누락 시 `useLoggedIn` 기반 링크 추가
- [ ] 4. Stats·기능·예제·FAQ·CTA 섹션은 변경하지 않음
- [ ] 5. `src/config/site.test.ts` 작성 (아래 T081 케이스)

## 완료 기준
- [ ] 홈 첫 화면에 서비스명·소개 문구, 브라우저 탭 제목에 새 서비스명
- [ ] 로그인 상태에서 홈 헤더에 대시보드로 가는 링크 존재
- [ ] `/examples`·FAQ 등 기존 섹션 그대로

## 테스트 체크리스트
**Vitest (T081 중 `site.test.ts`)** — `npx vitest run src/config/site.test.ts`
- [ ] `siteConfig.name`이 `"StarterKit"`이 아니고 비어 있지 않음, `description` 비어 있지 않음
- [ ] `dashboardNav` href 목록 = `["/dashboard", "/dashboard/payments", "/dashboard/settings"]`, `/dashboard/orders` 없음
- [ ] `mainNav`가 홈·기능·예제·FAQ 4개 유지 (PRD: 변경 없음)

**Playwright MCP (T080)** — 전제: `npm run dev`
| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | 비로그인 `/` → `browser_snapshot` | Hero 제목에 서비스명, 소개 문구, "로그인" 버튼 |
| 2 | "로그인" 클릭 | `/login` |
| 3 | 데모 로그인 후 `/` | 헤더에 대시보드 링크(또는 버튼) |
| 4 | Hero 버튼 클릭(로그인 상태) | `/dashboard` 도착 |
| 5 | 페이지 제목(`document.title`) | 새 서비스명 포함 |
| 6 | `browser_resize` 375px → 모바일 메뉴 열기 | 로그인 상태 대시보드 링크, 메뉴 항목 정상 |
| 7 | 기능·FAQ 섹션 스크롤 | 기존 내용 유지 |
- [ ] 콘솔 오류 0건, 하이드레이션 경고 없음(로그인 힌트 쿠키 기반 헤더), 375px·1280px 확인

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
