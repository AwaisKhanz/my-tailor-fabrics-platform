import { Skeleton } from "@/components/ui/skeleton";
import { DetailSplit, PageSection, PageShell } from "@/components/ui/page-shell";

export function GarmentDetailSkeleton() {
  return (
    <PageShell>
      <PageSection spacing="compact">
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

      <DetailSplit
        ratio="3-2"
        gap="spacious"
        main={
          <PageSection spacing="compact">
            <Skeleton className="h-52 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </PageSection>
        }
        side={
          <PageSection spacing="compact">
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </PageSection>
        }
      />
    </PageShell>
  );
}
