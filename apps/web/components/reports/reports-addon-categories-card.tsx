import { Banknote, List, PieChart } from "lucide-react";
import { type AddonAnalytics } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface ReportsAddonCategoriesCardProps {
  addons: AddonAnalytics[];
  totalAddonRevenue: number;
}

export function ReportsAddonCategoriesCard({
  addons,
  totalAddonRevenue,
}: ReportsAddonCategoriesCardProps) {
  return (
    <Card variant="premium">
      <CardHeader variant="section" density="compact">
        <CardTitle variant="dashboard" className="flex items-center gap-2">
          <PieChart className="h-4 w-4 text-primary" />
          Addon Categories
        </CardTitle>
        <CardDescription>Revenue contribution from manual addons</CardDescription>
      </CardHeader>

      <CardContent spacing="section" className="space-y-4">
        {addons.length === 0 ? (
          <Typography as="p" variant="lead" className="py-8 text-center">
            No addon data available.
          </Typography>
        ) : (
          addons.map((addon) => (
            <div
              key={addon.type}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <List className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <Label variant="dashboard" className="block opacity-100">
                    {addon.type.replaceAll("_", " ")}
                  </Label>
                  <Label variant="dashboard" className="block">
                    {addon.count} occurrences
                  </Label>
                </div>
              </div>
              <Typography as="p" variant="body" className="font-bold">
                {formatPKR(addon.total)}
              </Typography>
            </div>
          ))
        )}

        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/60 p-3">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" />
            <Label variant="dashboard" className="text-primary/80">
              Total Addon Value
            </Label>
          </div>
          <Badge variant="outline">{formatPKR(totalAddonRevenue)}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
