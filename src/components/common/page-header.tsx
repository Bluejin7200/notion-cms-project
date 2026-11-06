import { cn } from "@/lib/utils"

type PageHeaderProps = {
  title: string
  description?: string
  // 우측 버튼 영역
  actions?: React.ReactNode
  className?: string
}

// 앱/대시보드 페이지 상단 제목 영역
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}
