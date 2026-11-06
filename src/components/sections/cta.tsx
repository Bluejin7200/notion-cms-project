import { Section } from "@/components/layout/section"
import { FadeIn } from "@/components/motion/fade-in"

type CtaProps = {
  title: string
  description?: string
  actions: React.ReactNode
}

// 페이지 하단 행동 유도(Call To Action) 섹션
export function Cta({ title, description, actions }: CtaProps) {
  return (
    <Section className="border-t">
      <FadeIn
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12"
      >
        <h2 className="text-3xl font-bold tracking-tight text-balance">{title}</h2>
        {description && (
          <p className="max-w-xl text-primary-foreground/80 text-pretty">
            {description}
          </p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">{actions}</div>
      </FadeIn>
    </Section>
  )
}
