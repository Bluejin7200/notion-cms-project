import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { ExamplePeek } from "@/components/examples/example-peek"
import { Cta } from "@/components/sections/cta"
import { Faq, type FaqItem } from "@/components/sections/faq"
import { FeatureGrid, type Feature } from "@/components/sections/feature-grid"
import { Hero } from "@/components/sections/hero"
import { Stats, type StatItem } from "@/components/sections/stats"
import { buttonVariants } from "@/components/ui/button"
import { exampleCount, exampleFeatures } from "@/config/examples"
import { cn } from "@/lib/utils"

// 핵심 수치
const stats: StatItem[] = [
  { label: "UI 컴포넌트", value: "40+" },
  { label: "기능별 예제", value: String(exampleCount) },
  { label: "TypeScript", value: "100%" },
  { label: "지원 테마", value: "3" },
]

// 랜딩 페이지에 노출할 기능 목록 (예제 레지스트리와 공유)
// 카드에는 "예제" 칩을 달고, 호버 시 대표 예제 결과를 미리 보여줌 → 상세는 /examples에서
const features: Feature[] = exampleFeatures.map((feature) => ({
  icon: feature.icon,
  title: feature.title,
  description: feature.description,
  action: <ExamplePeek feature={feature} />,
}))

// 자주 묻는 질문
const faqs: FaqItem[] = [
  {
    question: "어떤 기술 스택으로 구성되어 있나요?",
    answer:
      "Next.js App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui를 기반으로 하며 Zustand, TanStack Query, React Hook Form, Zod가 포함되어 있습니다.",
  },
  {
    question: "새 UI 컴포넌트는 어떻게 추가하나요?",
    answer:
      "npx shadcn@latest add <컴포넌트명> 명령으로 src/components/ui에 컴포넌트를 추가한 뒤 자유롭게 수정해 사용하면 됩니다.",
  },
  {
    question: "로그인 기능이 실제로 동작하나요?",
    answer:
      "로그인 화면은 폼 검증까지 구현된 데모입니다. 인증 백엔드(예: Auth.js, Supabase)를 연결해 실제 로그인으로 확장할 수 있습니다.",
  },
  {
    question: "설정 값은 어디에 저장되나요?",
    answer:
      "대시보드 설정은 Zustand persist 미들웨어로 브라우저 localStorage에 저장되어 새로고침 후에도 유지됩니다.",
  },
  {
    question: "환경변수는 어떻게 관리하나요?",
    answer:
      ".env.example을 복사해 .env.local을 만들고, src/lib/env.ts의 Zod 스키마에 변수를 추가하면 타입과 함께 검증됩니다.",
  },
]

export default function Home() {
  return (
    <>
      <Hero
        badge="Next.js · TypeScript · shadcn/ui"
        title={
          <>
            아이디어를 가장 빠르게
            <br className="hidden sm:block" /> 웹으로 만드는 스타터킷
          </>
        }
        description="검증된 기술 스택과 기본 레이아웃이 준비되어 있습니다. 설정은 건너뛰고 바로 페이지 제작을 시작하세요."
        actions={
          <>
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg" }), "px-4")}
            >
              시작하기 <ArrowRight />
            </Link>
            <Link
              href="/examples"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "px-4")}
            >
              예제 보기
            </Link>
          </>
        }
      />

      <Stats items={stats} />

      <FeatureGrid
        id="features"
        title="포함된 기능"
        description="프로젝트에 바로 필요한 구성이 갖춰져 있습니다. 카드의 예제 버튼에 마우스를 올리면 결과를 미리 볼 수 있습니다."
        features={features}
      />

      <Faq id="faq" items={faqs} />

      <Cta
        title="지금 바로 시작하세요"
        description="대시보드와 설정 화면에서 포함된 컴포넌트가 실제로 어떻게 동작하는지 확인해 보세요."
        actions={
          <>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "px-4")}
            >
              대시보드 둘러보기 <ArrowRight />
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg", variant: "ghost" }),
                "px-4 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              )}
            >
              로그인
            </Link>
          </>
        }
      />
    </>
  )
}
