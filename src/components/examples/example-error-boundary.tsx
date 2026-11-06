"use client"

import { Component, type ReactNode } from "react"
import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = { children: ReactNode }
type State = { error: Error | null }

// 예제 하나에서 오류가 나도 페이지 전체가 깨지지 않도록 격리 (오류 경계는 클래스 컴포넌트만 가능)
export class ExampleErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center text-sm">
        <TriangleAlert className="size-5 text-destructive" />
        <p>예제를 표시하는 중 오류가 발생했습니다.</p>
        <Button size="sm" variant="outline" onClick={() => this.setState({ error: null })}>
          다시 시도
        </Button>
      </div>
    )
  }
}
