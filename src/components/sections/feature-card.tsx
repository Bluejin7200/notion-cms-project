import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type FeatureCardProps = {
  icon: LucideIcon
  title: string
  description: string
  // 카드 하단 행동 요소 (예: 예제 미리보기 칩)
  action?: React.ReactNode
}

// 아이콘 + 제목 + 설명으로 구성된 기능 카드
export function FeatureCard({ icon: Icon, title, description, action }: FeatureCardProps) {
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && <CardFooter className="mt-auto">{action}</CardFooter>}
    </Card>
  )
}
