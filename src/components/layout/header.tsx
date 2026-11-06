import { Logo } from "@/components/common/logo"
import { CommandMenu } from "@/components/layout/command-menu"
import { Container } from "@/components/layout/container"
import { HeaderAuth } from "@/components/layout/header-auth"
import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"

// 상단 고정 헤더: 로고, 데스크톱 내비게이션, 검색, 테마 토글, 로그인 상태 버튼, 모바일 메뉴
// 로그인 상태는 클라이언트에서 확인하므로 이 헤더를 쓰는 페이지는 정적으로 생성됨
export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Container className="flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <MainNav />
        </div>

        <div className="flex items-center gap-1">
          <CommandMenu />
          <ThemeToggle />
          <HeaderAuth />
          <MobileNav />
        </div>
      </Container>
    </header>
  )
}
