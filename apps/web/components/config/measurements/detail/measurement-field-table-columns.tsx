import { useMemo } from "react";
import { CheckCircle2, Edit2, RotateCcw, Trash2 } from "lucide-react";
import {
  type MeasurementField,
  type MeasurementSection,
} from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ColumnDef } from "@/components/ui/data-table";
import { FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UseMeasurementFieldTableColumnsParams {
  canManageFields: boolean;
  movingFieldId: string | null;
  moveSectionOptions: MeasurementSection[];
  onDeleteField: (field: MeasurementField) => void;
  onEditField: (field: MeasurementField) => void;
  onMoveFieldSection?: (
    field: MeasurementField,
    sectionId: string,
  ) => Promise<void> | void;
  onRestoreField?: (field: MeasurementField) => void;
  handleMoveFieldSection: (
    field: MeasurementField,
    sectionId: string,
  ) => Promise<void>;
}

export function useMeasurementFieldTableColumns({
  canManageFields,
  movingFieldId,
  moveSectionOptions,
  onDeleteField,
  onEditField,
  onMoveFieldSection,
  onRestoreField,
  handleMoveFieldSection,
}: UseMeasurementFieldTableColumnsParams) {
  return useMemo<ColumnDef<MeasurementField>[]>(
    () => [
      {
        header: "Field Label",
        cell: (field) => (
          <span className="font-semibold text-foreground">{field.label}</span>
        ),
      },
      {
        header: "Section",
        cell: (field) => {
          const currentSectionId =
            field.sectionId ?? moveSectionOptions[0]?.id ?? "";
          const showSectionMoveSelect =
            canManageFields &&
            Boolean(onMoveFieldSection) &&
            moveSectionOptions.length > 0 &&
            !field.deletedAt &&
            Boolean(currentSectionId);

          if (!showSectionMoveSelect) {
            return (
              <Badge variant="default" size="xs">
                {field.section?.name ?? "General"}
              </Badge>
            );
          }

          return (
            <div className="min-w-[180px]">
              <Select
                value={currentSectionId}
                onValueChange={(nextSectionId) => {
                  void handleMoveFieldSection(field, nextSectionId);
                }}
                disabled={movingFieldId === field.id}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moveSectionOptions.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        },
      },
      {
        header: "Data Type",
        cell: (field) => {
          let typeLabel = "Text";
          if (field.fieldType === "NUMBER") {
            typeLabel = field.unit?.trim()
              ? `Number (${field.unit.trim()})`
              : "Number";
          } else if (field.fieldType === "DROPDOWN") {
            typeLabel = "Dropdown";
          }

          return (
            <Badge variant="info" size="xs">
              {typeLabel}
            </Badge>
          );
        },
      },
      {
        header: "Status",
        cell: (field) => (
          <div className="flex items-center gap-2">
            {field.deletedAt ? (
              <Badge variant="outline" size="xs">
                Archived
              </Badge>
            ) : field.isRequired ? (
              <div className="flex items-center gap-1.5 text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <FieldLabel tone="primary">Required</FieldLabel>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="h-3.5 w-3.5 rounded-full border-2 border-muted" />
                <FieldLabel>Optional</FieldLabel>
              </div>
            )}
          </div>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (field) => (
          <div className="flex items-center justify-end gap-1">
            {canManageFields ? (
              <>
                {field.deletedAt ? (
                  onRestoreField ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestoreField(field)}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                  ) : null
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditField(field)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDeleteField(field)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                Read only
              </span>
            )}
          </div>
        ),
      },
    ],
    [
      canManageFields,
      handleMoveFieldSection,
      moveSectionOptions,
      movingFieldId,
      onDeleteField,
      onEditField,
      onMoveFieldSection,
      onRestoreField,
    ],
  );
}
