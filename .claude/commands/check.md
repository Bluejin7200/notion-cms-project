---
description: '변경 파일에 lint·타입 검사·테스트와 프로젝트 규칙 점검을 실행하고 결과를 표로 요약합니다 (자동 수정 없음)'
argument-hint: '[점검 범위: 파일·폴더 경로, 생략 시 git 변경 파일 전체]'
allowed-tools:
  [
    'Read',
    'Glob',
    'Grep',
    'Bash(git status:*)',
    'Bash(git diff:*)',
    'Bash(git ls-files:*)',
    'Bash(npm run lint:*)',
    'Bash(npm test:*)',
    'Bash(npx tsc --noEmit:*)',
    'Bash(find:*)',
  ]
---

# Claude 명령어: Check

커밋 전에 lint · 타입 검사 · 테스트와 이 프로젝트 고유 규칙을 점검하고 통과/실패 표로 요약합니다.

> **자동 수정 금지**: 이 커맨드는 점검과 수정안 제시까지만 합니다. 파일을 수정하지 마세요.

## 사용법

```
/check                  # git 변경 파일 전체
/check src/examples     # 특정 폴더
/check src/app/api/products/route.ts
```

- 점검 범위: `$1` (생략 시 git 변경 파일 전체)

## 프로세스

### 1. 점검 대상 파일 정하기

- `$1`이 **있으면**: 해당 경로(파일 또는 폴더 아래 파일)를 대상으로 함. 경로가 없으면 중단
- `$1`이 **없으면**: 아래 결과를 합쳐 중복을 제거
  - `git diff --name-only HEAD` (스테이지 + 작업 트리 변경)
  - `git ls-files --others --exclude-standard` (새 파일)
- 삭제된 파일은 제외
- 규칙 점검(3단계)은 `src/` 아래 `.ts`·`.tsx` 파일과 `.env.example`만 대상
- 대상 파일이 하나도 없으면 "점검할 변경 사항이 없습니다"라고 알리고 종료

### 2. 자동 검사 실행 (프로젝트 전체 대상, 하나가 실패해도 나머지는 계속 실행)

```bash
npm run lint
npx tsc --noEmit
npm test
```

- 각 명령의 통과/실패와 오류 요약(파일:줄, 메시지)을 기록
- 오류가 점검 대상 파일에서 났는지, 기존 파일에서 났는지 구분해 표시

### 3. 프로젝트 규칙 점검 (점검 대상 파일만, Grep 사용)

주석 줄(`//`, `/* */`, `*`로 시작)에 나온 것은 위반이 아님. 의심 결과는 파일을 Read해서 실제 코드인지 확인 후 판정.

#### ① `asChild` 사용

- 패턴: `asChild`
- shadcn/ui가 **Base UI 기반**이라 `asChild`가 동작하지 않음 → `render` 속성으로 변경
- 수정안 예: `<DialogTrigger asChild><Button>열기</Button></DialogTrigger>` → `<DialogTrigger render={<Button />}>열기</DialogTrigger>`

#### ② `buttonVariants({ className })`에 충돌 클래스 전달

- 패턴: `buttonVariants\(\{[^}]*className` (여러 줄에 걸친 호출은 `multiline` 옵션으로 함께 확인)
- `buttonVariants`는 `className`을 병합하지 않고 이어 붙이기만 해서 `px-*`, `h-*`, `rounded-*`, `justify-*`, `bg-*`, `text-*` 등 기본 클래스와 충돌하면 의도대로 적용되지 않음
- **예외**: `src/components/ui/button.tsx`의 `cn(buttonVariants({ variant, size, className }))`처럼 이미 `cn()`으로 감싼 경우는 통과
- 수정안 예: `buttonVariants({ size: "lg", className: "px-4" })` → `cn(buttonVariants({ size: "lg" }), "px-4")` (`cn`은 `@/lib/utils`)

#### ③ `middleware.ts` 생성

- 프로젝트 전체에서 `middleware.ts`·`middleware.js` 파일 존재 여부 확인 (`node_modules`, `.next` 제외)
- Next.js 16에서는 middleware가 proxy로 대체됨 → 로직을 `src/proxy.ts`로 옮기고 `middleware.ts` 삭제
- 필요하면 `node_modules/next/dist/docs/`의 proxy 가이드 위치를 함께 안내

#### ④ `NEXT_PUBLIC_*` 추가 시 설정 누락

- 점검 대상 파일에서 `NEXT_PUBLIC_[A-Z0-9_]+` 이름을 모두 수집
- 각 변수가 아래 두 곳에 **모두** 있는지 확인
  - `src/lib/env.ts`: `publicEnvSchema`의 키 **그리고** `publicEnvSchema.parse({ ... })`의 `process.env.<이름>` 정적 참조
  - `.env.example`: `<이름>=` 줄과 한국어 설명 주석
- 누락이면 실패. 수정안에 추가할 스키마 줄과 `.env.example` 줄을 그대로 제시
- 참고: `NEXT_PUBLIC_*`는 `process.env[name]`처럼 동적으로 참조하면 번들에 포함되지 않음 → 발견 시 함께 지적

### 4. 결과 보고

아래 형식으로 요약:

```
## 점검 결과 (대상: <범위> · 파일 N개)

| 항목 | 결과 | 비고 |
| --- | --- | --- |
| npm run lint | ✅ 통과 / ❌ 실패 | 오류 N건 |
| npx tsc --noEmit | ✅ / ❌ | |
| npm test | ✅ / ❌ | N개 중 N개 통과 |
| asChild 사용 | ✅ / ❌ | 위치 |
| buttonVariants 충돌 클래스 | ✅ / ❌ | 위치 |
| middleware.ts | ✅ / ❌ | |
| NEXT_PUBLIC_* 설정 | ✅ / ❌ / ➖ 해당 없음 | 누락 변수 |
```

- 실패 항목마다 `파일:줄` 위치와 **수정 전/후 코드**로 수정안 제시 (적용은 하지 않음)
- 대상 파일과 무관한 기존 실패는 따로 구분해 표시

### 5. 다음 단계 안내

- **모두 통과**: "모든 점검을 통과했습니다. `/git:commit`으로 커밋하세요."
- **실패 있음**: 수정안을 적용한 뒤 `/check`를 다시 실행하라고 안내 (커밋 안내는 하지 않음)
