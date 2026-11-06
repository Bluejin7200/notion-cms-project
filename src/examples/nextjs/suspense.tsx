"use client"

import { Suspense, use, useState } from "react"
import { RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type Profile = { name: string; role: string; joinedDays: number }

// 느린 API를 흉내 내는 함수 (1.5초 후 응답)
function fetchProfile(): Promise<Profile> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ name: "김민준", role: "프론트엔드 개발자", joinedDays: 128 }), 1500)
  )
}

// use()로 Promise를 읽으면, 완료될 때까지 가장 가까운 Suspense의 fallback이 표시됨
function ProfileCard({ promise }: { promise: Promise<Profile> }) {
  const profile = use(promise)
  return (
    <div className="space-y-1">
      <p className="font-semibold">{profile.name}</p>
      <p className="text-sm text-muted-foreground">{profile.role}</p>
      <p className="text-sm text-muted-foreground">가입 {profile.joinedDays}일째</p>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-28" />
    </div>
  )
}

export default function SuspenseExample() {
  // Promise는 렌더링 중이 아니라 이벤트/초기화 시점에 만들어야 함
  const [promise, setPromise] = useState(fetchProfile)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-h-20 flex-1 rounded-lg border p-4">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileCard promise={promise} />
        </Suspense>
      </div>
      <Button variant="outline" onClick={() => setPromise(fetchProfile())}>
        <RotateCw /> 다시 불러오기
      </Button>
    </div>
  )
}
