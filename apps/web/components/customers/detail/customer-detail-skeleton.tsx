import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/ui/page-shell";

export function CustomerDetailSkeleton() {
  return (
    <PageShell inset="none" className="p-1">
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Skeleton className="h-[380px] md:col-span-1" />
        <Skeleton className="h-[380px] md:col-span-2" />
      </div>
    </PageShell>
  );
}
