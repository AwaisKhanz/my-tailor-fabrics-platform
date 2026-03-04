import React from "react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /** Icon to display — pass a Lucide icon component */
  icon: LucideIcon;
  /** Primary headline */
  title: string;
  /** Supporting description */
  description?: string;
  /** Optional CTA button */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * A standardized empty state component for all list pages.
 * Shown when a table has zero rows to display.
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-divider bg-surface-elevated py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sidebar-active">
        <Icon className="h-6 w-6 text-text-secondary" />
      </div>
      <Typography as="h3" variant="sectionTitle" className="text-sm">
        {title}
      </Typography>
      {description && (
        <Typography as="p" variant="lead" className="mt-1 max-w-xs">
          {description}
        </Typography>
      )}
      {action && (
        <Button
          variant="muted"
          size="sm"
          className="mt-4"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
