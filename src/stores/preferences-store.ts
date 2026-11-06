import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

// 사용자 환경설정 전역 스토어 (localStorage에 저장)
export type Language = "ko" | "en"

export type Preferences = {
  displayName: string
  language: Language
  emailNotifications: boolean
  marketingEmails: boolean
}

type PreferencesState = Preferences & {
  setPreferences: (values: Partial<Preferences>) => void
  reset: () => void
}

export const defaultPreferences: Preferences = {
  displayName: "",
  language: "ko",
  emailNotifications: true,
  marketingEmails: false,
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      setPreferences: (values) => set(values),
      reset: () => set(defaultPreferences),
    }),
    {
      name: "preferences",
      storage: createJSONStorage(() => localStorage),
      // SSR 하이드레이션 불일치를 막기 위해 마운트 후 수동으로 복원
      skipHydration: true,
    }
  )
)
