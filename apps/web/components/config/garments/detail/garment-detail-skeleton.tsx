import { Skeleton } from "@/components/ui/skeleton";

export function GarmentDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Skeleton className="h-64 md:col-span-2" />
        <Skeleton className="h-64" />
      </div>

      <Skeleton className="h-72" />
    </div>
  );
}
