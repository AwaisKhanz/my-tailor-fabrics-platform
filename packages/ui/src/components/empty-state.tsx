import { Button } from "@tbms/ui/components/button";
import { Heading, Text } from "@tbms/ui/components/typography";
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
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-secondary shadow-sm">
        <Icon className="h-6 w-6 text-foreground" />
      </div>
      <Heading as="h3" variant="section" className="text-base">
        {title}
      </Heading>
      {description && (
        <Text as="p" variant="lead" className="mt-2 max-w-sm">
          {description}
        </Text>
      )}
      {action && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
