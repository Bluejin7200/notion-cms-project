"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { FormCheckbox } from "@/components/form/form-checkbox"
import { FormInput } from "@/components/form/form-input"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { signup } from "@/lib/api/auth"
import { signupSchema, type SignupValues } from "@/lib/validations/auth"

// 회원가입 폼: 데모 회원가입 API 호출 후 로그인 페이지로 이동
export function SignupForm() {
  const router = useRouter()
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: ({ user }) => {
      toast.success(`${user.name}님, 가입을 환영합니다. 로그인해주세요.`)
      router.push("/login")
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
      <FieldGroup>
        <FormInput
          control={form.control}
          name="name"
          label="이름"
          placeholder="홍길동"
          autoComplete="name"
        />
        <FormInput
          control={form.control}
          name="email"
          label="이메일"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <FormInput
          control={form.control}
          name="password"
          label="비밀번호"
          type="password"
          description="영문과 숫자를 포함해 8자 이상 입력해주세요."
          autoComplete="new-password"
        />
        <FormInput
          control={form.control}
          name="confirmPassword"
          label="비밀번호 확인"
          type="password"
          autoComplete="new-password"
        />
        <FormCheckbox control={form.control} name="terms" label="이용약관 및 개인정보 처리방침에 동의합니다" />
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending && <Spinner />}
          회원가입
        </Button>
      </FieldGroup>
    </form>
  )
}
