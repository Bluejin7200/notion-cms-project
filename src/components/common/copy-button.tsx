"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { useCopyToClipboard } from "usehooks-ts"

import { Button } from "@/components/ui/button"

type CopyButtonProps = {
  value: string
  label?: string
}

// 클립보드 복사 버튼 (usehooks-ts useCopyToClipboard 사용)
export function CopyButton({ value, label = "복사" }: CopyButtonProps) {
  const [, copy] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const ok = await copy(value)
    if (!ok) {
      toast.error("복사에 실패했습니다.")
      return
    }
    setCopied(true)
    toast.success("클립보드에 복사했습니다.")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={handleCopy}
      aria-label={label}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}
