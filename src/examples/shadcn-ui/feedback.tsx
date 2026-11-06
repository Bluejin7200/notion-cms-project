"use client"

import { useEffect, useState } from "react"
import { Info } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export default function FeedbackExample() {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  // 업로드 진행률 흉내
  useEffect(() => {
    if (!uploading) return
    const timer = setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          clearInterval(timer)
          setUploading(false)
          toast.success("업로드가 완료되었습니다.")
          return 100
        }
        return value + 10
      })
    }, 200)
    return () => clearInterval(timer)
  }, [uploading])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Toast: 성공·오류·작업 결과 알림 */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Toast</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.success("저장했습니다.")}>
            성공
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.error("네트워크 오류가 발생했습니다.")}>
            오류
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              toast("메시지를 삭제했습니다.", {
                action: { label: "되돌리기", onClick: () => toast("되돌렸습니다.") },
              })
            }
          >
            액션 포함
          </Button>
        </div>
      </div>

      {/* Progress: 진행률 */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Progress</p>
        <Progress value={progress} />
        <Button
          size="sm"
          variant="outline"
          disabled={uploading}
          onClick={() => {
            setProgress(0)
            setUploading(true)
          }}
        >
          {uploading ? `업로드 중 ${progress}%` : "업로드 시작"}
        </Button>
      </div>

      {/* Skeleton: 콘텐츠 자리 표시 */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Skeleton</p>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>

      {/* Tooltip: 아이콘 버튼 등 짧은 보조 설명 */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Tooltip</p>
        <Tooltip>
          <TooltipTrigger render={<Button size="icon" variant="outline" aria-label="도움말" />}>
            <Info />
          </TooltipTrigger>
          <TooltipContent>API 키는 설정 페이지에서 발급할 수 있습니다.</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
