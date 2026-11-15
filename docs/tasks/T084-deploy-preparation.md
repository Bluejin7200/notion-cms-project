# T084: Vercel 배포를 준비하고 서버 전용 환경변수·토큰 없는 빌드·의존성 점검을 확인

> Phase 6 | 관련 기능: F009 | 선행 작업: T083 | 크기: S | 상태: 대기

## 명세
- PRD 기술 스택: 배포 Vercel, 서버 전용 `NOTION_TOKEN`·`NOTION_DATA_SOURCE_ID`, 운영 모드 `SESSION_SECRET` 필수 (CLAUDE.md).
- 공개 저장소이므로 `.env.local` 미커밋을 재확인하고, 토큰 없는 환경에서도 빌드가 통과해야 한다 (T004 지연 평가).
- PRD 가정: 배포 주소를 아는 누구나 상태를 바꿀 수 있음 → 배포 Notion DB에도 샘플 데이터만.

## 관련 파일
- 수정: Vercel 프로젝트 설정 (저장소 파일 변경 없음, 필요 시 `package.json` `engines` 확인)
- 참고: `.env.example`, `.gitignore`

## 착수 전 확인
- [ ] `next16-docs`로 Vercel 배포 시 캐시(태그 캐시·만료) 동작 차이 확인 `[확인 필요]`

## 구현 단계
- [ ] 1. `NOTION_TOKEN= NOTION_DATA_SOURCE_ID= npm run build` (빈 값) 통과 확인
- [ ] 2. `npm audit --omit=dev` 0건 확인 (`npm audit fix --force` 금지)
- [ ] 3. `git ls-files | grep .env` 결과가 `.env.example`만인지 확인
- [ ] 4. Vercel 환경변수: `NOTION_TOKEN`, `NOTION_DATA_SOURCE_ID`, `SESSION_SECRET`(32자 이상, `openssl rand -base64 32`), `NEXT_PUBLIC_SITE_URL` — 앞 3개는 `NEXT_PUBLIC_` 없이
- [ ] 5. Node 버전 22 이상 설정 확인
- [ ] 6. 배포 후 Vercel 함수 로그에 토큰·계좌 원문이 없는지 확인

## 완료 기준
- [ ] 토큰 없는 `npm run build` 통과
- [ ] `npm audit --omit=dev` 0건
- [ ] Vercel 배포 성공, 배포 주소 응답 200
- [ ] `.env.local`이 git 추적 대상 아님

## 테스트 체크리스트
**Vitest** — 해당 없음
- (테스트 대상 아님: 배포 설정. 전체 `npm test`는 T086에서 실행)

**Playwright MCP (T085)** — 전제: Vercel 배포 주소, **샘플 데이터만**
| # | 단계 | 기대 결과 |
|---|------|----------|
| 1 | 배포 주소 `/` | 홈 서비스명 표시, 콘솔 오류 0건 |
| 2 | 미인증 `/dashboard` | `/login?next=%2Fdashboard` |
| 3 | 데모 로그인 | 대시보드 카드 7종, `/api/payments/summary` 200 |
| 4 | "요청 건수" 카드 → 목록 → 행 클릭 | 목록·상세 정상, 증빙·마스킹 표시 |
| 5 | 샘플 1건 승인 → 목록 이동 | 상태 반영 (다중 인스턴스 지연 시 새로고침 버튼으로 반영되는지 기록) |
| 6 | 새로고침 버튼 | `POST /api/payments/refresh` 200 |
| 7 | 응답 헤더·본문 | 토큰·원문 계좌 없음 |
- [ ] 콘솔 오류 0건, 375px·1280px 확인

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
