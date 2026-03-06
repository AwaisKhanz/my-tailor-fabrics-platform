import * as React from "react";
import { cn } from "@/lib/utils";
import { CardDescription, CardTitle } from "@/components/ui/card";

type CardTitleVariant = React.ComponentProps<typeof CardTitle>["variant"];
type CardDescriptionVariant = React.ComponentProps<
  typeof CardDescription
>["variant"];

interface SectionHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  titleVariant?: CardTitleVariant;
  descriptionVariant?: CardDescriptionVariant;
  className?: string;
  textClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SectionHeader({
  title,
  description,
  icon,
  titleVariant = "section",
  descriptionVariant = "header",
  className,
  textClassName,
  titleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      {icon ? <div className="shrink-0">{icon}</div> : null}
      <div className={cn("min-w-0 space-y-1", textClassName)}>
        <CardTitle
          variant={titleVariant}
          className={cn(description ? "" : "mt-1", titleClassName)}
        >
          {title}
        </CardTitle>
        {description ? (
          <CardDescription
            variant={descriptionVariant}
            className={descriptionClassName}
          >
            {description}
          </CardDescription>
        ) : null}
      </div>
    </div>
  );
}
