"use client"

import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs"

import { ORDER_STATUSES } from "@/lib/orders"

// 주문 목록의 검색어·상태·페이지를 URL 쿼리스트링과 동기화
// (새로고침·뒤로가기·링크 공유 시에도 조회 조건 유지)
export function useOrdersParams() {
  return useQueryStates(
    {
      q: parseAsString.withDefault(""),
      status: parseAsStringLiteral(ORDER_STATUSES),
      page: parseAsInteger.withDefault(1),
    },
    // 조건 변경은 히스토리를 쌓지 않음
    { history: "replace" }
  )
}
