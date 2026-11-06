"use client"

import { useSyncExternalStore } from "react"

import { usePreferencesStore } from "@/stores/preferences-store"

// persist 스토어가 localStorage에서 복원되었는지 여부
export function usePreferencesHydrated() {
  return useSyncExternalStore(
    (onChange) => usePreferencesStore.persist.onFinishHydration(onChange),
    () => usePreferencesStore.persist.hasHydrated(),
    () => false
  )
}
