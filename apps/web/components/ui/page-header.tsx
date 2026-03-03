import * as React from 'react';
import { Typography } from '@/components/ui/typography';
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
      className={cn(
        "items-start justify-between gap-4",
        stackOnMobile ? "flex flex-col sm:flex-row" : "flex",
        className,
      )}
    >
      <div className="min-w-0">
        <Typography as="h1" variant="pageTitle">
          {title}
        </Typography>
        {description ? (
          <Typography
            as="p"
            variant="lead"
            className={cn(density === "compact" ? "mt-0.5" : "mt-1")}
          >
            {description}
          </Typography>
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
