# T049: 목록·집계가 공유하는 60초 태그 캐시와 즉시 만료 함수를 작성

> Phase 3 | 관련 기능: F009 | 선행 작업: T002, T047 | 크기: S | 상태: 대기

## 명세
- PRD "캐시·반영 정책": 목록·집계는 태그 캐시 60초, 상태 변경 성공 시 해당 태그 즉시 만료, 상세는 캐시하지 않음.
- 목록과 집계가 **같은 캐시 항목**을 공유해 Notion 전체 조회가 60초에 최대 1회가 되게 한다 (속도 제한 대응).
- 구체 API(`"use cache"` + `cacheTag`/`cacheLife` 또는 `unstable_cache`, `revalidateTag`/`updateTag`)는 **T002 결론으로 결정** `[확인 필요]`.

## 관련 파일
- 생성: `src/lib/payments/cache.ts`
- 수정: (T002 결론에 따라) `next.config.ts`
- 참고: `src/lib/notion/payments-repository.ts`(T047)

## 착수 전 확인
- [ ] `next16-docs`로 T002 결론 재확인 — 캐시 지시어·설정, Route Handler에서 호출 가능한 만료 API, 캐시 항목 크기 상한
- [ ] `next.config.ts` 설정 변경 시 기존 정적 마케팅 페이지·`/examples` 빌드 영향 확인

## 구현 단계
- [ ] 1. `import "server-only"`, `PAYMENTS_CACHE_TAG = "payments"`, `PAYMENTS_CACHE_SECONDS = 60`
- [ ] 2. `getCachedPaymentRecords(): Promise<PaymentRecord[]>` — `queryAllPaymentRecords()`를 태그·60초 캐시로 감쌈
- [ ] 3. `expirePaymentsCache(): void` — T002에서 확인한 Route Handler용 즉시 만료 API 호출
- [ ] 4. 캐시 값은 직렬화 가능한 `PaymentRecord[]`만 (Date 객체·함수 금지)
- [ ] 5. 필요 시 `next.config.ts` 설정 추가, `npm run build` 출력에서 기존 정적 페이지 표시(○) 유지 확인
- [ ] 6. 개발 서버에서 60초 안 두 번째 요청이 Notion을 호출하지 않는지 서버 로그로 확인 (임시 로그, 커밋하지 않음)

## 완료 기준
- [ ] 60초 안 연속 두 번 `getCachedPaymentRecords()` → `queryAllPaymentRecords` 1회 (개발 서버 로그 또는 테스트)
- [ ] `expirePaymentsCache()` 후 다음 호출이 Notion을 다시 조회
- [ ] `npm run build` 통과, `/`·`/examples`가 여전히 정적 생성

## 테스트 체크리스트
**Vitest (T050)** — `npx vitest run src/lib/payments/cache.test.ts`
- [ ] 준비: `vi.mock("next/cache")`(사용하는 API 모킹), `vi.mock("@/lib/notion/payments-repository")`, `server-only` 모킹
- [ ] 태그·수명: 캐시 API가 태그 `"payments"`, 60초로 호출됨
- [ ] 결과 전달: 저장소 결과를 그대로 반환
- [ ] 만료: `expirePaymentsCache()`가 만료 API를 `"payments"`로 호출 (필요 시 프로필 인수 포함)
- [ ] 오류 전파: 저장소 오류가 그대로 throw (실패 결과를 캐시하지 않는지는 T002 결론에 따라 확인) `[확인 필요]`
- (`"use cache"` 지시어 방식이면 Vitest에서 캐시 동작 자체는 검증 불가 → 태그·만료 호출만 검증하고 실제 동작은 T056에서 확인)

**Playwright MCP** — 캐시 반영은 T056에서 확인
- (UI 없음: 캐시 계층)

## 변경 요약
<!-- 완료 후 작성: 바뀐 파일, 결정 사항, 남은 이슈 -->
