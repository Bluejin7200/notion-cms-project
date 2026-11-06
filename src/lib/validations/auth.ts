import { z } from "zod"

import { emailSchema, passwordSchema, requiredString } from "@/lib/validations/common"

export const loginSchema = z.object({
  email: emailSchema,
  // 로그인 시에는 형식 규칙 없이 입력 여부만 확인
  password: z.string().min(1, "비밀번호를 입력해주세요."),
  remember: z.boolean(),
})

export type LoginValues = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    name: requiredString("이름").max(20, "이름은 20자 이하여야 합니다."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "비밀번호를 한 번 더 입력해주세요."),
    // 체크박스 기본값(false)과 타입을 맞추기 위해 boolean + refine 사용
    terms: z.boolean().refine((value) => value, "이용약관에 동의해주세요."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  })

export type SignupValues = z.infer<typeof signupSchema>
