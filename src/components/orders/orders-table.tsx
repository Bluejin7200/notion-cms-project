"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { PackageSearch, TriangleAlert } from "lucide-react"

import { DataPagination } from "@/components/common/data-pagination"
import { EmptyState } from "@/components/common/empty-state"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { OrdersToolbar } from "@/components/orders/orders-toolbar"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useOrdersParams } from "@/hooks/use-orders-params"
import { ordersQueryOptions } from "@/lib/api/orders"
import { formatCurrency, formatDate } from "@/lib/format"
import { ORDERS_PAGE_SIZE } from "@/lib/orders"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 5

// 주문 목록: URL 조건 → TanStack Query 조회 → 테이블/로딩/빈 상태/에러 표시
export function OrdersTable() {
  const [{ q, status, page }, setParams] = useOrdersParams()
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useQuery(
    ordersQueryOptions({ q, status: status ?? undefined, page, pageSize: ORDERS_PAGE_SIZE })
  )

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0

  // URL의 페이지 번호가 범위를 벗어나면(예: 필터 변경, 잘못된 링크) 마지막 페이지로 보정
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) void setParams({ page: totalPages })
  }, [page, totalPages, setParams])

  return (
    <div className="flex flex-col gap-4">
      <OrdersToolbar />

      {isError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>주문 목록을 불러오지 못했습니다.</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
          <AlertAction>
            <Button size="sm" variant="outline" onClick={() => void refetch()}>
              다시 시도
            </Button>
          </AlertAction>
        </Alert>
      ) : (
        <>
          <Table className={cn(isPlaceholderData && "opacity-60 transition-opacity")}>
            <TableHeader>
              <TableRow>
                <TableHead>주문 번호</TableHead>
                <TableHead>고객</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>주문일</TableHead>
                <TableHead className="text-right">금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                Array.from({ length: 5 }, (_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: COLUMN_COUNT }, (_, cell) => (
                      <TableCell key={cell}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMN_COUNT}>
                    <EmptyState
                      icon={PackageSearch}
                      title="조건에 맞는 주문이 없습니다."
                      description="검색어나 상태 필터를 바꿔보세요."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((order) => (
                  <TableRow key={order.id} className="animate-in duration-300 fade-in">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{order.customer}</span>
                        <span className="text-xs text-muted-foreground">{order.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(order.amount)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data && (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="text-sm text-muted-foreground">총 {data.total}건</p>
              <DataPagination
                className="sm:mx-0 sm:w-auto"
                page={page}
                totalPages={totalPages}
                onPageChange={(next) => void setParams({ page: next })}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
