"use client"

import { useEffect, useRef } from "react"
import { animate, useInView, useReducedMotion } from "motion/react"

type AnimatedNumberProps = {
  // "40+", "100%", "1,234" 처럼 앞쪽 숫자 + 접미사 형태
  value: string
  duration?: number
  className?: string
}

// 숫자 부분과 앞뒤 문자열 분리 (숫자가 없으면 null)
function parseValue(value: string) {
  const match = value.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/)
  if (!match) return null
  const [, prefix, numeric, suffix] = match
  const decimals = numeric.split(".")[1]?.length ?? 0
  return { prefix, target: Number(numeric.replace(/,/g, "")), suffix, decimals }
}

// 뷰포트에 들어오면 0부터 목표 값까지 카운트업
// 서버 렌더링·JS 미동작·동작 줄이기 설정 시에는 최종 값을 그대로 표시
export function AnimatedNumber({ value, duration = 1.2, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const parsed = parseValue(value)
    if (!inView || reduceMotion || !parsed || !ref.current) return
    const { prefix, target, suffix, decimals } = parsed
    const element = ref.current
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        // 매 프레임 리렌더링을 피하려고 DOM 텍스트를 직접 갱신
        element.textContent = `${prefix}${latest.toLocaleString("ko-KR", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}${suffix}`
      },
    })
    return () => controls.stop()
  }, [inView, reduceMotion, value, duration])

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}
