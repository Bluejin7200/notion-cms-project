import type { Control, FieldPath, FieldValues } from "react-hook-form"

// 모든 폼 필드 컴포넌트가 공유하는 기본 props
// TTransformedValues: 스키마가 값을 변환할 때(예: 문자열 입력 → 숫자) 검증 후 타입 (기본값은 입력 타입과 동일)
export type BaseFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = {
  control: Control<TFieldValues, unknown, TTransformedValues>
  name: TName
  label: string
  description?: string
  disabled?: boolean
}
