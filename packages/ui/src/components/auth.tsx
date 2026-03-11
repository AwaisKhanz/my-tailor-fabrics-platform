import { cn } from "@tbms/ui/lib/utils";
import type React from "react";
import { DecorIcon } from "@tbms/ui/components/decor-icon";
export interface AuthPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
  eyebrow?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  panelClassName?: string;
  bodyClassName?: string;
}

export function AuthPage({
  title,
  description,
  children,
  eyebrow,
  footer,
  className,
  panelClassName,
  bodyClassName,
}: AuthPageProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 md:px-8",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex w-full max-w-sm flex-col justify-between p-6 md:p-8",
          "dark:bg-[radial-gradient(50%_80%_at_20%_0%,--theme(--color-foreground/.1),transparent)]",
          panelClassName,
        )}
      >
        <div className="absolute -inset-y-6 -left-px w-px bg-border" />
        <div className="absolute -inset-y-6 -right-px w-px bg-border" />
        <div className="absolute -inset-x-6 -top-px h-px bg-border" />
        <div className="absolute -inset-x-6 -bottom-px h-px bg-border" />
        <DecorIcon position="top-left" />
        <DecorIcon position="bottom-right" />

        <div className={cn("w-full max-w-sm animate-in space-y-8", bodyClassName)}>
          <div className="flex flex-col space-y-1">
            {eyebrow ? eyebrow : null}
            <h1 className="font-bold text-2xl tracking-wide">{title}</h1>
            <p className="text-base text-muted-foreground">{description}</p>
          </div>
          {children}
          {footer ? <div className="text-muted-foreground text-sm">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
