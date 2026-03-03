import { Skeleton } from "@/components/ui/skeleton";

export function CustomerDetailSkeleton() {
  return (
    <div className="space-y-6 p-1">
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Skeleton className="h-[380px] md:col-span-1" />
        <Skeleton className="h-[380px] md:col-span-2" />
      </div>
    </div>
  );
}
