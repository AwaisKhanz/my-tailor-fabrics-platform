import { CalendarDays, Plus, Ruler, SlidersHorizontal } from "lucide-react";
import { type MeasurementCategory } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

interface MeasurementCategoryDetailHeaderProps {
  category: MeasurementCategory | null;
  onAddField: () => void;
}

export function MeasurementCategoryDetailHeader({
  category,
  onAddField,
}: MeasurementCategoryDetailHeaderProps) {
  const totalFields = category?.fields?.length ?? 0;
  const requiredFields = category?.fields?.filter((field) => field.isRequired).length ?? 0;
  const optionalFields = Math.max(totalFields - requiredFields, 0);

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <CardContent spacing="section" className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 lg:max-w-[70%]">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Measurement Command
            </Label>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {category?.name || "Category"}
              </h1>
              <Badge variant={category?.isActive ? "success" : "outline"} size="xs">
                {category?.isActive ? "Active" : "Hidden"}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                <Ruler className="h-3.5 w-3.5" />
                <span>{totalFields} total fields</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>{requiredFields} required / {optionalFields} optional</span>
              </div>
              {category?.updatedAt ? (
                <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Updated {formatDate(category.updatedAt)}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex w-full justify-start lg:w-auto lg:justify-end">
            <Button variant="premium" size="lg" className="w-full sm:w-auto" onClick={onAddField}>
              <Plus className="mr-2 h-5 w-5" />
              Add New Field
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
