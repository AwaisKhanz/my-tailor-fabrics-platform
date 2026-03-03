import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/ui/page-shell";

export function BranchHubSkeleton() {
  return (
    <PageShell spacing="spacious" className="animate-pulse px-4 py-6 sm:px-6 sm:py-8">
      <Skeleton className="mb-4 h-4 w-64" />
      <Skeleton className="mb-8 h-12 w-96" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-12 h-64 rounded-xl" />
    </PageShell>
  );
}
