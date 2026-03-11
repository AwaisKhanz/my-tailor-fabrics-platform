import { Skeleton } from "@tbms/ui/components/skeleton";
import { LoadingState } from "@tbms/ui/components/loading-state";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";

export function GarmentDetailSkeleton() {
  return (
    <PageShell>
      <PageSection spacing="compact">
        <LoadingState
          compact
          text="Loading garment..."
          caption="Fetching rates, measurements, and pricing history."
        />
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </PageSection>

      <PageSection spacing="compact">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </PageSection>

      <PageSection
        spacing="compact"
        className="grid grid-cols-1 gap-8 lg:grid-cols-5"
      >
        <div className="space-y-6 lg:col-span-3">
          <Skeleton className="h-52 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
        <aside className="space-y-6 lg:col-span-2">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </aside>
      </PageSection>
    </PageShell>
  );
}
