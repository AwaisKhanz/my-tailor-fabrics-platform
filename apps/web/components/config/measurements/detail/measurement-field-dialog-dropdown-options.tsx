import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Typography } from "@/components/ui/typography";

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
        <Typography as="p" variant="body" className="font-medium leading-none">
          Dropdown Options
        </Typography>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Manage Options
        </span>
      </div>

      <div className="min-h-[80px] rounded-md border bg-muted/50 p-3">
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <span
              key={option}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1 text-sm font-medium text-foreground shadow-sm"
            >
              {option}
              <button
                type="button"
                onClick={() => onRemoveOption(option)}
                className="ml-0.5 rounded-sm text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
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
        <input
          autoFocus
          className="w-28 rounded border border-primary/50 bg-background px-2 py-1 text-sm outline-none ring-1 ring-primary/20"
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
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="inline-flex items-center gap-1 rounded-md border border-dashed border-primary/50 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
    >
      <Plus className="h-3 w-3" />
      Add Option
    </button>
  );
}
