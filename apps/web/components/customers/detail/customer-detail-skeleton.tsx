import { Skeleton } from "@tbms/ui/components/skeleton";
import { LoadingState } from "@tbms/ui/components/loading-state";
import { PageShell } from "@tbms/ui/components/page-shell";

export function CustomerDetailSkeleton() {
  return (
    <PageShell>
      <LoadingState
        compact
        text="Loading customer..."
        caption="Fetching profile, measurements, and orders."
      />
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
