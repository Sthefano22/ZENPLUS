import Skeleton from '@/components/ui/Skeleton'

export default function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  )
}
