import * as React from 'react';
import { Heading, Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  stackOnMobile?: boolean;
  actionWrap?: boolean;
  density?: "compact" | "default";
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  stackOnMobile = true,
  actionWrap = true,
  density = "default",
}: PageHeaderProps) {
  return (
    <div
      data-ui="page-header"
      className={cn(
        "items-start justify-between gap-4 rounded-[28px] border border-border bg-card/96 px-5 py-5 shadow-sm backdrop-blur-xl sm:px-6 sm:py-6",
        stackOnMobile ? "flex flex-col sm:flex-row" : "flex",
        className,
      )}
    >
      <div className="min-w-0">
        <Heading as="h1" variant="page">
          {title}
        </Heading>
        {description ? (
          <Text
            as="div"
            variant="lead"
            className={cn(density === "compact" ? "mt-0.5" : "mt-1")}
          >
            {description}
          </Text>
        ) : null}
      </div>
      {actions ? (
        <div
          className={cn(
            "w-full sm:w-auto",
            actionWrap
              ? "flex flex-wrap items-center gap-2 sm:justify-end"
              : "shrink-0",
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
