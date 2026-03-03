import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/ui/page-shell";

export function CustomerDetailSkeleton() {
  return (
    <PageShell>
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Skeleton className="h-[720px] lg:col-span-3" />
        <Skeleton className="h-[720px] lg:col-span-2" />
      </div>
    </PageShell>
  );
}
