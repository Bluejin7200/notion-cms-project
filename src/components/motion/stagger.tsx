"use client"

import { motion, type HTMLMotionProps, type Variants } from "motion/react"

const containerVariants: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

type StaggerProps = HTMLMotionProps<"div"> & {
  // 자식 간 등장 간격(초)
  stagger?: number
  // 뷰포트 진입 대신 마운트 즉시 재생
  immediate?: boolean
}

// 자식 StaggerItem을 순서대로 등장시키는 컨테이너 (그리드 className을 그대로 받음)
export function Stagger({ stagger = 0.08, immediate = false, children, ...props }: StaggerProps) {
  return (
    <motion.div
      variants={containerVariants}
      custom={stagger}
      initial="hidden"
      {...(immediate
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: { once: true, margin: "-60px" } })}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Stagger 안에서 순차 등장하는 항목
export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={itemVariants} {...props}>
      {children}
    </motion.div>
  )
}
