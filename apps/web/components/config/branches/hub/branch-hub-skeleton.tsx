import { Skeleton } from "@tbms/ui/components/skeleton";
import { LoadingState } from "@tbms/ui/components/loading-state";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";

export function BranchHubSkeleton() {
  return (
    <PageShell className="animate-pulse">
      <PageSection spacing="compact">
        <LoadingState
          compact
          text="Loading branch..."
          caption="Fetching branch operations and pricing setup."
        />
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-40 rounded-xl" />
      </PageSection>

      <PageSection
        spacing="compact"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-32 rounded-xl" />
        ))}
      </PageSection>

      <PageSection
        spacing="compact"
        className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
      >
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </PageSection>
    </PageShell>
  );
}
