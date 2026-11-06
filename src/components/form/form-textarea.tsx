"use client"

import { useId } from "react"
import { Controller, type FieldPath, type FieldValues } from "react-hook-form"

import type { BaseFormFieldProps } from "@/components/form/types"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

type FormTextareaProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = BaseFormFieldProps<TFieldValues, TName, TTransformedValues> &
  Pick<React.ComponentProps<"textarea">, "placeholder" | "rows">

// React Hook Form과 연결된 여러 줄 입력 필드
export function FormTextarea<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  label,
  description,
  disabled,
  ...textareaProps
}: FormTextareaProps<TFieldValues, TName, TTransformedValues>) {
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Textarea
            {...textareaProps}
            {...field}
            value={(field.value as string | undefined) ?? ""}
            id={id}
            aria-invalid={fieldState.invalid}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}
