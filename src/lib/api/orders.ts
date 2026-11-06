import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"
import type { OrdersQuery, OrdersResponse } from "@/lib/orders"

// 주문 API 호출과 TanStack Query 설정 (실제 백엔드로 교체 시 이 파일만 수정)

export function fetchOrders({ q, status, page, pageSize }: OrdersQuery) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (q) params.set("q", q)
  if (status) params.set("status", status)
  return apiFetch<OrdersResponse>(`/api/orders?${params}`)
}

export function ordersQueryOptions(query: OrdersQuery) {
  return queryOptions({
    queryKey: ["orders", query],
    queryFn: () => fetchOrders(query),
    // 페이지 이동 중에는 이전 결과를 유지해 테이블 깜빡임 방지
    placeholderData: keepPreviousData,
  })
}
