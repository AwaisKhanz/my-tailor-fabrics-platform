import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderFormSkeleton() {
  return (
    <PageShell inset="none">
      <Skeleton className="h-12 w-72" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader variant="section">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent spacing="section" className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader variant="section">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent spacing="section" className="space-y-4">
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
          <CardHeader variant="section">
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent spacing="section" className="space-y-3">
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
