import type { Metadata } from "next"

import { PageHeader } from "@/components/common/page-header"
import { OrdersTable } from "@/components/orders/orders-table"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "주문",
}

export default function OrdersPage() {
  return (
    <>
      <PageHeader title="주문" description="주문 내역을 검색하고 상태별로 확인합니다." />
      <Card>
        <CardContent>
          <OrdersTable />
        </CardContent>
      </Card>
    </>
  )
}
