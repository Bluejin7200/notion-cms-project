import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

// 단위 테스트 설정: 순수 함수(검증 스키마, 유틸, 목업 조회 로직) 대상, Node 환경
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // 날짜 포맷 테스트가 실행 환경 시간대에 영향받지 않도록 고정
    env: { TZ: "Asia/Seoul" },
  },
})
