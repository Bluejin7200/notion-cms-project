import { z } from "zod"

// 공개 환경변수 스키마: NEXT_PUBLIC_ 변수는 반드시 정적으로 참조해야 번들에 포함됨
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
})

export const env = publicEnvSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
})
