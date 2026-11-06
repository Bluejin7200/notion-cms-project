"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { FormInput } from "@/components/form/form-input"
import { FormSelect, type SelectOption } from "@/components/form/form-select"
import { FormSwitch } from "@/components/form/form-switch"
import { Button } from "@/components/ui/button"
import { FieldGroup, FieldSeparator } from "@/components/ui/field"
import { usePreferencesHydrated } from "@/hooks/use-store-hydrated"
import { preferencesSchema, type PreferencesValues } from "@/lib/validations/settings"
import { defaultPreferences, usePreferencesStore } from "@/stores/preferences-store"

const languageOptions: SelectOption[] = [
  { label: "한국어", value: "ko" },
  { label: "English", value: "en" },
]

// 스토어 상태에서 폼 값만 추출
function pickPreferences(state: PreferencesValues): PreferencesValues {
  return {
    displayName: state.displayName,
    language: state.language,
    emailNotifications: state.emailNotifications,
    marketingEmails: state.marketingEmails,
  }
}

// 환경설정 폼: 저장 시 Zustand 스토어(localStorage)에 반영
export function PreferencesForm() {
  const hydrated = usePreferencesHydrated()
  const setPreferences = usePreferencesStore((state) => state.setPreferences)
  const resetPreferences = usePreferencesStore((state) => state.reset)

  const form = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: defaultPreferences,
  })

  // localStorage 복원이 끝나면 저장된 값으로 폼을 채움
  useEffect(() => {
    if (hydrated) form.reset(pickPreferences(usePreferencesStore.getState()))
  }, [hydrated, form])

  const onSubmit = (values: PreferencesValues) => {
    setPreferences(values)
    form.reset(values)
    toast.success("설정을 저장했습니다.")
  }

  const handleReset = () => {
    resetPreferences()
    form.reset(defaultPreferences)
    toast.success("설정을 초기화했습니다.")
  }

  const { isDirty } = form.formState

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <FormInput
          control={form.control}
          name="displayName"
          label="표시 이름"
          description="대시보드에 표시될 이름입니다."
          placeholder="홍길동"
          disabled={!hydrated}
        />
        <FormSelect
          control={form.control}
          name="language"
          label="언어"
          options={languageOptions}
          disabled={!hydrated}
        />
        <FieldSeparator />
        <FormSwitch
          control={form.control}
          name="emailNotifications"
          label="이메일 알림"
          description="계정 활동과 중요한 소식을 이메일로 받습니다."
          disabled={!hydrated}
        />
        <FormSwitch
          control={form.control}
          name="marketingEmails"
          label="마케팅 이메일"
          description="새 기능과 이벤트 소식을 받습니다."
          disabled={!hydrated}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <ConfirmDialog
            trigger={
              <Button type="button" variant="outline" disabled={!hydrated}>
                초기화
              </Button>
            }
            title="설정을 초기화할까요?"
            description="저장된 모든 환경설정이 기본값으로 돌아갑니다."
            confirmLabel="초기화"
            destructive
            onConfirm={handleReset}
          />
          <Button type="submit" disabled={!hydrated || !isDirty}>
            저장
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
