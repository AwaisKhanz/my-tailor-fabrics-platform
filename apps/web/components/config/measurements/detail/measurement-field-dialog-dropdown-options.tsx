import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
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
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
          Manage Options
        </span>
      </div>

      <InfoTile padding="content" className="min-h-[80px] rounded-md">
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <InfoTile
              key={option}
              tone="surface"
              padding="sm"
              layout="row"
              className="inline-flex text-sm font-medium text-text-primary"
            >
              {option}
              <button
                type="button"
                onClick={() => onRemoveOption(option)}
                className="ml-0.5 rounded-sm text-text-secondary transition-colors hover:text-error"
              >
                <X className="h-3 w-3" />
              </button>
            </InfoTile>
          ))}

          <AddOptionInline
            value={newOption}
            onChange={onNewOptionChange}
            onAdd={onAddOption}
          />
        </div>
      </InfoTile>
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
          variant="inlineChip"
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
      variant="outlineDashed"
      size="sm"
      onClick={() => setEditing(true)}
      className="h-7 px-3 text-sm font-medium"
    >
      <Plus className="h-3 w-3" />
      Add Option
    </Button>
  );
}
