// 페이지네이션 계산 유틸

/** 표시할 페이지 번호 목록 (현재 페이지 주변 ±1, 처음/끝, 나머지는 생략 기호) */
export function getPageNumbers(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const pages: (number | "ellipsis")[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)
  if (start > 2) pages.push("ellipsis")
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPages - 1) pages.push("ellipsis")
  pages.push(totalPages)
  return pages
}
