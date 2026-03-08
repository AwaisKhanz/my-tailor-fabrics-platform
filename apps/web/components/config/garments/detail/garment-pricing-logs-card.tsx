import { ArrowUpRight, History, Users } from "lucide-react";
import { type GarmentPriceLog } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import { Text } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface GarmentPricingLogsCardProps {
  logs: GarmentPriceLog[];
}

export function GarmentPricingLogsCard({ logs }: GarmentPricingLogsCardProps) {
  return (
    <Card>
      <CardHeader
        layout="rowBetweenResponsive"
        surface="mutedSection"
        trimBottom
      >
        <SectionHeader
          title="Recent Pricing Logs"
          icon={
            <SectionIcon tone="default">
              <History className="h-4 w-4" />
            </SectionIcon>
          }
        />
        <Badge variant="default" size="xs">
          {logs.length} entries
        </Badge>
      </CardHeader>

      <CardContent spacing="section" padding="inset">
        {logs.length > 0 ? (
          <div className="relative space-y-6 before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-px before:bg-border">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-8">
                <SectionIcon
                  tone="default"
                  size="sm"
                  framed={false}
                  className="absolute left-0 top-1.5 z-10 rounded-full"
                >
                  <ArrowUpRight className="h-2.5 w-2.5 text-primary" />
                </SectionIcon>

                <div className="mb-1 flex items-center justify-between">
                  <Text as="p" variant="body" className="font-bold">
                    Price Updated
                  </Text>
                  <Label className="text-sm font-bold uppercase  text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </Label>
                </div>

                <InfoTile padding="content" className="space-y-2">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <Label className="text-sm font-bold uppercase  text-muted-foreground flex shrink-0 items-center gap-1.5">
                      <Users className="h-3 w-3" />
                      {log.changedBy.name}
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-1">
                    <div>
                      <Label className="text-sm font-bold uppercase  text-muted-foreground">
                        Customer Price
                      </Label>
                      <div className="flex items-center gap-2">
                        <Text
                          as="span"
                          variant="muted"
                          className="text-xs line-through opacity-50"
                        >
                          {formatPKR(log.oldCustomerPrice || 0)}
                        </Text>
                        <Text
                          as="span"
                          variant="body"
                          className="text-xs font-bold"
                        >
                          {formatPKR(log.newCustomerPrice || 0)}
                        </Text>
                      </div>
                    </div>
                  </div>
                </InfoTile>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <History className="mx-auto mb-3 h-8 w-8 opacity-20" />
            <Text as="p" variant="lead">
              No pricing change logs found yet.
            </Text>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
