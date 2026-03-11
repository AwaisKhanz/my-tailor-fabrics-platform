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
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/80 bg-muted/25 px-4 py-4 text-center",
        compact && "border-0 bg-transparent px-0 py-0",
        className,
      )}
      {...props}
    >
      <div className="text-primary">
        <TypewriterLoader typingText={text} typingSpeed={90} />
      </div>
      {caption ? <p className="text-xs text-muted-foreground">{caption}</p> : null}
    </div>
  );
}
