import type { LucideIcon } from "lucide-react"
import {
  Database,
  FormInput,
  Layers,
  Moon,
  Palette,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react"

// 기능별 예제 레지스트리 (메타데이터만, 컴포넌트 매핑은 src/examples/registry.tsx)
// 예제 파일 경로 규칙: src/examples/<기능 slug>/<파일명>

export type ExampleMeta = {
  id: string
  title: string
  description: string
  // 코드 탭에 보여줄 파일 (기본값: [`${id}.tsx`]), 여러 파일이면 순서대로 표시
  files?: string[]
}

export type ExampleFeature = {
  slug: string
  title: string
  description: string
  icon: LucideIcon
  // 홈 기능 카드 호버 팝업에 보여줄 대표 예제 id (시각적으로 결과가 잘 드러나는 예제)
  featured: string
  examples: ExampleMeta[]
  // 이 프로젝트에서 실제로 사용 중인 화면
  usedIn: { label: string; href: string }[]
}

export const exampleFeatures: ExampleFeature[] = [
  {
    slug: "nextjs",
    featured: "server-client",
    title: "Next.js App Router",
    description: "서버 컴포넌트와 파일 기반 라우팅으로 빠르게 페이지를 구성합니다.",
    icon: Rocket,
    examples: [
      {
        id: "server-client",
        title: "서버 컴포넌트와 클라이언트 컴포넌트",
        description: "데이터는 서버에서 준비하고, 상호작용이 필요한 부분만 클라이언트 컴포넌트로 분리합니다.",
        files: ["server-client.tsx", "server-client-counter.tsx"],
      },
      {
        id: "suspense",
        title: "Suspense 로딩 UI",
        description: "데이터를 기다리는 동안 Suspense fallback으로 로딩 화면을 보여줍니다.",
      },
    ],
    usedIn: [
      { label: "대시보드 홈 (서버에서 데이터 조회)", href: "/dashboard" },
      { label: "대시보드 로딩·오류 경계", href: "/dashboard/orders" },
    ],
  },
  {
    slug: "typescript",
    featured: "generic-component",
    title: "TypeScript",
    description: "엄격한 타입 검사로 안전하고 유지보수하기 쉬운 코드를 작성합니다.",
    icon: ShieldCheck,
    examples: [
      {
        id: "zod-infer",
        title: "Zod 스키마로 타입 추론",
        description: "스키마 하나로 런타임 검증과 TypeScript 타입을 동시에 얻습니다.",
      },
      {
        id: "generic-component",
        title: "제네릭 컴포넌트",
        description: "어떤 데이터 타입이든 받을 수 있으면서 타입 안전성을 유지하는 목록 컴포넌트입니다.",
      },
    ],
    usedIn: [{ label: "폼 필드 컴포넌트 (제네릭)", href: "/signup" }],
  },
  {
    slug: "tailwind",
    featured: "state-variants",
    title: "Tailwind CSS",
    description: "유틸리티 클래스와 디자인 토큰으로 일관된 스타일을 유지합니다.",
    icon: Palette,
    examples: [
      {
        id: "responsive-utilities",
        title: "반응형 유틸리티",
        description: "sm·md·lg 접두사로 화면 크기마다 다른 스타일을 적용합니다. 창 크기를 바꿔보세요.",
      },
      {
        id: "state-variants",
        title: "상태 variant",
        description: "hover·focus·disabled·group·data-* 상태에 따라 스타일을 바꿉니다.",
      },
    ],
    usedIn: [{ label: "랜딩 페이지 전체", href: "/" }],
  },
  {
    slug: "shadcn-ui",
    featured: "data-display",
    title: "shadcn/ui",
    description: "복사해서 소유하는 접근성 높은 컴포넌트를 자유롭게 커스터마이징합니다.",
    icon: Layers,
    examples: [
      {
        id: "overlays",
        title: "오버레이",
        description: "Dialog, Sheet, AlertDialog, Popover로 화면 위에 내용을 띄웁니다.",
      },
      {
        id: "data-display",
        title: "데이터 표시",
        description: "Tabs, Accordion, Table, Badge로 정보를 구조화해 보여줍니다.",
      },
      {
        id: "feedback",
        title: "피드백",
        description: "Toast, Skeleton, Progress, Tooltip으로 사용자에게 상태를 알려줍니다.",
      },
    ],
    usedIn: [
      { label: "주문 목록 (Table·Select·Pagination)", href: "/dashboard/orders" },
      { label: "설정 (Switch·AlertDialog)", href: "/dashboard/settings" },
    ],
  },
  {
    slug: "forms",
    featured: "basic-form",
    title: "React Hook Form + Zod",
    description: "스키마 기반 검증과 재사용 가능한 폼 필드 컴포넌트를 제공합니다.",
    icon: FormInput,
    examples: [
      {
        id: "basic-form",
        title: "기본 폼",
        description: "Zod 스키마와 폼 필드 컴포넌트로 검증·오류 메시지를 처리합니다.",
      },
      {
        id: "cross-field",
        title: "교차 필드 검증",
        description: "refine으로 두 필드를 비교하고, 오류를 특정 필드에 표시합니다.",
      },
      {
        id: "field-array",
        title: "동적 필드 배열",
        description: "useFieldArray로 항목을 추가·삭제하는 폼을 만듭니다.",
      },
    ],
    usedIn: [
      { label: "로그인", href: "/login" },
      { label: "회원가입 (비밀번호 확인)", href: "/signup" },
    ],
  },
  {
    slug: "state",
    featured: "query-status",
    title: "Zustand + TanStack Query",
    description: "클라이언트 상태와 서버 상태를 각각 알맞은 도구로 관리합니다.",
    icon: Database,
    examples: [
      {
        id: "zustand-cart",
        title: "Zustand 전역 상태 + 저장",
        description: "persist 미들웨어로 새로고침해도 유지되는 장바구니를 만듭니다.",
      },
      {
        id: "query-status",
        title: "useQuery 로딩·에러·재시도",
        description: "서버 데이터 조회의 로딩, 실패, 재시도, 캐시 상태를 다룹니다.",
      },
      {
        id: "optimistic-update",
        title: "useMutation 낙관적 업데이트",
        description: "서버 응답 전에 화면을 먼저 바꾸고, 실패하면 되돌립니다.",
      },
    ],
    usedIn: [
      { label: "주문 목록 (useQuery + URL 상태)", href: "/dashboard/orders" },
      { label: "설정 (Zustand persist)", href: "/dashboard/settings" },
    ],
  },
  {
    slug: "dark-mode",
    featured: "theme-switcher",
    title: "다크 모드",
    description: "next-themes 기반 라이트/다크/시스템 테마를 기본 제공합니다.",
    icon: Moon,
    examples: [
      {
        id: "theme-switcher",
        title: "테마 전환과 색상 토큰",
        description: "useTheme으로 테마를 바꾸고, 테마마다 달라지는 디자인 토큰을 확인합니다.",
      },
    ],
    usedIn: [{ label: "헤더 테마 토글", href: "/" }],
  },
  {
    slug: "responsive",
    featured: "responsive-grid",
    title: "반응형 레이아웃",
    description: "모바일 메뉴, 접히는 사이드바, 반응형 그리드로 모든 화면에 대응합니다.",
    icon: Smartphone,
    examples: [
      {
        id: "responsive-grid",
        title: "반응형 카드 그리드",
        description: "화면 폭에 따라 1→2→3열로 바뀌고, 카드 내부 배치도 함께 바뀝니다.",
      },
      {
        id: "responsive-dialog",
        title: "반응형 다이얼로그",
        description: "데스크톱에서는 Dialog, 모바일에서는 하단 Drawer로 열립니다.",
      },
    ],
    usedIn: [
      { label: "대시보드 (모바일에서 사이드바가 Sheet로 전환)", href: "/dashboard" },
    ],
  },
  {
    slug: "animation",
    featured: "stagger",
    title: "애니메이션",
    description: "motion 기반 스크롤 등장·순차 등장·숫자 카운트업을 재사용 컴포넌트로 제공합니다.",
    icon: Sparkles,
    examples: [
      {
        id: "fade-in",
        title: "FadeIn",
        description: "뷰포트에 들어올 때 방향을 지정해 페이드 인합니다.",
      },
      {
        id: "stagger",
        title: "Stagger",
        description: "목록 항목을 순서대로 등장시킵니다.",
      },
      {
        id: "animated-number",
        title: "AnimatedNumber",
        description: "숫자를 0부터 목표 값까지 카운트업합니다.",
      },
    ],
    usedIn: [{ label: "랜딩 페이지 (Hero·기능·통계)", href: "/" }],
  },
]

/** 예제의 코드 파일 목록 */
export function getExampleFiles(example: ExampleMeta) {
  return example.files ?? [`${example.id}.tsx`]
}

/** 기능의 대표 예제 (featured가 잘못되면 첫 번째 예제) */
export function getFeaturedExample(feature: ExampleFeature) {
  return feature.examples.find((e) => e.id === feature.featured) ?? feature.examples[0]
}

export function getExampleFeature(slug: string) {
  return exampleFeatures.find((feature) => feature.slug === slug)
}

/** 전체 예제 수 */
export const exampleCount = exampleFeatures.reduce((sum, f) => sum + f.examples.length, 0)
