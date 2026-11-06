"use client"

import { useState } from "react"
import { toast } from "sonner"

import { ResponsiveDialog } from "@/components/common/responsive-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// 공통 컴포넌트 ResponsiveDialog: 768px 이상은 Dialog, 미만은 하단 Drawer
// 모바일에서 확인하려면 브라우저 창을 좁히거나 개발자 도구의 기기 모드를 사용하세요
export default function ResponsiveDialogExample() {
  const [open, setOpen] = useState(false)

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={<Button variant="outline">주소 변경</Button>}
      title="배송지 변경"
      description="새 배송지를 입력해주세요."
    >
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          setOpen(false)
          toast.success("배송지를 변경했습니다.")
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="address">주소</Label>
          <Input id="address" defaultValue="서울시 강남구 테헤란로 123" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address-detail">상세 주소</Label>
          <Input id="address-detail" placeholder="동·호수" />
        </div>
        <Button type="submit">저장</Button>
      </form>
    </ResponsiveDialog>
  )
}
