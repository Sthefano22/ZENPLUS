export default function Skeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-outline-variant bg-surface-low">
      <div className="aspect-[4/3] bg-surface-mid" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-2/5 rounded bg-surface-mid" />
        <div className="h-5 w-4/5 rounded bg-surface-mid" />
        <div className="h-3 w-3/5 rounded bg-surface-mid" />
        <div className="flex gap-4 pt-2">
          <div className="h-3 w-1/4 rounded bg-surface-mid" />
          <div className="h-3 w-1/4 rounded bg-surface-mid" />
          <div className="h-3 w-1/4 rounded bg-surface-mid" />
        </div>
      </div>
    </div>
  )
}
