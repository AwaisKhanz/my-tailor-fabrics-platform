import Link from "next/link";
import { Shirt } from "lucide-react";
import { type BranchDetail } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { GARMENTS_SETTINGS_ROUTE } from "@/lib/settings-routes";

interface BranchGlobalPricingCardProps {
  branch: BranchDetail | null;
}

export function BranchGlobalPricingCard({
  branch,
}: BranchGlobalPricingCardProps) {
  const garmentTypesCount = branch?.stats?.totalGarments || 0;
  const branchRateCards = branch?.stats?.branchRateCards || 0;
  const globalRateCards = branch?.stats?.globalRateCards || 0;
  const hasBranchRateOverrides = Boolean(branch?.stats?.hasBranchRateOverrides);

  return (
    <Card>
      <CardHeader className="pb-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Shirt className="h-4 w-4 text-muted-foreground" />
          <div className="space-y-1">
            <CardTitle className="text-base">Global Pricing Model</CardTitle>
            <CardDescription>Shared customer-facing garment prices</CardDescription>
          </div>
        </div>
        <Badge variant="secondary">Global</Badge>
      </CardHeader>

      <CardContent className="space-y-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Customer garment prices are controlled from one shared catalog in{" "}
          <span className="font-semibold text-foreground">Settings &gt; Garments</span>
          . This means every branch uses the same customer-facing price list.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-muted/40 px-3 py-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Customer Price Source
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              Global Garment Catalog
            </p>
          </div>
          <div className="rounded-md bg-muted/40 px-3 py-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Branch-level Price List
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              Not Supported for Customer Prices
            </p>
          </div>
          <div className="rounded-md bg-muted/40 px-3 py-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Active Garment Types
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {garmentTypesCount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-muted/40 px-3 py-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Task Rate Overrides
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {hasBranchRateOverrides
                ? `${branchRateCards.toLocaleString()} branch-specific rates`
                : "Disabled (no branch-specific rate cards)"}
            </p>
          </div>
          <div className="sm:col-span-2 rounded-md bg-muted/40 px-3 py-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Global Task Rate Cards
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {globalRateCards.toLocaleString()} default rate cards are
              available system-wide
            </p>
          </div>
        </div>

        <div className="flex justify-start">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            render={<Link href={GARMENTS_SETTINGS_ROUTE} />}
          >
            Manage Global Price List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
