import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className={cn("overflow-hidden border-border/70 bg-card/95", className)}>
      <CardHeader variant="rowSection" className="items-start gap-4 sm:items-center">
        <div className="flex items-center gap-3">
          {icon ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              {icon}
            </div>
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

      {footer ? <div className="border-t border-border/50 px-6 py-4">{footer}</div> : null}
    </Card>
  );
}
