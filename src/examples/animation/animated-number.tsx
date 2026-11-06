"use client"

import { useState } from "react"
import { RotateCw } from "lucide-react"

import { AnimatedNumber } from "@/components/motion/animated-number"
import { Button } from "@/components/ui/button"

// 앞의 숫자만 애니메이션하고 접두사·접미사·천 단위 쉼표·소수점 자릿수는 유지
const stats = [
  { label: "월간 방문자", value: "128,400" },
  { label: "전환율", value: "3.75%" },
  { label: "매출", value: "₩4,520만" },
  { label: "평점", value: "4.9" },
]

export default function AnimatedNumberExample() {
  const [replay, setReplay] = useState(0)

  return (
    <div className="space-y-4">
      <dl key={replay} className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border p-4">
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="text-2xl font-bold tabular-nums">
              <AnimatedNumber value={stat.value} duration={1.5} />
            </dd>
          </div>
        ))}
      </dl>
      <Button size="sm" variant="outline" onClick={() => setReplay((n) => n + 1)}>
        <RotateCw /> 다시 재생
      </Button>
    </div>
  )
}
