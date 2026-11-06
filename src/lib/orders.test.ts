import { describe, expect, it } from "vitest"

import { ORDERS_PAGE_SIZE, ordersQuerySchema } from "@/lib/orders"

describe("ordersQuerySchema", () => {
  it("값이 없으면 기본값을 채운다", () => {
    expect(ordersQuerySchema.parse({})).toEqual({ q: "", page: 1, pageSize: ORDERS_PAGE_SIZE })
  })

  it("쿼리스트링 문자열을 숫자로 변환하고 검색어 공백을 제거한다", () => {
    expect(ordersQuerySchema.parse({ q: "  kim ", page: "3", pageSize: "20", status: "cancelled" })).toEqual({
      q: "kim",
      page: 3,
      pageSize: 20,
      status: "cancelled",
    })
  })

  it.each([
    [{ status: "foo" }, "올바르지 않은 주문 상태입니다."],
    [{ page: "abc" }, "페이지는 숫자여야 합니다."],
    [{ pageSize: "100" }, "페이지 크기는 50 이하여야 합니다."],
  ])("잘못된 조건 %o는 한국어 오류를 반환한다", (input, message) => {
    const result = ordersQuerySchema.safeParse(input)
    expect(result.error?.issues[0]?.message).toBe(message)
  })

  it("0 이하 페이지는 거부한다", () => {
    expect(ordersQuerySchema.safeParse({ page: "0" }).success).toBe(false)
  })
})
