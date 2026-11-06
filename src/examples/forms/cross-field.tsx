"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormInput } from "@/components/form/form-input"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"

// 여러 필드를 비교하는 규칙은 object 전체에 refine으로 작성하고, path로 오류 표시 위치 지정
// 금액은 입력창에서 문자열로 받고 z.coerce로 숫자로 변환 → 입력 타입과 검증 후 타입이 달라짐
// (빈 문자열은 Number("") === 0이 되므로, 먼저 문자열로 필수 입력을 확인한 뒤 pipe로 변환)
const amount = z
  .string()
  .trim()
  .min(1, "금액을 입력해주세요.")
  .pipe(
    z.coerce
      .number<string>({ error: "숫자만 입력해주세요." })
      .int("정수로 입력해주세요.")
      .min(0, "0 이상이어야 합니다.")
  )

const periodSchema = z
  .object({
    startDate: z.string().min(1, "시작일을 선택해주세요."),
    endDate: z.string().min(1, "종료일을 선택해주세요."),
    minPrice: amount,
    maxPrice: amount,
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: "종료일은 시작일 이후여야 합니다.",
    path: ["endDate"],
  })
  .refine((v) => v.maxPrice >= v.minPrice, {
    message: "최대 금액은 최소 금액보다 커야 합니다.",
    path: ["maxPrice"],
  })

// z.input: 폼이 다루는 값(금액이 string), z.output: onSubmit이 받는 값(금액이 number)
type PeriodInput = z.input<typeof periodSchema>
type PeriodOutput = z.output<typeof periodSchema>

export default function CrossFieldExample() {
  // useForm<입력 타입, 컨텍스트, 변환 후 타입>
  const form = useForm<PeriodInput, unknown, PeriodOutput>({
    resolver: zodResolver(periodSchema),
    defaultValues: { startDate: "", endDate: "", minPrice: "", maxPrice: "" },
    // 값을 고칠 때마다 다시 검증해 오류가 바로 사라지도록
    mode: "onTouched",
  })

  const onSubmit = (values: PeriodOutput) => {
    // values.minPrice는 이미 number → 바로 계산 가능
    toast.success(
      `${values.startDate} ~ ${values.endDate}, ${values.minPrice.toLocaleString()}~${values.maxPrice.toLocaleString()}원으로 검색합니다.`
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="max-w-md">
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput control={form.control} name="startDate" label="시작일" type="date" />
          <FormInput control={form.control} name="endDate" label="종료일" type="date" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput control={form.control} name="minPrice" label="최소 금액" inputMode="numeric" />
          <FormInput control={form.control} name="maxPrice" label="최대 금액" inputMode="numeric" />
        </div>
        <Button type="submit">검색</Button>
      </FieldGroup>
    </form>
  )
}
