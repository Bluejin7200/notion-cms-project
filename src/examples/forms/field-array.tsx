"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormInput } from "@/components/form/form-input"
import { Button } from "@/components/ui/button"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { emailSchema, requiredString } from "@/lib/validations/common"

const inviteSchema = z.object({
  members: z
    .array(z.object({ name: requiredString("이름"), email: emailSchema }))
    .min(1, "최소 1명을 입력해주세요.")
    .max(5, "한 번에 5명까지 초대할 수 있습니다."),
})

type InviteValues = z.infer<typeof inviteSchema>

const emptyMember = { name: "", email: "" }

export default function FieldArrayExample() {
  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { members: [emptyMember] },
  })

  // useFieldArray: 배열 필드의 추가·삭제·순서 변경 관리 (key는 반드시 field.id 사용)
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "members" })

  const onSubmit = (values: InviteValues) => {
    toast.success(`${values.members.length}명에게 초대장을 보냈습니다. (데모)`)
    form.reset({ members: [emptyMember] })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="max-w-xl">
      <FieldGroup>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <FormInput control={form.control} name={`members.${index}.name`} label={`이름 ${index + 1}`} />
              <FormInput
                control={form.control}
                name={`members.${index}.email`}
                label={`이메일 ${index + 1}`}
                type="email"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-6"
              aria-label={`${index + 1}번째 멤버 삭제`}
              disabled={fields.length === 1}
              onClick={() => remove(index)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}

        {/* 배열 전체에 대한 오류 (최소/최대 개수) */}
        <FieldError errors={[form.formState.errors.members?.root ?? form.formState.errors.members]} />

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={fields.length >= 5}
            onClick={() => append(emptyMember)}
          >
            <Plus /> 멤버 추가
          </Button>
          <Button type="submit">초대하기</Button>
        </div>
      </FieldGroup>
    </form>
  )
}
