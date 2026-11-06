"use client"

import { useState } from "react"
import { RotateCw } from "lucide-react"

import { FadeIn } from "@/components/motion/fade-in"
import { Button } from "@/components/ui/button"

const directions = ["up", "down", "left", "right"] as const

const labels: Record<(typeof directions)[number], string> = {
  up: "아래에서 위로",
  down: "위에서 아래로",
  left: "오른쪽에서",
  right: "왼쪽에서",
}

export default function FadeInExample() {
  // key를 바꾸면 컴포넌트가 다시 마운트되어 애니메이션이 재생됨
  const [replay, setReplay] = useState(0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" key={replay}>
        {directions.map((direction, index) => (
          // 뷰포트 진입 시 1회 재생 (immediate를 주면 마운트 즉시 재생)
          <FadeIn key={direction} direction={direction} delay={index * 0.1} distance={24}>
            <div className="flex h-20 items-center justify-center rounded-lg border bg-muted/50 text-sm">
              {labels[direction]}
            </div>
          </FadeIn>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={() => setReplay((n) => n + 1)}>
        <RotateCw /> 다시 재생
      </Button>
    </div>
  )
}
