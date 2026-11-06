import type { LucideIcon } from "lucide-react"
import { LayoutDashboard, Settings, ShoppingCart } from "lucide-react"

import { env } from "@/lib/env"

// 사이트 전역 설정: 이름, 설명, 내비게이션 등을 한 곳에서 관리
export type NavItem = {
  title: string
  href: string
}

export type SidebarNavItem = NavItem & {
  icon: LucideIcon
}

export const siteConfig = {
  name: "StarterKit",
  description:
    "Next.js, TypeScript, Tailwind CSS, shadcn/ui 기반의 모던 웹 스타터킷",
  url: env.NEXT_PUBLIC_SITE_URL,
  // 마케팅 영역 상단 메뉴
  mainNav: [
    { title: "홈", href: "/" },
    { title: "기능", href: "/#features" },
    { title: "예제", href: "/examples" },
    { title: "FAQ", href: "/#faq" },
  ] satisfies NavItem[],
  // 대시보드 사이드바 메뉴
  dashboardNav: [
    { title: "대시보드", href: "/dashboard", icon: LayoutDashboard },
    { title: "주문", href: "/dashboard/orders", icon: ShoppingCart },
    { title: "설정", href: "/dashboard/settings", icon: Settings },
  ] satisfies SidebarNavItem[],
  links: {
    github: "https://github.com",
  },
}
