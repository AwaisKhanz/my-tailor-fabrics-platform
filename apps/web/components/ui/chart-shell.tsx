import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionIcon } from "@/components/ui/section-icon";

interface ChartShellProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  legend?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ChartShell({
  title,
  description,
  icon,
  actions,
  legend,
  children,
  footer,
  className,
  contentClassName,
}: ChartShellProps) {
  return (
    <Card className={cn("overflow-hidden border-divider bg-surface-elevated", className)}>
      <CardHeader variant="rowSection" className="items-start gap-4 sm:items-center">
        <div className="flex items-center gap-3">
          {icon ? (
            <SectionIcon size="lg">
              {icon}
            </SectionIcon>
          ) : null}
          <div>
            <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
            {description ? (
              <CardDescription className="mt-1 text-xs">{description}</CardDescription>
            ) : null}
          </div>
        </div>

        {actions ? <div className="ml-auto w-full sm:w-auto">{actions}</div> : null}
      </CardHeader>

      <CardContent spacing="section" className={cn("space-y-4", contentClassName)}>
        {legend ? <div className="flex flex-wrap items-center gap-2">{legend}</div> : null}
        {children}
      </CardContent>

      {footer ? <div className="border-t border-divider px-6 py-4">{footer}</div> : null}
    </Card>
  );
}
