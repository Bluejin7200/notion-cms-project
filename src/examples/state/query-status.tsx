"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { RefreshCw, TriangleAlert } from "lucide-react"

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { formatDate } from "@/lib/format"

type Weather = { city: string; temperature: number; condition: string; fetchedAt: Date }

// 서버 API를 흉내 내는 함수 (1초 지연, shouldFail이면 실패)
async function fetchWeather(city: string, shouldFail: boolean): Promise<Weather> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  if (shouldFail) throw new Error("날씨 서버에 연결할 수 없습니다.")
  return {
    city,
    temperature: Math.round(15 + Math.random() * 10),
    condition: ["맑음", "구름 조금", "흐림"][Math.floor(Math.random() * 3)],
    fetchedAt: new Date(),
  }
}

export default function QueryStatusExample() {
  const [shouldFail, setShouldFail] = useState(false)

  const { data, isPending, isError, error, isFetching, refetch } = useQuery({
    // queryKey가 같으면 캐시를 공유, 바뀌면 새로 조회
    queryKey: ["example-weather", "서울", shouldFail],
    queryFn: () => fetchWeather("서울", shouldFail),
    // 실패 시 1번만 재시도 (기본값 3번)
    retry: 1,
    // 10초 동안은 다시 요청하지 않고 캐시 사용
    staleTime: 10_000,
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Switch id="fail-toggle" checked={shouldFail} onCheckedChange={setShouldFail} />
          <Label htmlFor="fail-toggle">요청 실패시키기</Label>
        </div>
        <div className="flex items-center gap-2">
          {/* isFetching: 백그라운드 재조회 중에도 true (isPending은 최초 로딩만) */}
          {isFetching && <Badge variant="secondary">요청 중...</Badge>}
          <Button size="sm" variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw /> 새로고침
          </Button>
        </div>
      </div>

      {isPending ? (
        <div className="space-y-2 rounded-lg border p-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>불러오지 못했습니다.</AlertTitle>
          <AlertDescription>{error.message} (1회 재시도 후 실패)</AlertDescription>
          <AlertAction>
            <Button size="sm" variant="outline" onClick={() => void refetch()}>
              다시 시도
            </Button>
          </AlertAction>
        </Alert>
      ) : (
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">{data.city}</p>
          <p className="text-3xl font-bold">{data.temperature}°</p>
          <p className="text-sm">{data.condition}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            조회 시각 {formatDate(data.fetchedAt, "HH:mm:ss")}
          </p>
        </div>
      )}
    </div>
  )
}
