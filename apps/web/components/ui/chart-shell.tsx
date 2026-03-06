import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { SectionIcon } from "@/components/ui/section-icon";
import { SectionHeader } from "@/components/ui/section-header";

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
      <CardHeader align="startResponsive" gap="md" className="flex-row items-center !rounded-b-none justify-between gap-3 border-b border-border bg-muted/40 px-6 py-4">
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

      <CardContent
        spacing="section"
        className={cn("space-y-4 h-full", contentClassName)}
      >
        {legend ? (
          <div className="flex flex-wrap items-center gap-2">{legend}</div>
        ) : null}
        {children}
      </CardContent>

      {footer ? (
        <div className="border-t border-border px-6 py-4">{footer}</div>
      ) : null}
    </Card>
  );
}
