"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getPageNumbers } from "@/lib/pagination"
import { cn } from "@/lib/utils"

type DataPaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

// 상태 기반 페이지네이션 (URL 이동 대신 onPageChange 호출)
export function DataPagination({ page, totalPages, onPageChange, className }: DataPaginationProps) {
  if (totalPages <= 1) return null

  const go = (target: number) => (event: React.MouseEvent) => {
    event.preventDefault()
    if (target >= 1 && target <= totalPages && target !== page) onPageChange(target)
  }

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text="이전"
            aria-label="이전 페이지"
            aria-disabled={page === 1}
            className={cn(page === 1 && "pointer-events-none opacity-50")}
            onClick={go(page - 1)}
          />
        </PaginationItem>
        {getPageNumbers(page, totalPages).map((item, index) => (
          <PaginationItem key={item === "ellipsis" ? `ellipsis-${index}` : item}>
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink href="#" isActive={item === page} onClick={go(item)}>
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            text="다음"
            aria-label="다음 페이지"
            aria-disabled={page === totalPages}
            className={cn(page === totalPages && "pointer-events-none opacity-50")}
            onClick={go(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
