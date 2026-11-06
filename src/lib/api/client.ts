import type { ApiError } from "@/lib/api/response"

// 클라이언트용 fetch 래퍼: JSON 요청/응답 처리, 실패 시 서버 메시지로 Error 발생
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiError | null
    throw new Error(body?.message ?? "요청을 처리하지 못했습니다.")
  }

  return (await response.json()) as T
}

/** JSON 본문을 담은 POST 요청 */
export function apiPost<T>(url: string, body?: unknown) {
  return apiFetch<T>(url, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}
