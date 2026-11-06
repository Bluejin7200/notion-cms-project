"use client"

import { useId } from "react"
import { Controller, type FieldPath, type FieldValues } from "react-hook-form"

import type { BaseFormFieldProps } from "@/components/form/types"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

// React Hook Form과 연결된 스위치 (boolean 값, 설정 화면용)
export function FormSwitch<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  label,
  description,
  disabled,
}: BaseFormFieldProps<TFieldValues, TName, TTransformedValues>) {
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <Field orientation="horizontal" data-invalid={fieldState.invalid}>
          <FieldContent>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={[fieldState.error]} />
          </FieldContent>
          <Switch
            id={id}
            name={field.name}
            checked={Boolean(field.value)}
            onCheckedChange={(checked) => field.onChange(checked)}
            onBlur={field.onBlur}
            disabled={field.disabled}
            aria-invalid={fieldState.invalid}
          />
        </Field>
      )}
    />
  )
}
