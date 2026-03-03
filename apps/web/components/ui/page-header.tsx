import * as React from 'react';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        <Typography as="h1" variant="pageTitle">
          {title}
        </Typography>
        {description ? (
          <Typography as="p" variant="lead" className="mt-1">
            {description}
          </Typography>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
