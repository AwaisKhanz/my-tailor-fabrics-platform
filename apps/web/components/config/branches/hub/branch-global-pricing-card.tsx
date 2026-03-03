import Link from "next/link";
import { Shirt } from "lucide-react";
import { type BranchDetail } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

interface BranchGlobalPricingCardProps {
  branch: BranchDetail | null;
}

export function BranchGlobalPricingCard({ branch }: BranchGlobalPricingCardProps) {
  const garmentTypesCount = branch?.stats?.totalGarments || 0;
  const branchRateCards = branch?.stats?.branchRateCards || 0;
  const globalRateCards = branch?.stats?.globalRateCards || 0;
  const hasBranchRateOverrides = Boolean(branch?.stats?.hasBranchRateOverrides);

  return (
    <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
      <CardHeader variant="rowSection" className="items-start sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Shirt className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold tracking-tight">Global Pricing Model</CardTitle>
        </div>
        <Badge variant="info" size="xs">Global</Badge>
      </CardHeader>

      <CardContent spacing="section" className="space-y-5 p-5 sm:p-6">
        <Typography as="p" variant="lead" className="text-sm leading-relaxed">
          Customer garment prices are controlled from one shared catalog in{" "}
          <span className="font-semibold text-foreground">Settings &gt; Garments</span>. This means
          every branch uses the same customer-facing price list.
        </Typography>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Customer Price Source
            </Label>
            <p className="mt-1 text-sm font-semibold text-foreground">Global Garment Catalog</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Branch-level Price List
            </Label>
            <p className="mt-1 text-sm font-semibold text-foreground">Not Supported for Customer Prices</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Active Garment Types
            </Label>
            <p className="mt-1 text-sm font-semibold text-foreground">{garmentTypesCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Task Rate Overrides
            </Label>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {hasBranchRateOverrides
                ? `${branchRateCards.toLocaleString()} branch-specific rates`
                : "Disabled (no branch-specific rate cards)"}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 sm:col-span-2">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Global Task Rate Cards
            </Label>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {globalRateCards.toLocaleString()} default rate cards are available system-wide
            </p>
          </div>
        </div>

        <div className="flex justify-start">
          <Button variant="premium" size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/settings/garments">Manage Global Price List</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
