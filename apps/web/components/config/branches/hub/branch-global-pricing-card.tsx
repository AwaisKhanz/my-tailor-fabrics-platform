import Link from "next/link";
import { Shirt } from "lucide-react";
import { type BranchDetail } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import { Text } from "@/components/ui/typography";
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
      <CardHeader
        layout="rowBetweenResponsive"
        surface="mutedSection"
        trimBottom
      >
        <SectionHeader
          title="Global Pricing Model"
          icon={
            <SectionIcon>
              <Shirt className="h-4 w-4" />
            </SectionIcon>
          }
        />
        <Badge variant="info" size="xs">
          Global
        </Badge>
      </CardHeader>

      <CardContent spacing="section" padding="inset" className="space-y-5">
        <Text as="p" variant="lead" className="text-sm leading-relaxed">
          Customer garment prices are controlled from one shared catalog in{" "}
          <span className="font-semibold text-foreground">
            {" "}
            Settings &gt; Garments
          </span>
          . This means every branch uses the same customer-facing price list.
        </Text>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoTile padding="md" tone="secondary">
            <Label className="text-xs font-semibold uppercase  text-muted-foreground">
              Customer Price Source
            </Label>
            <Text
              as="p"
              variant="body"
              className="mt-1 text-sm font-semibold text-foreground"
            >
              Global Garment Catalog
            </Text>
          </InfoTile>
          <InfoTile padding="md" tone="secondary">
            <Label className="text-xs font-semibold uppercase  text-muted-foreground">
              Branch-level Price List
            </Label>
            <Text
              as="p"
              variant="body"
              className="mt-1 text-sm font-semibold text-foreground"
            >
              Not Supported for Customer Prices
            </Text>
          </InfoTile>
          <InfoTile padding="md" tone="secondary">
            <Label className="text-xs font-semibold uppercase  text-muted-foreground">
              Active Garment Types
            </Label>
            <Text
              as="p"
              variant="body"
              className="mt-1 text-sm font-semibold text-foreground"
            >
              {garmentTypesCount.toLocaleString()}
            </Text>
          </InfoTile>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoTile padding="md" tone="secondary">
            <Label className="text-xs font-semibold uppercase  text-muted-foreground">
              Task Rate Overrides
            </Label>
            <Text
              as="p"
              variant="body"
              className="mt-1 text-sm font-semibold text-foreground"
            >
              {hasBranchRateOverrides
                ? `${branchRateCards.toLocaleString()} branch-specific rates`
                : "Disabled (no branch-specific rate cards)"}
            </Text>
          </InfoTile>
          <InfoTile padding="md" className="sm:col-span-2" tone="secondary">
            <Label className="text-xs font-semibold uppercase  text-muted-foreground">
              Global Task Rate Cards
            </Label>
            <Text
              as="p"
              variant="body"
              className="mt-1 text-sm font-semibold text-foreground"
            >
              {globalRateCards.toLocaleString()} default rate cards are
              available system-wide
            </Text>
          </InfoTile>
        </div>

        <div className="flex justify-start">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href={GARMENTS_SETTINGS_ROUTE}>Manage Global Price List</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
