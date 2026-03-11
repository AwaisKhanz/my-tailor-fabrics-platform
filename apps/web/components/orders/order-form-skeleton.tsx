import { Card, CardContent, CardHeader } from "@tbms/ui/components/card";
import { LoadingState } from "@tbms/ui/components/loading-state";
import { PageShell } from "@tbms/ui/components/page-shell";
import { Skeleton } from "@tbms/ui/components/skeleton";

export function OrderFormSkeleton() {
  return (
    <PageShell inset="none">
      <LoadingState
        compact
        text="Loading order form..."
        caption="Preparing customers, garments, and pricing rules."
      />
      <Skeleton className="h-12 w-72" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-4">
                  <Skeleton className="h-8 w-48" />
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <Skeleton className="h-10 w-full md:col-span-2" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
