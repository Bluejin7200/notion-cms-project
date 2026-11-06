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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type SelectOption = {
  label: string
  value: string
}

type FormSelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = BaseFormFieldProps<TFieldValues, TName, TTransformedValues> & {
  options: SelectOption[]
  placeholder?: string
}

// React Hook Form과 연결된 선택 필드
export function FormSelect<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  label,
  description,
  disabled,
  options,
  placeholder = "선택하세요",
}: FormSelectProps<TFieldValues, TName, TTransformedValues>) {
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Select
            name={field.name}
            items={options}
            value={(field.value as string | undefined) ?? null}
            onValueChange={(value) => field.onChange(value)}
            disabled={field.disabled}
            inputRef={field.ref}
          >
            <SelectTrigger
              id={id}
              className="w-full"
              aria-invalid={fieldState.invalid}
              onBlur={field.onBlur}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}
