// 서버 컴포넌트로도 충분: 반응형은 CSS(미디어 쿼리)만으로 동작
// 모바일 우선: 접두사 없는 클래스가 기본, sm(640px)·md(768px)·lg(1024px) 이상에서 덮어씀

const breakpoints = [
  { label: "기본 (< 640px)", className: "flex sm:hidden" },
  { label: "sm (≥ 640px)", className: "hidden sm:flex md:hidden" },
  { label: "md (≥ 768px)", className: "hidden md:flex lg:hidden" },
  { label: "lg (≥ 1024px)", className: "hidden lg:flex" },
]

export default function ResponsiveUtilitiesExample() {
  return (
    <div className="space-y-4">
      {/* 현재 구간만 표시 */}
      <div className="rounded-lg border bg-muted/50 p-3 text-sm">
        현재 화면 구간:{" "}
        {breakpoints.map((bp) => (
          <span key={bp.label} className={`${bp.className} inline-flex font-semibold text-primary`}>
            {bp.label}
          </span>
        ))}
      </div>

      {/* 열 개수, 간격, 글자 크기가 화면에 따라 바뀜 */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
        {["A", "B", "C", "D"].map((item) => (
          <div
            key={item}
            className="flex h-16 items-center justify-center rounded-lg bg-primary/10 text-base font-bold text-primary sm:h-20 sm:text-lg lg:text-2xl"
          >
            {item}
          </div>
        ))}
      </div>

      {/* 모바일에서는 세로, sm 이상에서는 가로 배치 */}
      <div className="flex flex-col gap-2 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span>모바일: 세로 배치 · sm 이상: 가로 배치</span>
        <span className="text-muted-foreground">flex-col → sm:flex-row</span>
      </div>
    </div>
  )
}
