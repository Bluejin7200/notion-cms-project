import { describe, expect, it } from "vitest"

import { preferencesSchema } from "@/lib/validations/settings"

describe("preferencesSchema", () => {
  const valid = {
    displayName: "테스터",
    language: "ko",
    emailNotifications: true,
    marketingEmails: false,
  }

  it("올바른 설정이면 통과한다", () => {
    expect(preferencesSchema.safeParse(valid).success).toBe(true)
  })

  it("표시 이름이 20자를 넘으면 실패한다", () => {
    const result = preferencesSchema.safeParse({ ...valid, displayName: "가".repeat(21) })
    expect(result.error?.issues[0]?.message).toBe("표시 이름은 20자 이하여야 합니다.")
  })

  it("지원하지 않는 언어면 실패한다", () => {
    expect(preferencesSchema.safeParse({ ...valid, language: "ja" }).success).toBe(false)
  })
})
