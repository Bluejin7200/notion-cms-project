import { NextResponse } from "next/server"

import { apiError, parseBody } from "@/lib/api/response"
import { signupSchema } from "@/lib/validations/auth"

// 데모 회원가입: 검증만 하고 저장하지 않음 (실제 서비스에서는 사용자 생성 로직으로 교체)
export async function POST(request: Request) {
  const { data, error } = await parseBody(request, signupSchema)
  if (!data) return apiError(error)

  return NextResponse.json({ user: { name: data.name, email: data.email } }, { status: 201 })
}
