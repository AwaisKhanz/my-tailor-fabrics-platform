import * as React from "react";
import { cn } from "@tbms/ui/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
} from "@tbms/ui/components/card";
import { SectionIcon } from "@tbms/ui/components/section-icon";
import { SectionHeader } from "@tbms/ui/components/section-header";

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
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="border-b pb-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          title={title}
          description={description}
          icon={icon ? <SectionIcon size="lg">{icon}</SectionIcon> : undefined}
          descriptionVariant="header"
        />

        {actions ? (
          <div className="ml-auto w-full sm:w-auto">{actions}</div>
        ) : null}
      </CardHeader>

      <CardContent className={cn("h-full space-y-4", contentClassName)}>
        {legend ? (
          <div className="flex flex-wrap items-center gap-2">{legend}</div>
        ) : null}
        {children}
      </CardContent>

      {footer ? (
        <div className="border-t border-border px-5 py-4">{footer}</div>
      ) : null}
    </Card>
  );
}
