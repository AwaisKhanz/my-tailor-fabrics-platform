import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/typography";

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
        <Text as="p"  variant="body" className="font-medium leading-none">
          Dropdown Options
        </Text>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Manage Options
        </span>
      </div>

      <InfoTile padding="content" className="min-h-[80px] rounded-md">
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <InfoTile
              key={option}
              tone="default"
              padding="sm"
              layout="row"
              className="inline-flex text-sm font-medium text-foreground"
            >
              {option}
              <button
                type="button"
                onClick={() => onRemoveOption(option)}
                className="ml-0.5 rounded-sm text-muted-foreground transition-colors hover:text-destructive"
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
