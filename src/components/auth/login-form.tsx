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
import { notifySessionChange } from "@/hooks/use-logged-in"
import { login } from "@/lib/api/auth"
import { loginSchema, type LoginValues } from "@/lib/validations/auth"

type LoginFormProps = {
  // 로그인 성공 후 이동할 경로 (서버에서 검증된 값)
  redirectTo: string
}

// 로그인 폼: 데모 로그인 API 호출 후 세션 쿠키가 설정되면 원래 페이지로 이동
export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ user }) => {
      notifySessionChange()
      toast.success(`${user.name}님, 환영합니다.`)
      // 서버 컴포넌트가 새 세션을 읽도록 이동 후 갱신
      router.replace(redirectTo)
      router.refresh()
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
      <FieldGroup>
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
          autoComplete="current-password"
        />
        <FormCheckbox control={form.control} name="remember" label="로그인 상태 유지" />
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending && <Spinner />}
          로그인
        </Button>
      </FieldGroup>
    </form>
  )
}
