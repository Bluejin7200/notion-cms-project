import type { Metadata } from "next"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Activity, CreditCard, ShoppingCart, Users } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import { Stagger, StaggerItem } from "@/components/motion/stagger"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { queryOrders } from "@/lib/mock/orders"

export const metadata: Metadata = {
  title: "대시보드",
}

type StatCard = {
  title: string
  value: string
  change: string
  icon: LucideIcon
}

// 샘플 통계 데이터
const statCards: StatCard[] = [
  { title: "총 매출", value: formatCurrency(45231000), change: "+20.1%", icon: CreditCard },
  { title: "신규 가입자", value: formatNumber(2350), change: "+18.3%", icon: Users },
  { title: "주문 수", value: formatNumber(12234), change: "+4.5%", icon: ShoppingCart },
  { title: "활성 사용자", value: formatNumber(573), change: "+2.1%", icon: Activity },
]

export default function DashboardPage() {
  // 서버 컴포넌트에서 목업 데이터 소스를 직접 조회 (주문 페이지와 같은 데이터)
  const { items: recentOrders } = queryOrders({ q: "", page: 1, pageSize: 5 })

  return (
    <>
      <PageHeader title="대시보드" description="서비스 현황을 한눈에 확인하세요." />

      {/* 통계 카드: 모바일 1열 → 태블릿 2열 → 데스크톱 4열 */}
      <Stagger immediate className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <StaggerItem key={stat.title}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardDescription>{stat.title}</CardDescription>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground">지난달 대비 {stat.change}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <Card>
        <CardHeader>
          <CardTitle>최근 주문</CardTitle>
          <CardDescription>최근 5건의 주문 내역입니다.</CardDescription>
          <CardAction>
            <Link href="/dashboard/orders" className={buttonVariants({ variant: "outline", size: "sm" })}>
              전체 보기
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
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
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(order.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
