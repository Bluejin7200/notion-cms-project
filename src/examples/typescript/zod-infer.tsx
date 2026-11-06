"use client"

import { useState } from "react"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

// 스키마 하나로 런타임 검증 규칙과 TypeScript 타입을 함께 정의
const productSchema = z.object({
  name: z.string().min(1, "상품명은 필수입니다."),
  price: z.number().int().positive("가격은 0보다 커야 합니다."),
  tags: z.array(z.string()).max(3, "태그는 3개까지 가능합니다."),
  status: z.enum(["draft", "published"]),
})

// z.infer로 타입 자동 생성 → 스키마를 바꾸면 타입도 함께 바뀜
// { name: string; price: number; tags: string[]; status: "draft" | "published" }
type Product = z.infer<typeof productSchema>

const initialJson = JSON.stringify(
  { name: "키보드", price: 89000, tags: ["기계식", "무선"], status: "published" } satisfies Product,
  null,
  2
)

export default function ZodInferExample() {
  const [json, setJson] = useState(initialJson)

  // 외부에서 들어온 데이터(unknown)를 safeParse로 검증하면 성공 시 Product 타입이 보장됨
  let result: { ok: true; product: Product } | { ok: false; errors: string[] }
  try {
    const parsed = productSchema.safeParse(JSON.parse(json))
    result = parsed.success
      ? { ok: true, product: parsed.data }
      : { ok: false, errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }
  } catch {
    result = { ok: false, errors: ["올바른 JSON이 아닙니다."] }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <p className="text-sm font-medium">입력 데이터 (수정해보세요)</p>
        <Textarea
          value={json}
          onChange={(event) => setJson(event.target.value)}
          rows={8}
          className="font-mono text-xs"
          aria-label="상품 JSON"
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">검증 결과</p>
        {result.ok ? (
          <div className="space-y-2 rounded-lg border p-3 text-sm">
            <Badge>통과</Badge>
            {/* 여기서 result.product는 Product 타입이라 자동 완성·타입 검사가 동작 */}
            <p>
              {result.product.name} · {result.product.price.toLocaleString()}원
            </p>
            <div className="flex flex-wrap gap-1">
              {result.product.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2 rounded-lg border border-destructive/50 p-3 text-sm">
            <Badge variant="destructive">실패</Badge>
            <ul className="list-inside list-disc text-destructive">
              {result.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
