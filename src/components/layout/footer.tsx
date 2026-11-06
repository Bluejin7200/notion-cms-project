import Link from "next/link"

import { Logo } from "@/components/common/logo"
import { Container } from "@/components/layout/container"
import { siteConfig } from "@/config/site"

// 하단 푸터
export function Footer() {
  return (
    <footer className="border-t">
      <Container className="flex flex-col gap-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Logo className="text-foreground" />
          <p>{siteConfig.description}</p>
        </div>
        <nav className="flex flex-wrap gap-4">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </Container>
      <Container className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </Container>
    </footer>
  )
}
