import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const members = [
  { name: "김민준", role: "관리자", status: "활성" },
  { name: "이서연", role: "편집자", status: "활성" },
  { name: "박지호", role: "뷰어", status: "초대됨" },
]

// Tabs로 영역을 나누고, 각 탭에 Table·Accordion 배치
export default function DataDisplayExample() {
  return (
    <Tabs defaultValue="members">
      <TabsList>
        <TabsTrigger value="members">멤버</TabsTrigger>
        <TabsTrigger value="faq">자주 묻는 질문</TabsTrigger>
      </TabsList>

      <TabsContent value="members">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>역할</TableHead>
              <TableHead className="text-right">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.name}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={member.status === "활성" ? "default" : "outline"}>
                    {member.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="faq">
        <Accordion>
          <AccordionItem value="invite">
            <AccordionTrigger>멤버는 어떻게 초대하나요?</AccordionTrigger>
            <AccordionContent>설정 → 멤버 메뉴에서 이메일로 초대할 수 있습니다.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="role">
            <AccordionTrigger>역할은 어떤 차이가 있나요?</AccordionTrigger>
            <AccordionContent>관리자는 모든 권한, 편집자는 수정 권한, 뷰어는 읽기 권한만 가집니다.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>
    </Tabs>
  )
}
