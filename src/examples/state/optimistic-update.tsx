"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Todo = { id: number; title: string; done: boolean }

// 메모리에 저장하는 가짜 서버 (실제로는 API)
let serverTodos: Todo[] = [
  { id: 1, title: "디자인 시안 검토", done: true },
  { id: 2, title: "API 명세 작성", done: false },
  { id: 3, title: "결제 버그 수정 (저장 시 실패함)", done: false },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchTodos() {
  await delay(500)
  return serverTodos.map((todo) => ({ ...todo }))
}

async function toggleTodo(id: number) {
  await delay(800)
  // 3번 항목은 서버에서 실패하는 상황을 흉내 → 롤백 확인용
  if (id === 3) throw new Error("서버 오류로 저장하지 못했습니다.")
  serverTodos = serverTodos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
}

const queryKey = ["example-todos"]

export default function OptimisticUpdateExample() {
  const queryClient = useQueryClient()
  const { data: todos } = useQuery({ queryKey, queryFn: fetchTodos })

  const mutation = useMutation({
    mutationFn: toggleTodo,
    // 1) 요청 전에 캐시를 먼저 바꿔 화면에 즉시 반영
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Todo[]>(queryKey)
      queryClient.setQueryData<Todo[]>(queryKey, (old) =>
        old?.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
      )
      return { previous }
    },
    // 2) 실패하면 이전 값으로 되돌림
    onError: (error, _id, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
      toast.error(`${error.message} 변경을 되돌렸습니다.`)
    },
    // 3) 성공/실패와 관계없이 서버 값으로 다시 맞춤
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  if (!todos) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => {
        const pending = mutation.isPending && mutation.variables === todo.id
        return (
          <li key={todo.id} className="flex items-center gap-3 rounded-lg border p-3">
            <Checkbox
              id={`todo-${todo.id}`}
              checked={todo.done}
              disabled={pending}
              onCheckedChange={() => mutation.mutate(todo.id)}
            />
            <Label
              htmlFor={`todo-${todo.id}`}
              className={cn("flex-1 font-normal", todo.done && "text-muted-foreground line-through")}
            >
              {todo.title}
            </Label>
            {pending && <span className="text-xs text-muted-foreground">저장 중...</span>}
          </li>
        )
      })}
    </ul>
  )
}
