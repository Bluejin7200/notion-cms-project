import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getSession } from "@/lib/auth/get-session"

// 대시보드 영역 레이아웃: 좌측 사이드바 + 상단 바 + 본문
export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  // proxy에서 1차로 막지만, 레이아웃에서도 세션을 확인해 사용자 정보를 얻음
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <SidebarProvider>
      <AppSidebar user={session} />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
