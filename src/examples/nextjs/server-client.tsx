import { Server } from "lucide-react"

import { formatDate } from "@/lib/format"

import { ServerClientCounter } from "./server-client-counter"

// 서버 컴포넌트 (기본값): 서버에서만 실행되어 브라우저로 JS가 전송되지 않음
// DB 조회, 비밀 키 사용 등은 여기서 처리하고 결과만 props로 내려줌
async function getStats() {
  // 실제로는 DB나 외부 API를 조회하는 자리
  return { generatedAt: new Date(), initialCount: 3 }
}

export default async function ServerClientExample() {
  const { generatedAt, initialCount } = await getStats()

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex-1 rounded-lg border p-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Server className="size-4" /> 서버 컴포넌트
        </p>
        <p className="text-sm text-muted-foreground">
          이 영역은 서버에서 렌더링되었습니다.
          <br />
          생성 시각: {formatDate(generatedAt, "yyyy. MM. dd. HH:mm:ss")}
        </p>
      </div>
      {/* 서버에서 준비한 값을 클라이언트 컴포넌트에 props로 전달 */}
      <ServerClientCounter initialCount={initialCount} />
    </div>
  )
}
