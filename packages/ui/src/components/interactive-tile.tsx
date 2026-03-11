import * as React from "react";
import { InfoTile, type InfoTileProps } from "@tbms/ui/components/info-tile";
import { cn } from "@tbms/ui/lib/utils";

export interface InteractiveTileProps extends InfoTileProps {
  active?: boolean;
}

export function InteractiveTile({
  active = false,
  className,
  padding = "md",
  radius = "lg",
  ...props
}: InteractiveTileProps) {
  return (
    <InfoTile
      padding={padding}
      radius={radius}
      className={cn(
        "transition-colors",
        active
          ? "border-primary/40 bg-accent"
          : "border-border bg-card hover:border-border",
        className,
      )}
      {...props}
    />
  );
}
