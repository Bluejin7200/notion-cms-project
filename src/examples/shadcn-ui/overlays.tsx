"use client"

import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Base UI 기반이라 asChild 대신 render 속성으로 트리거 요소를 지정
export default function OverlaysExample() {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Dialog: 화면 중앙 모달 */}
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>Dialog</DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
            <DialogDescription>변경 후 저장을 눌러주세요.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="overlay-name">이름</Label>
            <Input id="overlay-name" defaultValue="김민준" />
          </div>
          <DialogFooter>
            <DialogClose render={<Button />} onClick={() => toast.success("저장했습니다.")}>
              저장
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet: 화면 가장자리에서 밀려 나오는 패널 */}
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>Sheet</SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>알림</SheetTitle>
            <SheetDescription>새 알림 3개가 있습니다.</SheetDescription>
          </SheetHeader>
          <ul className="space-y-2 px-4 text-sm">
            <li>주문 ORD-1050이 접수되었습니다.</li>
            <li>이서연님이 댓글을 남겼습니다.</li>
            <li>주간 리포트가 준비되었습니다.</li>
          </ul>
        </SheetContent>
      </Sheet>

      {/* AlertDialog: 되돌릴 수 없는 작업 확인 (바깥 클릭으로 닫히지 않음) */}
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="destructive" />}>AlertDialog</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>삭제한 프로젝트는 복구할 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => toast("삭제했습니다. (데모)")}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Popover: 트리거 옆에 작게 뜨는 패널 */}
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>Popover</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>공유 링크</PopoverTitle>
            <PopoverDescription>링크가 있는 사람은 누구나 볼 수 있습니다.</PopoverDescription>
          </PopoverHeader>
          <Input readOnly value="https://example.com/s/abc123" />
        </PopoverContent>
      </Popover>
    </div>
  )
}
