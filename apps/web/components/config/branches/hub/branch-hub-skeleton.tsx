import { Skeleton } from "@/components/ui/skeleton";

export function BranchHubSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-8 p-10">
      <Skeleton className="mb-4 h-4 w-64" />
      <Skeleton className="mb-8 h-12 w-96" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-12 h-64 rounded-xl" />
    </div>
  );
}
