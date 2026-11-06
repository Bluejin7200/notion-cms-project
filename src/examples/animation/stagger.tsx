"use client"

import { useState } from "react"
import { RotateCw } from "lucide-react"

import { Stagger, StaggerItem } from "@/components/motion/stagger"
import { Button } from "@/components/ui/button"

const notifications = [
  "김민준님이 프로젝트에 참여했습니다.",
  "주문 ORD-1050이 결제되었습니다.",
  "이서연님이 댓글을 남겼습니다.",
  "주간 리포트가 준비되었습니다.",
]

export default function StaggerExample() {
  const [replay, setReplay] = useState(0)

  return (
    <div className="space-y-4">
      {/* Stagger의 className이 그대로 컨테이너에 적용 (grid, flex 등 자유롭게) */}
      <Stagger key={replay} stagger={0.12} className="space-y-2">
        {notifications.map((text) => (
          <StaggerItem key={text} className="rounded-lg border p-3 text-sm">
            {text}
          </StaggerItem>
        ))}
      </Stagger>
      <Button size="sm" variant="outline" onClick={() => setReplay((n) => n + 1)}>
        <RotateCw /> 다시 재생
      </Button>
    </div>
  )
}
