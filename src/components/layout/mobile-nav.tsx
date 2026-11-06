"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { siteConfig } from "@/config/site"
import { useLoggedIn } from "@/hooks/use-logged-in"

// 모바일(md 미만) 전용 슬라이드 메뉴
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const isLoggedIn = useLoggedIn()
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="메뉴 열기"
          />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{siteConfig.name}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <Separator />
        <div className="flex flex-col gap-2 px-4">
          {isLoggedIn ? (
            <Link href="/dashboard" onClick={close} className={buttonVariants()}>
              대시보드
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={close}
                className={buttonVariants({ variant: "outline" })}
              >
                로그인
              </Link>
              <Link href="/signup" onClick={close} className={buttonVariants()}>
                회원가입
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
