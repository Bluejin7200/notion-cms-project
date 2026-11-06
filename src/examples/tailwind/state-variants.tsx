"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

// 상태 variant: hover:, focus-visible:, disabled:, group-hover:, data-[state=...]:, aria-*: 등
export default function StateVariantsExample() {
  const [active, setActive] = useState(false)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* hover / active / focus-visible / disabled */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-95"
        >
          hover · active · focus
        </button>
        <button
          type="button"
          disabled
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          disabled
        </button>
      </div>

      {/* group-hover: 부모에 마우스를 올리면 자식 스타일 변경 */}
      <a
        href="#"
        onClick={(event) => event.preventDefault()}
        className="group flex items-center justify-between rounded-lg border p-3 text-sm transition hover:border-primary"
      >
        <span className="group-hover:text-primary">카드에 마우스를 올려보세요</span>
        <ArrowRight className="size-4 transition group-hover:translate-x-1 group-hover:text-primary" />
      </a>

      {/* data-* 속성으로 상태 표현 → 클래스 문자열 조건 분기 없이 스타일링 */}
      <button
        type="button"
        data-active={active}
        onClick={() => setActive((v) => !v)}
        className="rounded-lg border px-4 py-2 text-sm transition data-[active=true]:border-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
      >
        data-active={String(active)} (클릭)
      </button>

      {/* peer: 형제 요소 상태에 반응 (입력값이 형식에 맞지 않으면 안내 표시) */}
      <label className="flex flex-col gap-1 text-sm">
        이메일
        <input
          type="email"
          placeholder="잘못된 형식을 입력해보세요"
          className="peer rounded-lg border bg-transparent px-3 py-2 outline-none focus:border-ring user-invalid:border-destructive"
        />
        <span className="hidden text-xs text-destructive peer-user-invalid:block">
          올바른 이메일 형식이 아닙니다.
        </span>
      </label>
    </div>
  )
}
