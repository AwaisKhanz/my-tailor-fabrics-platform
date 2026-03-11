import {
  CalendarDays,
  FolderPlus,
  Plus,
  Ruler,
  SlidersHorizontal,
} from "lucide-react";
import { type MeasurementCategory } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { PageHeader } from "@tbms/ui/components/page-header";
import { formatDate } from "@/lib/utils";

interface MeasurementCategoryDetailHeaderProps {
  category: MeasurementCategory | null;
  includeArchived: boolean;
  onIncludeArchivedChange: (next: boolean) => void;
  onAddSection: () => void;
  onAddField: () => void;
  canManageMeasurements?: boolean;
}

export function MeasurementCategoryDetailHeader({
  category,
  includeArchived,
  onIncludeArchivedChange,
  onAddSection,
  onAddField,
  canManageMeasurements = true,
}: MeasurementCategoryDetailHeaderProps) {
  const totalFields = category?.fields?.length ?? 0;
  const totalSections = category?.sections?.length ?? 0;
  const requiredFields =
    category?.fields?.filter((field) => field.isRequired).length ?? 0;
  const optionalFields = Math.max(totalFields - requiredFields, 0);
  const updatedLabel = category?.updatedAt
    ? formatDate(category.updatedAt)
    : null;

  return (
    <div className="space-y-3">
      <PageHeader
        title={category?.name || "Category"}
        description="Manage sections, fields, required rules, and archival visibility for this measurement category."
        actions={
          canManageMeasurements ? (
            <>
              <Button
                variant={includeArchived ? "default" : "outline"}
                onClick={() => onIncludeArchivedChange(!includeArchived)}
              >
                {includeArchived ? "Showing Archived" : "Show Archived"}
              </Button>
              <Button variant="outline" onClick={onAddSection}>
                <FolderPlus className="h-4 w-4" />
                Add Section
              </Button>
              <Button variant="default" onClick={onAddField}>
                <Plus className="h-4 w-4" />
                Add New Field
              </Button>
            </>
          ) : null
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={category?.isActive ? "default" : "outline"}>
          {category?.isActive ? "Active" : "Hidden"}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Ruler className="h-3.5 w-3.5" />
          {totalFields} fields
        </Badge>
        <Badge variant="outline" className="gap-1">
          {totalSections} sections
        </Badge>
        <Badge variant="outline" className="gap-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {requiredFields} required / {optionalFields} optional
        </Badge>
        {updatedLabel ? (
          <Badge variant="outline" className="gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            Updated {updatedLabel}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}
