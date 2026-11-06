"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { siteConfig } from "@/config/site"

// 홈은 정확히 일치할 때만, 그 외 메뉴는 하위 경로(/examples/*)에서도 활성 표시 (앵커 링크 제외)
function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

// 데스크톱(md 이상) 상단 내비게이션
export function MainNav() {
  const pathname = usePathname()

  return (
    <NavigationMenu className="hidden md:flex">
      {/* 메뉴 간격·크기 통일: 목록 gap-1, 각 링크 높이 h-9·최소 폭 w-16·가운데 정렬 */}
      <NavigationMenuList className="gap-1">
        {siteConfig.mainNav.map((item) => (
          <NavigationMenuItem key={item.href}>
            <NavigationMenuLink
              active={isActive(pathname, item.href)}
              render={<Link href={item.href} />}
              className="h-9 min-w-16 justify-center px-3 text-muted-foreground hover:text-foreground data-active:font-medium data-active:text-foreground"
            >
              {item.title}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
