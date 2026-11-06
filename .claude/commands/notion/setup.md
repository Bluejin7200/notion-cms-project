---
description: 'Notion 통합·데이터베이스 연결 상태를 점검하고 환경변수 설정을 안내합니다'
argument-hint: '[점검할 데이터베이스 ID 또는 URL (선택)]'
allowed-tools:
  [
    'Read',
    'Edit',
    'Grep',
    'Glob',
    'AskUserQuestion',
    'Bash(ls:*)',
    'Bash(node --env-file=.env.local:*)',
  ]
---

Notion을 CMS로 쓰기 위한 연결 상태를 점검한다. 인자: $ARGUMENTS

## 규칙
- `NOTION_TOKEN` 값은 절대 출력하지 않는다 (존재 여부와 앞 4자만). `.env.local`은 `Read`하지 않는다
- 조회 API만 호출한다 (생성·수정·삭제 금지)
- 서버 전용 변수에 `NEXT_PUBLIC_` 접두사를 붙이지 않는다
- `Notion-Version`은 프로젝트 코드에 값이 있으면 그 값, 없으면 `2025-09-03`

## 1. 환경변수 확인
1. `ls -a`로 `.env.local` 존재 확인. 없으면 아래 "설정 안내"를 보여주고 종료
2. 변수 존재 여부 확인:
   ```bash
   node --env-file=.env.local -e "for (const k of ['NOTION_TOKEN']) console.log(k, process.env[k] ? 'set(' + process.env[k].slice(0, 4) + '…)' : 'MISSING')"
   ```
3. `.env.example`에 `NOTION_TOKEN` 항목이 없으면 주석과 함께 추가한다 (값은 비워둠, 서버 전용 안내 포함)

## 2. 토큰 확인
```bash
node --env-file=.env.local -e "fetch('https://api.notion.com/v1/users/me',{headers:{Authorization:'Bearer '+process.env.NOTION_TOKEN,'Notion-Version':'2025-09-03'}}).then(async r=>{const b=await r.json();console.log(r.status,b.object,b.name??b.code,b.bot?.workspace_name??'')})"
```
- 200 → 통합 이름·워크스페이스 표시
- 401 → 토큰 오류 안내 후 종료

## 3. 데이터베이스 접근 확인 (인자가 있을 때)
- URL이면 32자리 ID를 추출해 하이픈 형식으로 변환
- `GET /v1/databases/{id}` 조회 → 응답의 data source 목록 표시
- 각 data source에 대해 `GET /v1/data_sources/{id}` 조회 → **속성 이름·타입 표**를 출력
- 404 `object_not_found` → "Notion에서 해당 데이터베이스 ⋯ 메뉴 → 연결(Connections) → 통합 추가" 안내
- 응답 구조가 예상과 다르면(버전 차이) `notion-api-docs` 에이전트로 확인하라고 안내

## 설정 안내 (처음 설정할 때)
1. https://www.notion.so/profile/integrations 에서 내부 통합 생성 → 토큰 복사
2. 프로젝트 루트 `.env.local`에 `NOTION_TOKEN=...` 추가 (커밋 금지)
3. CMS로 쓸 데이터베이스마다 ⋯ → 연결 → 만든 통합 추가
4. 데이터베이스 ID(또는 URL)를 인자로 `/notion:setup <ID>` 다시 실행

## 결과 보고 (표)
| 항목 | 상태 | 비고 |
|------|------|------|
| .env.local | ✅/❌ | |
| NOTION_TOKEN | ✅/❌ | |
| 토큰 유효성 | ✅/❌ | 통합 이름 |
| DB 접근 | ✅/❌/— | data source 수 |

마지막에 속성 표와 다음 단계(예: `prd-generator`로 데이터 모델 반영, DB/data source ID 환경변수 추가)를 제안한다.
