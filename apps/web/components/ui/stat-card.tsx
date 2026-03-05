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
      default: "text-text-primary",
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

const statIconTone = cva(
  "flex h-10 w-10 items-center justify-center rounded-lg border",
  {
    variants: {
      tone: {
        default: "border-divider bg-muted text-muted-foreground",
        primary: "border-primary/20 bg-primary/10 text-primary",
        success: "border-success/20 bg-success-muted text-success",
        warning: "border-warning/20 bg-warning-muted text-warning",
        destructive: "border-destructive/20 bg-error-muted text-destructive",
        info: "border-info/20 bg-info-muted text-info",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

const statBadgeTone: Record<
  NonNullable<StatCardProps["tone"]>,
  NonNullable<React.ComponentProps<typeof Badge>["variant"]>
> = {
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
  iconTone?: NonNullable<VariantProps<typeof statIconTone>["tone"]>;
  valueTone?: NonNullable<VariantProps<typeof statValueTone>["tone"]>;
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
  iconTone,
  valueTone,
  className,
  contentClassName,
  valueClassName,
}: StatCardProps) {
  const resolvedTone = tone ?? "default";
  const resolvedIconTone = iconTone ?? resolvedTone;
  const resolvedValueTone = valueTone ?? resolvedTone;

  return (
    <Card
      variant="elevatedPanel"
      className={cn(
        "overflow-hidden",
        statCardTone({ tone: resolvedTone }),
        className,
      )}
    >
      <CardHeader variant="rowSection" density="compact" align="start" gap="sm">
        <div className="space-y-1">
          <CardTitle variant="dashboard" className="text-base">
            {title}
          </CardTitle>
          {subtitle ? <Label variant="micro">{subtitle}</Label> : null}
        </div>

        {icon ? (
          <div className={statIconTone({ tone: resolvedIconTone })}>{icon}</div>
        ) : null}
      </CardHeader>

      <CardContent
        spacing="section"
        className={cn("space-y-2 p-5", contentClassName)}
      >
        <div className="flex items-center gap-2">
          <Typography
            as="p"
            variant="statValue"
            className={cn(
              statValueTone({ tone: resolvedValueTone }),
              valueClassName,
            )}
          >
            {value}
          </Typography>
          {badgeText ? (
            <Badge variant={statBadgeTone[resolvedTone]} size="xs">
              {badgeText}
            </Badge>
          ) : null}
        </div>

        {helperText ? (
          <Label variant="dashboard" className="text-text-secondary">
            {helperText}
          </Label>
        ) : null}

        {action ? <div>{action}</div> : null}
      </CardContent>
    </Card>
  );
}
