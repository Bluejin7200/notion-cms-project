import { z } from "zod"

import { requiredString } from "@/lib/validations/common"

// 대시보드 설정 화면의 환경설정 스키마 (preferences-store의 Preferences와 동일한 형태)
export const preferencesSchema = z.object({
  displayName: requiredString("표시 이름").max(20, "표시 이름은 20자 이하여야 합니다."),
  language: z.enum(["ko", "en"]),
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
})

export type PreferencesValues = z.infer<typeof preferencesSchema>
