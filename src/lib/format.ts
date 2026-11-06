import { format, formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

// 한국어 기본값을 적용한 포맷 유틸 (날짜: date-fns, 숫자: 내장 Intl)

type DateInput = Date | string | number

/** 날짜 포맷. 기본값 예: 2026. 10. 04. */
export function formatDate(date: DateInput, pattern = "yyyy. MM. dd.") {
  return format(new Date(date), pattern, { locale: ko })
}

/** 현재 기준 상대 시간. 예: 3분 전 */
export function formatRelative(date: DateInput) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko })
}

/** 천 단위 구분 숫자. 예: 1,234,567 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("ko-KR", options).format(value)
}

/** 통화 포맷. 예: ₩12,000 */
export function formatCurrency(value: number, currency = "KRW") {
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency }).format(
    value
  )
}

/** 축약 숫자. 예: 1.2만 */
export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(value)
}
