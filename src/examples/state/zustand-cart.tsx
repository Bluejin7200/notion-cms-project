"use client"

import { useEffect, useState } from "react"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"

type Product = { id: string; name: string; price: number }
type CartItem = Product & { quantity: number }

type CartState = {
  items: CartItem[]
  add: (product: Product) => void
  decrease: (id: string) => void
  clear: () => void
}

// 스토어는 컴포넌트 밖에 한 번만 생성 → 어느 컴포넌트에서든 같은 상태 공유
// persist: localStorage에 저장해 새로고침해도 유지 (예제용 키로 앱 설정과 분리)
const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (product) =>
        set((state) => {
          const exists = state.items.find((item) => item.id === product.id)
          return {
            items: exists
              ? state.items.map((item) =>
                  item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
              : [...state.items, { ...product, quantity: 1 }],
          }
        }),
      decrease: (id) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
            .filter((item) => item.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "example-cart",
      storage: createJSONStorage(() => localStorage),
      // 서버 렌더링 결과와 어긋나지 않도록 마운트 후 수동 복원
      skipHydration: true,
    }
  )
)

const products: Product[] = [
  { id: "keyboard", name: "기계식 키보드", price: 89000 },
  { id: "mouse", name: "무선 마우스", price: 39000 },
  { id: "monitor", name: "27인치 모니터", price: 329000 },
]

// 장바구니 요약: 필요한 값만 selector로 구독 → 해당 값이 바뀔 때만 리렌더링
function CartSummary() {
  const items = useCartStore((state) => state.items)
  const clear = useCartStore((state) => state.clear)
  const decrease = useCartStore((state) => state.decrease)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShoppingCart className="size-4" /> 장바구니 ({items.length})
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">담긴 상품이 없습니다.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2">
              <span className="truncate">
                {item.name} × {item.quantity}
              </span>
              <Button size="icon-xs" variant="ghost" aria-label={`${item.name} 1개 빼기`} onClick={() => decrease(item.id)}>
                <Minus />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center justify-between border-t pt-3 text-sm">
        <span className="font-semibold">{formatCurrency(total)}</span>
        <Button size="sm" variant="ghost" disabled={items.length === 0} onClick={clear}>
          <Trash2 /> 비우기
        </Button>
      </div>
    </div>
  )
}

export default function ZustandCartExample() {
  const add = useCartStore((state) => state.add)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    void Promise.resolve(useCartStore.persist.rehydrate()).then(() => setHydrated(true))
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ul className="space-y-2">
        {products.map((product) => (
          <li key={product.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
            <span>
              {product.name}
              <span className="ml-2 text-muted-foreground">{formatCurrency(product.price)}</span>
            </span>
            <Button size="sm" variant="outline" onClick={() => add(product)}>
              <Plus /> 담기
            </Button>
          </li>
        ))}
      </ul>
      {/* 서로 다른 컴포넌트지만 같은 스토어를 구독 */}
      {hydrated ? <CartSummary /> : <div className="rounded-lg border p-4 text-sm text-muted-foreground">불러오는 중...</div>}
    </div>
  )
}
