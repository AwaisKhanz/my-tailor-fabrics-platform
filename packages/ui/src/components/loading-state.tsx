import * as React from "react";
import { TypewriterLoader } from "@tbms/ui/components/molecule-ui/typewriter-loader";
import { cn } from "@tbms/ui/lib/utils";

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  caption?: string;
  compact?: boolean;
}

export function LoadingState({
  text = "Loading...",
  caption,
  compact = false,
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2  text-center",
        compact && " px-0 py-0",
        className,
      )}
      {...props}
    >
      <div className="text-primary">
        <TypewriterLoader typingText={text} typingSpeed={40} />
      </div>
      {caption ? (
        <p className="text-xs text-muted-foreground">{caption}</p>
      ) : null}
    </div>
  );
}
