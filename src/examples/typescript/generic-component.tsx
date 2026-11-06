"use client"

import { useState } from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

// 제네릭 컴포넌트: T가 무엇이든 받되, getKey·renderItem·onSelect가 같은 T를 쓰도록 강제
type SelectableListProps<T> = {
  items: T[]
  getKey: (item: T) => string
  renderItem: (item: T) => React.ReactNode
  selected: T | null
  onSelect: (item: T) => void
}

function SelectableList<T>({ items, getKey, renderItem, selected, onSelect }: SelectableListProps<T>) {
  return (
    <ul className="divide-y rounded-lg border">
      {items.map((item) => {
        const isSelected = selected !== null && getKey(selected) === getKey(item)
        return (
          <li key={getKey(item)}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted",
                isSelected && "bg-muted font-medium"
              )}
            >
              {renderItem(item)}
              {isSelected && <Check className="size-4 text-primary" />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

type User = { id: number; name: string; email: string }
type Plan = { code: "free" | "pro"; label: string; price: number }

const users: User[] = [
  { id: 1, name: "김민준", email: "minjun@example.com" },
  { id: 2, name: "이서연", email: "seoyeon@example.com" },
]
const plans: Plan[] = [
  { code: "free", label: "무료", price: 0 },
  { code: "pro", label: "프로", price: 9900 },
]

export default function GenericComponentExample() {
  const [user, setUser] = useState<User | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        {/* T = User로 추론 → renderItem의 u는 User 타입 */}
        <SelectableList
          items={users}
          getKey={(u) => String(u.id)}
          renderItem={(u) => (
            <span>
              {u.name} <span className="text-muted-foreground">{u.email}</span>
            </span>
          )}
          selected={user}
          onSelect={setUser}
        />
        <p className="text-sm text-muted-foreground">선택: {user?.name ?? "없음"}</p>
      </div>
      <div className="space-y-2">
        {/* 같은 컴포넌트를 T = Plan으로 재사용 */}
        <SelectableList
          items={plans}
          getKey={(p) => p.code}
          renderItem={(p) => (
            <span>
              {p.label} <span className="text-muted-foreground">{p.price.toLocaleString()}원/월</span>
            </span>
          )}
          selected={plan}
          onSelect={setPlan}
        />
        <p className="text-sm text-muted-foreground">선택: {plan?.label ?? "없음"}</p>
      </div>
    </div>
  )
}
