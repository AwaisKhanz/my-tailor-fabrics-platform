import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/ui/page-shell";

export function EmployeeDetailSkeleton() {
  return (
    <PageShell inset="none">
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </PageShell>
  );
}
