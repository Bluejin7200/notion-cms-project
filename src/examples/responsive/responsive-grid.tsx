import { FileText, Image as ImageIcon, Music, Video } from "lucide-react"

import { Badge } from "@/components/ui/badge"

const files = [
  { name: "기획서.pdf", type: "문서", size: "2.4MB", icon: FileText },
  { name: "메인 배너.png", type: "이미지", size: "1.1MB", icon: ImageIcon },
  { name: "소개 영상.mp4", type: "영상", size: "48MB", icon: Video },
  { name: "배경 음악.mp3", type: "오디오", size: "5.2MB", icon: Music },
  { name: "회의록.pdf", type: "문서", size: "320KB", icon: FileText },
  { name: "로고.png", type: "이미지", size: "80KB", icon: ImageIcon },
]

// 그리드 열 수(1→2→3)뿐 아니라 카드 내부 배치(가로 목록형 → 세로 카드형)도 함께 변경
export default function ResponsiveGridExample() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {files.map(({ name, type, size, icon: Icon }) => (
        <div
          key={name}
          className="flex items-center gap-3 rounded-lg border p-3 sm:flex-col sm:items-start sm:p-4"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-12">
            <Icon className="size-5 sm:size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{size}</p>
          </div>
          {/* 모바일에서는 오른쪽 끝, sm 이상에서는 아래쪽에 배지 */}
          <Badge variant="outline">{type}</Badge>
        </div>
      ))}
    </div>
  )
}
