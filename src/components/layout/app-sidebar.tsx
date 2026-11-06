"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

import { Logo } from "@/components/common/logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { siteConfig } from "@/config/site"
import { notifySessionChange } from "@/hooks/use-logged-in"
import { usePreferencesHydrated } from "@/hooks/use-store-hydrated"
import { logout } from "@/lib/api/auth"
import type { Session } from "@/lib/auth/session"
import { usePreferencesStore } from "@/stores/preferences-store"

type AppSidebarProps = {
  user: Session
}

// 대시보드 좌측 사이드바 (모바일에서는 자동으로 Sheet로 전환)
export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  // 설정 화면에서 지정한 표시 이름이 있으면 세션 이름보다 우선
  const hydrated = usePreferencesHydrated()
  const preferredName = usePreferencesStore((state) => state.displayName)
  const displayName = hydrated && preferredName ? preferredName : user.name

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      notifySessionChange()
      toast.success("로그아웃했습니다.")
      router.replace("/")
      router.refresh()
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* 로고는 사이트 공통 규칙대로 메인 페이지로 이동 (대시보드 홈은 아래 메뉴로 이동) */}
        <Logo
          href="/"
          className="h-8 px-2 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:[&>span]:hidden"
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {siteConfig.dashboardNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="사용자">
              <Avatar className="size-8">
                <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="로그아웃"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut />
              <span>로그아웃</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
