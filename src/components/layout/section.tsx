import { Container } from "@/components/layout/container"
import { cn } from "@/lib/utils"

type SectionProps = React.ComponentProps<"section"> & {
  containerClassName?: string
}

// 상하 여백 + Container를 포함한 페이지 섹션
export function Section({
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("scroll-mt-14 py-16 sm:py-24", className)}
      {...props}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  )
}
