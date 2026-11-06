import { z } from "zod"

// 여러 폼에서 재사용하는 공통 스키마

export const emailSchema = z
  .email("올바른 이메일 형식이 아닙니다.")
  .min(1, "이메일을 입력해주세요.")

export const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다.")
  .regex(/[A-Za-z]/, "영문을 1자 이상 포함해야 합니다.")
  .regex(/[0-9]/, "숫자를 1자 이상 포함해야 합니다.")

/** 휴대폰 번호 (010-1234-5678 또는 01012345678) */
export const phoneSchema = z
  .string()
  .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, "올바른 휴대폰 번호가 아닙니다.")

export const requiredString = (label: string) =>
  z.string().trim().min(1, `${label}을(를) 입력해주세요.`)
