import { Skeleton } from "@/components/ui/skeleton";

export function EmployeeDetailSkeleton() {
  return (
    <div className="mx-auto max-w-9xl space-y-6">
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
