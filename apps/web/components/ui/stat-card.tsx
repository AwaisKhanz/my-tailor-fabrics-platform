import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const statCardTone = cva("", {
  variants: {
    tone: {
      default: "",
      primary: "",
      success: "",
      warning: "",
      destructive: "",
      info: "",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

const statValueTone = cva("text-3xl", {
  variants: {
    tone: {
      default: "text-foreground",
      primary: "text-primary",
      success: "text-success",
      warning: "text-warning",
      destructive: "text-destructive",
      info: "text-info",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

const statIconTone = cva("flex h-10 w-10 items-center justify-center rounded-lg border", {
  variants: {
    tone: {
      default: "border-border/70 bg-muted/20 text-muted-foreground",
      primary: "border-primary/20 bg-primary/15 text-primary",
      success: "border-success/20 bg-success/15 text-success",
      warning: "border-warning/20 bg-warning/15 text-warning",
      destructive: "border-destructive/20 bg-destructive/15 text-destructive",
      info: "border-info/20 bg-info/15 text-info",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

const statBadgeTone: Record<NonNullable<StatCardProps["tone"]>, NonNullable<React.ComponentProps<typeof Badge>["variant"]>> = {
  default: "outline",
  primary: "info",
  success: "success",
  warning: "warning",
  destructive: "destructive",
  info: "info",
};

export interface StatCardProps extends VariantProps<typeof statCardTone> {
  title: string;
  subtitle?: string;
  value: React.ReactNode;
  helperText?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  badgeText?: string;
  className?: string;
  contentClassName?: string;
  valueClassName?: string;
}

export function StatCard({
  title,
  subtitle,
  value,
  helperText,
  action,
  icon,
  badgeText,
  tone = "default",
  className,
  contentClassName,
  valueClassName,
}: StatCardProps) {
  const resolvedTone = tone ?? "default";

  return (
    <Card className={cn("overflow-hidden border-border/70 bg-card/95 shadow-sm", statCardTone({ tone: resolvedTone }), className)}>
      <CardHeader variant="rowSection" density="compact" className="items-start gap-3">
        <div className="space-y-1">
          <CardTitle variant="dashboard" className="text-base">
            {title}
          </CardTitle>
          {subtitle ? (
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{subtitle}</Label>
          ) : null}
        </div>

        {icon ? <div className={statIconTone({ tone: resolvedTone })}>{icon}</div> : null}
      </CardHeader>

      <CardContent spacing="section" className={cn("space-y-2 p-5", contentClassName)}>
        <div className="flex items-center gap-2">
          <Typography as="p" variant="statValue" className={cn(statValueTone({ tone: resolvedTone }), valueClassName)}>
            {value}
          </Typography>
          {badgeText ? (
            <Badge variant={statBadgeTone[resolvedTone]} size="xs">
              {badgeText}
            </Badge>
          ) : null}
        </div>

        {helperText ? (
          <Label variant="dashboard" className="text-muted-foreground">
            {helperText}
          </Label>
        ) : null}

        {action ? <div>{action}</div> : null}
      </CardContent>
    </Card>
  );
}
