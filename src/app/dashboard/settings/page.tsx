import type { Metadata } from "next"

import { PageHeader } from "@/components/common/page-header"
import { PreferencesForm } from "@/components/settings/preferences-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "설정",
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="설정" description="계정 환경설정을 관리합니다." />
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>환경설정</CardTitle>
          <CardDescription>변경 사항은 이 브라우저에 저장됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <PreferencesForm />
        </CardContent>
      </Card>
    </>
  )
}
