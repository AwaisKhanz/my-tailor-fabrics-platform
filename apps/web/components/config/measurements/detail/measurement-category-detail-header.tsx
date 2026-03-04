import { CalendarDays, Plus, Ruler, SlidersHorizontal } from "lucide-react";
import { type MeasurementCategory } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MetaPill } from "@/components/ui/meta-pill";
import { Typography } from "@/components/ui/typography";
import { formatDate } from "@/lib/utils";

interface MeasurementCategoryDetailHeaderProps {
  category: MeasurementCategory | null;
  onAddField: () => void;
  canManageMeasurements?: boolean;
}

export function MeasurementCategoryDetailHeader({
  category,
  onAddField,
  canManageMeasurements = true,
}: MeasurementCategoryDetailHeaderProps) {
  const totalFields = category?.fields?.length ?? 0;
  const requiredFields = category?.fields?.filter((field) => field.isRequired).length ?? 0;
  const optionalFields = Math.max(totalFields - requiredFields, 0);

  return (
    <Card variant="premium">
      <CardContent spacing="section" padding="inset" className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 lg:max-w-[70%]">
            <Label variant="microStrong">
              Measurement Command
            </Label>

            <div className="flex flex-wrap items-center gap-3">
              <Typography as="h1" variant="pageTitle" className="font-semibold sm:text-4xl">
                {category?.name || "Category"}
              </Typography>
              <Badge variant={category?.isActive ? "success" : "outline"} size="xs">
                {category?.isActive ? "Active" : "Hidden"}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 text-xs text-text-secondary sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <MetaPill>
                <Ruler className="h-3.5 w-3.5" />
                <span>{totalFields} total fields</span>
              </MetaPill>
              <MetaPill>
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>{requiredFields} required / {optionalFields} optional</span>
              </MetaPill>
              {category?.updatedAt ? (
                <MetaPill>
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Updated {formatDate(category.updatedAt)}</span>
                </MetaPill>
              ) : null}
            </div>
          </div>

          {canManageMeasurements ? (
            <div className="flex w-full justify-start lg:w-auto lg:justify-end">
              <Button variant="premium" size="lg" className="w-full sm:w-auto" onClick={onAddField}>
                <Plus className="mr-2 h-5 w-5" />
                Add New Field
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
