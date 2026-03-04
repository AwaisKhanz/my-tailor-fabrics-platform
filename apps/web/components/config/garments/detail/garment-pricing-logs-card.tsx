import { ArrowUpRight, History, Users } from "lucide-react";
import { type GarmentPriceLog } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionIcon } from "@/components/ui/section-icon";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface GarmentPricingLogsCardProps {
  logs: GarmentPriceLog[];
}

export function GarmentPricingLogsCard({ logs }: GarmentPricingLogsCardProps) {
  return (
    <Card variant="shell">
      <CardHeader variant="rowSection" className="items-start sm:items-center">
        <div className="flex items-center gap-2">
          <SectionIcon tone="primary">
            <History className="h-4 w-4" />
          </SectionIcon>
          <CardTitle className="text-base font-semibold tracking-tight">
            Recent Pricing Logs
          </CardTitle>
        </div>
        <Badge variant="secondary" size="xs">
          {logs.length} entries
        </Badge>
      </CardHeader>

      <CardContent spacing="section" className="p-5 pt-5 sm:p-6">
        {logs.length > 0 ? (
          <div className="relative space-y-6 before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-px before:bg-border">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-8">
                <SectionIcon
                  tone="timelinePrimary"
                  size="sm"
                  framed={false}
                  className="absolute left-0 top-1.5 z-10 rounded-full"
                >
                  <ArrowUpRight className="h-2.5 w-2.5 text-primary" />
                </SectionIcon>

                <div className="mb-1 flex items-center justify-between">
                  <Typography as="p" variant="body" className="font-bold">
                    Price Updated
                  </Typography>
                  <Label variant="dashboard">
                    {new Date(log.createdAt).toLocaleString()}
                  </Label>
                </div>

                <InfoTile padding="content" className="space-y-2">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <Label variant="dashboard" className="flex shrink-0 items-center gap-1.5">
                      <Users className="h-3 w-3" />
                      {log.changedBy.name}
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                    <div>
                      <Label variant="dashboard">Customer Price</Label>
                      <div className="flex items-center gap-2">
                        <Typography as="span" variant="muted" className="text-xs line-through opacity-50">
                          {formatPKR(log.oldCustomerPrice || 0)}
                        </Typography>
                        <Typography as="span" variant="body" className="text-xs font-bold">
                          {formatPKR(log.newCustomerPrice || 0)}
                        </Typography>
                      </div>
                    </div>

                    <div>
                      <Label variant="dashboard">Employee Rate</Label>
                      <div className="flex items-center gap-2">
                        <Typography as="span" variant="muted" className="text-xs line-through opacity-50">
                          {formatPKR(log.oldEmployeeRate || 0)}
                        </Typography>
                        <Typography as="span" variant="body" className="text-xs font-bold">
                          {formatPKR(log.newEmployeeRate || 0)}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </InfoTile>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-text-secondary">
            <History className="mx-auto mb-3 h-8 w-8 opacity-20" />
            <Typography as="p" variant="lead">
              No pricing change logs found yet.
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
