import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-snow-16 bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
