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
import { Input } from "@/components/ui/input"

type FormInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = BaseFormFieldProps<TFieldValues, TName, TTransformedValues> &
  Pick<
    React.ComponentProps<"input">,
    "type" | "placeholder" | "autoComplete" | "inputMode"
  >

// React Hook Form과 연결된 텍스트 입력 필드
export function FormInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  label,
  description,
  disabled,
  ...inputProps
}: FormInputProps<TFieldValues, TName, TTransformedValues>) {
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Input
            {...inputProps}
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
