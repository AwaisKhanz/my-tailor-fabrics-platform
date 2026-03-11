import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { Input } from "@tbms/ui/components/input";

interface MeasurementFieldDialogDropdownOptionsProps {
  fieldType: string;
  options: string[];
  newOption: string;
  onNewOptionChange: (value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (value: string) => void;
}

export function MeasurementFieldDialogDropdownOptions({
  fieldType,
  options,
  newOption,
  onNewOptionChange,
  onAddOption,
  onRemoveOption,
}: MeasurementFieldDialogDropdownOptionsProps) {
  if (fieldType !== "DROPDOWN") {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-medium leading-none">Dropdown Options</p>
        <span className="text-xs font-bold uppercase  text-muted-foreground">
          Manage Options
        </span>
      </div>

      <div className="min-h-[80px] rounded-md bg-muted/40 p-3">
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <Badge key={option} variant="secondary" className="gap-1">
              {option}
              <button
                type="button"
                onClick={() => onRemoveOption(option)}
                className="ml-0.5 rounded-sm text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          <AddOptionInline
            value={newOption}
            onChange={onNewOptionChange}
            onAdd={onAddOption}
          />
        </div>
      </div>
    </div>
  );
}

function AddOptionInline({
  value,
  onChange,
  onAdd,
}: {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          autoFocus
          placeholder="Option name"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
              setEditing(false);
            }
            if (event.key === "Escape") {
              setEditing(false);
              onChange("");
            }
          }}
          onBlur={() => {
            onAdd();
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      onClick={() => setEditing(true)}
      className="h-7 border-dashed px-3 text-sm font-medium"
    >
      <Plus className="h-3 w-3" />
      Add Option
    </Button>
  );
}
