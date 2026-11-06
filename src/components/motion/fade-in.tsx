"use client"

import { motion, type HTMLMotionProps } from "motion/react"

type Direction = "up" | "down" | "left" | "right" | "none"

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number
  direction?: Direction
  // 이동 거리(px)
  distance?: number
  // 뷰포트 진입 대신 마운트 즉시 재생 (첫 화면 요소용)
  immediate?: boolean
}

const offset = (direction: Direction, distance: number) => ({
  x: direction === "left" ? distance : direction === "right" ? -distance : 0,
  y: direction === "up" ? distance : direction === "down" ? -distance : 0,
})

// 뷰포트에 들어올 때 한 번 페이드 + 슬라이드 인 (transform/opacity만 사용)
export function FadeIn({
  delay = 0,
  direction = "up",
  distance = 16,
  immediate = false,
  children,
  ...props
}: FadeInProps) {
  const hidden = { opacity: 0, ...offset(direction, distance) }
  const visible = { opacity: 1, x: 0, y: 0 }

  return (
    <motion.div
      initial={hidden}
      {...(immediate
        ? { animate: visible }
        : { whileInView: visible, viewport: { once: true, margin: "-60px" } })}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
