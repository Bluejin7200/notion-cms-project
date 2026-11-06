import { describe, expect, it } from "vitest"

import { getPageNumbers } from "@/lib/pagination"

describe("getPageNumbers", () => {
  it("7페이지 이하면 모두 표시한다", () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(getPageNumbers(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it("페이지가 없으면 빈 목록이다", () => {
    expect(getPageNumbers(1, 0)).toEqual([])
  })

  it("첫 페이지 근처에서는 뒤쪽만 생략한다", () => {
    expect(getPageNumbers(1, 20)).toEqual([1, 2, "ellipsis", 20])
    expect(getPageNumbers(3, 20)).toEqual([1, 2, 3, 4, "ellipsis", 20])
  })

  it("가운데에서는 양쪽을 생략한다", () => {
    expect(getPageNumbers(10, 20)).toEqual([1, "ellipsis", 9, 10, 11, "ellipsis", 20])
  })

  it("마지막 페이지 근처에서는 앞쪽만 생략한다", () => {
    expect(getPageNumbers(20, 20)).toEqual([1, "ellipsis", 19, 20])
  })
})
