import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
}

// 섹션 제목 + 설명
export function SectionHeading({
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-2",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <h2 className="text-3xl font-bold tracking-tight text-balance">{title}</h2>
      {description && (
        <p className="max-w-2xl text-muted-foreground text-pretty">
          {description}
        </p>
      )}
    </div>
  )
}
