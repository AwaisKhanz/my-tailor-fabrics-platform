import { ArrowUpRight, History, Users } from "lucide-react";
import { type GarmentPriceLog } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { formatPKR } from "@/lib/utils";

interface GarmentPricingLogsCardProps {
  logs: GarmentPriceLog[];
}

export function GarmentPricingLogsCard({ logs }: GarmentPricingLogsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <div className="space-y-1">
            <CardTitle className="text-base">Recent Pricing Logs</CardTitle>
            <CardDescription>Latest pricing changes for this garment</CardDescription>
          </div>
        </div>
        <Badge variant="default">{logs.length} entries</Badge>
      </CardHeader>

      <CardContent>
        {logs.length > 0 ? (
          <div className="relative space-y-6 before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-px before:bg-border">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-8">
                <div className="absolute left-0 top-1.5 z-10 rounded-full bg-primary/10 p-1">
                  <ArrowUpRight className="h-2.5 w-2.5 text-primary" />
                </div>

                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-semibold">Price Updated</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2 rounded-md bg-muted/40 px-3 py-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {log.changedBy.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-1">
                    <div>
                      <p className="text-xs text-muted-foreground">Customer Price</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground line-through opacity-50">
                          {formatPKR(log.oldCustomerPrice || 0)}
                        </span>
                        <span className="text-xs font-bold">
                          {formatPKR(log.newCustomerPrice || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <History className="mx-auto mb-3 h-8 w-8 opacity-20" />
            <p className="text-sm">No pricing change logs found yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
