import { z } from "zod"

// 주문 도메인 공통 정의 (서버·클라이언트 공용)

export const ORDER_STATUSES = ["completed", "processing", "cancelled"] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type Order = {
  id: string
  customer: string
  email: string
  amount: number
  status: OrderStatus
  // ISO 날짜 문자열
  createdAt: string
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  completed: "완료",
  processing: "처리 중",
  cancelled: "취소",
}

export const ORDER_STATUS_BADGE: Record<OrderStatus, "default" | "secondary" | "destructive"> = {
  completed: "default",
  processing: "secondary",
  cancelled: "destructive",
}

export const ORDERS_PAGE_SIZE = 10

/** 주문 목록 조회 조건 (URL 쿼리스트링 → 숫자 변환 포함) */
export const ordersQuerySchema = z.object({
  q: z.string().trim().max(50).default(""),
  status: z.enum(ORDER_STATUSES, { error: "올바르지 않은 주문 상태입니다." }).optional(),
  page: z.coerce.number({ error: "페이지는 숫자여야 합니다." }).int().min(1).default(1),
  pageSize: z.coerce
    .number({ error: "페이지 크기는 숫자여야 합니다." })
    .int()
    .min(1)
    .max(50, "페이지 크기는 50 이하여야 합니다.")
    .default(ORDERS_PAGE_SIZE),
})

export type OrdersQuery = z.infer<typeof ordersQuerySchema>

export type OrdersResponse = {
  items: Order[]
  total: number
  page: number
  pageSize: number
}
