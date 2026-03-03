import { Skeleton } from "@/components/ui/skeleton";

interface ChartLoadingStateProps {
  rows?: number;
}

export function ChartLoadingState({ rows = 4 }: ChartLoadingStateProps) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
