import { afterEach, describe, expect, it, vi } from "vitest"

import {
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelative,
} from "@/lib/format"

describe("formatDate", () => {
  it("기본 패턴으로 한국식 날짜를 만든다", () => {
    expect(formatDate("2026-10-04T09:00:00+09:00")).toBe("2026. 10. 04.")
  })

  it("패턴을 지정할 수 있다", () => {
    expect(formatDate(new Date(2026, 0, 5), "yyyy-MM-dd")).toBe("2026-01-05")
  })
})

describe("formatRelative", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("현재 기준 상대 시간을 한국어로 표시한다", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-04T12:00:00+09:00"))
    expect(formatRelative("2026-10-04T11:57:00+09:00")).toBe("3분 전")
  })
})

describe("숫자 포맷", () => {
  it("천 단위 구분 기호를 넣는다", () => {
    expect(formatNumber(1234567)).toBe("1,234,567")
  })

  it("원화 통화 기호를 붙인다", () => {
    expect(formatCurrency(12000)).toBe("₩12,000")
  })

  it("큰 수를 한국식 단위로 축약한다", () => {
    expect(formatCompactNumber(12000)).toBe("1.2만")
  })
})
