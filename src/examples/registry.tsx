import type { ComponentType } from "react"

import AnimatedNumberExample from "./animation/animated-number"
import FadeInExample from "./animation/fade-in"
import StaggerExample from "./animation/stagger"
import ThemeSwitcherExample from "./dark-mode/theme-switcher"
import BasicFormExample from "./forms/basic-form"
import CrossFieldExample from "./forms/cross-field"
import FieldArrayExample from "./forms/field-array"
import ServerClientExample from "./nextjs/server-client"
import SuspenseExample from "./nextjs/suspense"
import ResponsiveDialogExample from "./responsive/responsive-dialog"
import ResponsiveGridExample from "./responsive/responsive-grid"
import DataDisplayExample from "./shadcn-ui/data-display"
import FeedbackExample from "./shadcn-ui/feedback"
import OverlaysExample from "./shadcn-ui/overlays"
import OptimisticUpdateExample from "./state/optimistic-update"
import QueryStatusExample from "./state/query-status"
import ZustandCartExample from "./state/zustand-cart"
import ResponsiveUtilitiesExample from "./tailwind/responsive-utilities"
import StateVariantsExample from "./tailwind/state-variants"
import GenericComponentExample from "./typescript/generic-component"
import ZodInferExample from "./typescript/zod-infer"

// 예제 id → 컴포넌트 매핑 (키: "<기능 slug>/<예제 id>")
// 서버 페이지에서만 import해 클라이언트 번들(커맨드 팔레트 등)에 예제 코드가 섞이지 않도록 분리
export const exampleComponents: Record<string, ComponentType> = {
  "nextjs/server-client": ServerClientExample,
  "nextjs/suspense": SuspenseExample,
  "typescript/zod-infer": ZodInferExample,
  "typescript/generic-component": GenericComponentExample,
  "tailwind/responsive-utilities": ResponsiveUtilitiesExample,
  "tailwind/state-variants": StateVariantsExample,
  "shadcn-ui/overlays": OverlaysExample,
  "shadcn-ui/data-display": DataDisplayExample,
  "shadcn-ui/feedback": FeedbackExample,
  "forms/basic-form": BasicFormExample,
  "forms/cross-field": CrossFieldExample,
  "forms/field-array": FieldArrayExample,
  "state/zustand-cart": ZustandCartExample,
  "state/query-status": QueryStatusExample,
  "state/optimistic-update": OptimisticUpdateExample,
  "dark-mode/theme-switcher": ThemeSwitcherExample,
  "responsive/responsive-grid": ResponsiveGridExample,
  "responsive/responsive-dialog": ResponsiveDialogExample,
  "animation/fade-in": FadeInExample,
  "animation/stagger": StaggerExample,
  "animation/animated-number": AnimatedNumberExample,
}
