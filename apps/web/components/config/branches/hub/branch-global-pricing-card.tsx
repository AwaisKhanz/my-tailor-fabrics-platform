import Link from "next/link";
import { Shirt } from "lucide-react";
import { type BranchDetail } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionIcon } from "@/components/ui/section-icon";
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
    <Card variant="premium">
      <CardHeader variant="rowSection" align="startResponsive">
        <div className="flex items-center gap-2">
          <SectionIcon>
            <Shirt className="h-4 w-4" />
          </SectionIcon>
          <CardTitle variant="section">Global Pricing Model</CardTitle>
        </div>
        <Badge variant="info" size="xs">Global</Badge>
      </CardHeader>

      <CardContent spacing="section" padding="inset" className="space-y-5">
        <Typography as="p" variant="lead" className="text-sm leading-relaxed">
          Customer garment prices are controlled from one shared catalog in{" "}
          <span className="font-semibold text-text-primary">Settings &gt; Garments</span>. This means
          every branch uses the same customer-facing price list.
        </Typography>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoTile padding="md">
            <Label variant="micro">
              Customer Price Source
            </Label>
            <Typography as="p" variant="body" className="mt-1 text-sm font-semibold text-text-primary">
              Global Garment Catalog
            </Typography>
          </InfoTile>
          <InfoTile padding="md">
            <Label variant="micro">
              Branch-level Price List
            </Label>
            <Typography as="p" variant="body" className="mt-1 text-sm font-semibold text-text-primary">
              Not Supported for Customer Prices
            </Typography>
          </InfoTile>
          <InfoTile padding="md">
            <Label variant="micro">
              Active Garment Types
            </Label>
            <Typography as="p" variant="body" className="mt-1 text-sm font-semibold text-text-primary">
              {garmentTypesCount.toLocaleString()}
            </Typography>
          </InfoTile>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoTile padding="md">
            <Label variant="micro">
              Task Rate Overrides
            </Label>
            <Typography as="p" variant="body" className="mt-1 text-sm font-semibold text-text-primary">
              {hasBranchRateOverrides
                ? `${branchRateCards.toLocaleString()} branch-specific rates`
                : "Disabled (no branch-specific rate cards)"}
            </Typography>
          </InfoTile>
          <InfoTile padding="md" className="sm:col-span-2">
            <Label variant="micro">
              Global Task Rate Cards
            </Label>
            <Typography as="p" variant="body" className="mt-1 text-sm font-semibold text-text-primary">
              {globalRateCards.toLocaleString()} default rate cards are available system-wide
            </Typography>
          </InfoTile>
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
