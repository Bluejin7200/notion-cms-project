"use client"

import { useState } from "react"
import { MousePointerClick } from "lucide-react"

import { Button } from "@/components/ui/button"

// 클라이언트 컴포넌트: "use client" 선언 → 상태(useState)·이벤트 처리 가능
export function ServerClientCounter({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount)

  return (
    <div className="flex-1 rounded-lg border p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-medium">
        <MousePointerClick className="size-4" /> 클라이언트 컴포넌트
      </p>
      <p className="mb-3 text-sm text-muted-foreground">
        서버에서 받은 초기값({initialCount})으로 시작해 브라우저에서 상태가 바뀝니다.
      </p>
      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline" onClick={() => setCount((c) => c - 1)}>
          -1
        </Button>
        <span className="w-8 text-center text-lg font-semibold tabular-nums">{count}</span>
        <Button size="sm" variant="outline" onClick={() => setCount((c) => c + 1)}>
          +1
        </Button>
      </div>
    </div>
  )
}
