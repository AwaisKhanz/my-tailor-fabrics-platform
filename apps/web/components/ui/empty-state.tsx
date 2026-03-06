import React from "react";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
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
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card py-16 text-center shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <Heading as="h3" variant="section" className="text-sm">
        {title}
      </Heading>
      {description && (
        <Text as="p" variant="lead" className="mt-1 max-w-xs">
          {description}
        </Text>
      )}
      {action && (
        <Button
          variant="secondary"
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
