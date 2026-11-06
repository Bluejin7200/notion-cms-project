import { NextResponse } from "next/server"
import type { z } from "zod"

// Route Handler 공통 응답 형태
export type ApiError = { message: string }

export function apiError(message: string, status = 400) {
  return NextResponse.json<ApiError>({ message }, { status })
}

/** 요청 본문을 JSON으로 읽어 스키마로 검증 (실패 시 첫 번째 오류 메시지 반환) */
export async function parseBody<T extends z.ZodType>(request: Request, schema: T) {
  const json: unknown = await request.json().catch(() => null)
  const result = schema.safeParse(json)
  if (!result.success) {
    return { data: null, error: result.error.issues[0]?.message ?? "잘못된 요청입니다." }
  }
  return { data: result.data as z.infer<T>, error: null }
}
