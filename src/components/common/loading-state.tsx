import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

type LoadingStateProps = {
  label?: string
  className?: string
}

// 스피너 + 안내 문구 로딩 표시
export function LoadingState({
  label = "불러오는 중...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground",
        className
      )}
    >
      <Spinner />
      <span>{label}</span>
    </div>
  )
}
