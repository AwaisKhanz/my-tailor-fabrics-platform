import * as React from "react";

import { DecorIcon } from "@tbms/ui/components/decor-icon";
import { cn } from "@tbms/ui/lib/utils";

function Card({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card relative isolate flex flex-col gap-4 overflow-hidden rounded-lg border border-border/80 bg-linear-to-b from-background via-card via-65% to-muted/30 py-5 text-sm text-card-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.9),0_1px_2px_0_hsl(0_0%_0%/0.06),0_20px_44px_-26px_hsl(0_0%_0%/0.24)] dark:border-white/12 dark:bg-card dark:[background-image:linear-gradient(180deg,hsl(0_0%_100%/.04),transparent_24%),radial-gradient(58%_86%_at_14%_0%,hsl(0_0%_100%/.10),transparent_60%)] dark:shadow-[inset_0_1px_0_hsl(0_0%_100%/0.14),0_1px_2px_0_hsl(0_0%_0%/0.42),0_18px_40px_-24px_hsl(0_0%_0%/0.72)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-4 data-[size=sm]:has-data-[slot=card-footer]:pb-0",
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_100%,hsl(0_0%_0%/.045),transparent_38%)] dark:bg-[radial-gradient(100%_100%_at_0%_0%,hsl(0_0%_100%/.05),transparent_42%)]" />
        <div className="absolute inset-y-6 left-0 w-px bg-border/80" />
        <div className="absolute inset-y-6 right-0 w-px bg-border/80" />
        <div className="absolute inset-x-6 top-0 h-px bg-border/80" />
        <div className="absolute inset-x-6 bottom-0 h-px bg-border/80" />
        <DecorIcon position="top-right" className="stroke-border" />
        <DecorIcon position="bottom-left" className="stroke-border" />
      </div>
      {children}
    </div>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1.5  px-5 group-data-[size=sm]/card:px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 group-data-[size=sm]/card:px-4", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center  border-t bg-muted/35 p-5 group-data-[size=sm]/card:p-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
