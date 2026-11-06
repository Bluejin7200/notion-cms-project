import { isServer, QueryClient } from "@tanstack/react-query"

// TanStack Query 권장 패턴: 서버는 요청마다 새로 만들고, 브라우저는 하나를 재사용
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR 직후 즉시 재요청하지 않도록 staleTime 지정
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (isServer) return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
