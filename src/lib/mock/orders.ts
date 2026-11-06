import { orderBy, range } from "es-toolkit"

import {
  ORDER_STATUSES,
  type Order,
  type OrdersQuery,
  type OrdersResponse,
} from "@/lib/orders"

// 목업 주문 데이터: 시드 고정 난수로 매번 같은 50건을 생성 (실제 DB로 교체할 부분)

const CUSTOMERS = [
  ["김민준", "minjun"],
  ["이서연", "seoyeon"],
  ["박지호", "jiho"],
  ["최수아", "sua"],
  ["정도윤", "doyun"],
  ["강하은", "haeun"],
  ["조예준", "yejun"],
  ["윤지우", "jiwoo"],
  ["장시우", "siwoo"],
  ["임서윤", "seoyun"],
] as const

// 기준 시각: 데이터가 실행 시점에 따라 바뀌지 않도록 고정
const BASE_DATE = new Date("2026-10-04T09:00:00+09:00").getTime()
const HOUR = 60 * 60 * 1000

/** 결정적 의사 난수 생성기 (mulberry32) */
function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateOrders(count: number): Order[] {
  const random = createRandom(20261004)
  const orders = range(count).map((index): Order => {
    const [customer, emailId] = CUSTOMERS[Math.floor(random() * CUSTOMERS.length)]
    // 완료 60%, 처리 중 25%, 취소 15%
    const roll = random()
    const status = roll < 0.6 ? ORDER_STATUSES[0] : roll < 0.85 ? ORDER_STATUSES[1] : ORDER_STATUSES[2]
    return {
      id: `ORD-${String(1000 + count - index).padStart(4, "0")}`,
      customer,
      email: `${emailId}@example.com`,
      amount: Math.round((10000 + random() * 490000) / 1000) * 1000,
      status,
      createdAt: new Date(BASE_DATE - index * 7 * HOUR - Math.floor(random() * 5 * HOUR)).toISOString(),
    }
  })
  return orderBy(orders, ["createdAt"], ["desc"])
}

const ORDERS = generateOrders(50)

/** 검색·상태 필터·페이지네이션 적용 (순수 함수, 테스트 대상) */
export function queryOrders(
  { q, status, page, pageSize }: OrdersQuery,
  source: Order[] = ORDERS
): OrdersResponse {
  const keyword = q.toLowerCase()
  const filtered = source.filter((order) => {
    if (status && order.status !== status) return false
    if (!keyword) return true
    return (
      order.id.toLowerCase().includes(keyword) ||
      order.customer.includes(q) ||
      order.email.includes(keyword)
    )
  })

  const start = (page - 1) * pageSize
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  }
}
