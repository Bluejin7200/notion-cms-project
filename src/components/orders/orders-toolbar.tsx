"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { useDebounceCallback } from "usehooks-ts"

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useOrdersParams } from "@/hooks/use-orders-params"
import { ORDER_STATUS_LABEL, ORDER_STATUSES, type OrderStatus } from "@/lib/orders"

const ALL = "all"

const statusOptions = [
  { label: "전체 상태", value: ALL },
  ...ORDER_STATUSES.map((status) => ({ label: ORDER_STATUS_LABEL[status], value: status })),
]

function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value)
}

// 주문 목록 검색어 입력 + 상태 필터
export function OrdersToolbar() {
  const [{ q, status }, setParams] = useOrdersParams()
  // 입력은 즉시 반영하고, URL(조회 조건) 갱신은 300ms 디바운스
  const [search, setSearch] = useState(q)
  const updateQuery = useDebounceCallback((value: string) => {
    void setParams({ q: value || null, page: null })
  }, 300)

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <InputGroup className="sm:max-w-xs">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="주문 번호, 고객명, 이메일 검색"
          aria-label="주문 검색"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            updateQuery(event.target.value.trim())
          }}
        />
      </InputGroup>
      <Select
        items={statusOptions}
        value={status ?? ALL}
        onValueChange={(value) => {
          void setParams({ status: value && isOrderStatus(value) ? value : null, page: null })
        }}
      >
        <SelectTrigger className="w-full sm:w-36" aria-label="상태 필터">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
