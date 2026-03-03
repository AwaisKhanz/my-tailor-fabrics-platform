import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/ui/page-shell";

export function EmployeeDetailSkeleton() {
  return (
    <PageShell>
      <Skeleton className="h-28 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full sm:col-span-2 xl:col-span-1" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Skeleton className="h-[720px] lg:col-span-3" />
        <Skeleton className="h-[720px] lg:col-span-2" />
      </div>
    </PageShell>
  );
}
