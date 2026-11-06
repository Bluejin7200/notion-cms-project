import { NextResponse, type NextRequest } from "next/server"

import { apiError } from "@/lib/api/response"
import { getSession } from "@/lib/auth/get-session"
import { queryOrders } from "@/lib/mock/orders"
import { ordersQuerySchema } from "@/lib/orders"

// 주문 목록 조회: GET /api/orders?q=&status=&page=&pageSize=
export async function GET(request: NextRequest) {
  if (!(await getSession())) return apiError("로그인이 필요합니다.", 401)

  const params = Object.fromEntries(request.nextUrl.searchParams)
  const result = ordersQuerySchema.safeParse(params)
  if (!result.success) {
    return apiError(result.error.issues[0]?.message ?? "잘못된 조회 조건입니다.")
  }

  return NextResponse.json(queryOrders(result.data))
}
