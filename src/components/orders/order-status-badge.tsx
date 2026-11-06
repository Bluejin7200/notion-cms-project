import { Badge } from "@/components/ui/badge"
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/orders"

// 주문 상태 배지
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={ORDER_STATUS_BADGE[status]}>{ORDER_STATUS_LABEL[status]}</Badge>
}
