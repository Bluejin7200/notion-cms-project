"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormInput } from "@/components/form/form-input"
import { FormSelect } from "@/components/form/form-select"
import { FormTextarea } from "@/components/form/form-textarea"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { emailSchema, requiredString } from "@/lib/validations/common"

// 1) 스키마 정의 (공통 스키마 재사용)
const contactSchema = z.object({
  name: requiredString("이름"),
  email: emailSchema,
  topic: z.enum(["general", "billing", "bug"], { error: "문의 유형을 선택해주세요." }),
  message: z.string().min(10, "내용은 10자 이상 입력해주세요."),
})

type ContactValues = z.infer<typeof contactSchema>

const topicOptions = [
  { label: "일반 문의", value: "general" },
  { label: "결제", value: "billing" },
  { label: "버그 신고", value: "bug" },
]

export default function BasicFormExample() {
  // 2) zodResolver로 스키마 연결
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  })

  // 3) 검증을 통과한 값만 onSubmit에 전달됨 (타입: ContactValues)
  const onSubmit = (values: ContactValues) => {
    toast.success(`${values.name}님의 문의가 접수되었습니다.`)
    form.reset()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="max-w-md">
      <FieldGroup>
        {/* 4) 폼 필드 컴포넌트가 라벨·오류 메시지·접근성 속성을 처리 */}
        <FormInput control={form.control} name="name" label="이름" />
        <FormInput control={form.control} name="email" label="이메일" type="email" />
        <FormSelect control={form.control} name="topic" label="문의 유형" options={topicOptions} />
        <FormTextarea control={form.control} name="message" label="내용" rows={3} />
        <Button type="submit">문의하기</Button>
      </FieldGroup>
    </form>
  )
}
