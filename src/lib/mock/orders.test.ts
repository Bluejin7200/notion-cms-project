import { describe, expect, it } from "vitest"

import { queryOrders } from "@/lib/mock/orders"
import type { Order, OrdersQuery } from "@/lib/orders"

const baseQuery: OrdersQuery = { q: "", page: 1, pageSize: 10 }

// 테스트용 고정 데이터
const sample: Order[] = [
  { id: "ORD-0003", customer: "김민준", email: "minjun@example.com", amount: 1000, status: "completed", createdAt: "2026-10-03T00:00:00.000Z" },
  { id: "ORD-0002", customer: "이서연", email: "seoyeon@example.com", amount: 2000, status: "processing", createdAt: "2026-10-02T00:00:00.000Z" },
  { id: "ORD-0001", customer: "김민준", email: "minjun@example.com", amount: 3000, status: "cancelled", createdAt: "2026-10-01T00:00:00.000Z" },
]

describe("queryOrders (고정 데이터)", () => {
  it("조건이 없으면 전체를 반환한다", () => {
    const result = queryOrders(baseQuery, sample)
    expect(result.total).toBe(3)
    expect(result.items.map((o) => o.id)).toEqual(["ORD-0003", "ORD-0002", "ORD-0001"])
  })

  it("상태로 필터링한다", () => {
    const result = queryOrders({ ...baseQuery, status: "processing" }, sample)
    expect(result.items.map((o) => o.id)).toEqual(["ORD-0002"])
  })

  it("고객명·주문 번호·이메일로 검색한다 (영문은 대소문자 무시)", () => {
    expect(queryOrders({ ...baseQuery, q: "김민준" }, sample).total).toBe(2)
    expect(queryOrders({ ...baseQuery, q: "ord-0001" }, sample).items[0]?.id).toBe("ORD-0001")
    expect(queryOrders({ ...baseQuery, q: "SEOYEON" }, sample).total).toBe(1)
  })

  it("검색과 상태 필터를 함께 적용한다", () => {
    const result = queryOrders({ ...baseQuery, q: "김민준", status: "cancelled" }, sample)
    expect(result.items.map((o) => o.id)).toEqual(["ORD-0001"])
  })

  it("페이지 단위로 잘라 반환하고 total은 전체 개수를 유지한다", () => {
    const result = queryOrders({ ...baseQuery, page: 2, pageSize: 2 }, sample)
    expect(result.items.map((o) => o.id)).toEqual(["ORD-0001"])
    expect(result).toMatchObject({ total: 3, page: 2, pageSize: 2 })
  })

  it("범위를 넘는 페이지는 빈 목록을 반환한다", () => {
    expect(queryOrders({ ...baseQuery, page: 5 }, sample).items).toEqual([])
  })
})

describe("queryOrders (기본 목업 데이터)", () => {
  it("50건을 최신순으로 생성한다", () => {
    const { items, total } = queryOrders({ ...baseQuery, pageSize: 50 })
    expect(total).toBe(50)
    const times = items.map((o) => new Date(o.createdAt).getTime())
    expect(times).toEqual([...times].sort((a, b) => b - a))
  })

  it("실행할 때마다 같은 데이터를 만든다 (시드 고정)", () => {
    expect(queryOrders(baseQuery)).toEqual(queryOrders(baseQuery))
    expect(queryOrders(baseQuery).items[0]?.id).toBe("ORD-1050")
  })
})
