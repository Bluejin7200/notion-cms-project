import Link from "next/link"
import { Sparkles } from "lucide-react"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

type LogoProps = {
  href?: string
  className?: string
}

// 사이트 로고 (아이콘 + 이름)
export function Logo({ href = "/", className }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 font-semibold", className)}
    >
      <Sparkles className="size-5 text-primary" />
      <span>{siteConfig.name}</span>
    </Link>
  )
}
