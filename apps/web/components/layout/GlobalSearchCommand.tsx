"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Badge } from "@tbms/ui/components/badge";
import { Input } from "@tbms/ui/components/input";
import { useGlobalSearchCommand } from "@/hooks/use-global-search-command";
import { cn } from "@/lib/utils";
import { GlobalSearchResultsPanel } from "@/components/layout/global-search-results-panel";

interface GlobalSearchCommandProps {
  className?: string;
  compact?: boolean;
  enableHotkeys?: boolean;
}

export function GlobalSearchCommand({
  className,
  compact = false,
  enableHotkeys = true,
}: GlobalSearchCommandProps) {
  const router = useRouter();
  const {
    containerRef,
    inputRef,
    open,
    query,
    loading,
    error,
    results,
    hasMinimumQuery,
    resultCount,
    firstResultPath,
    setOpen,
    updateQuery,
    clearQuery,
  } = useGlobalSearchCommand({
    enableHotkeys,
  });

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      clearQuery();
      router.push(path);
    },
    [clearQuery, router, setOpen],
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={query}
        onChange={(event) => updateQuery(event.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            firstResultPath &&
            hasMinimumQuery &&
            !loading
          ) {
            event.preventDefault();
            navigate(firstResultPath);
          }
        }}
        placeholder={
          compact
            ? "Search orders, customers..."
            : "Search orders, customers, and staff..."
        }
        className={cn(
          "w-full rounded-xl pl-10",
          query ? "pr-9" : !compact ? "pr-24" : undefined,
        )}
      />

      {query ? (
        <button
          type="button"
          onClick={clearQuery}
          className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : !compact ? (
        <Badge
          variant="outline"
          className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide xl:inline-flex"
        >
          Ctrl/Cmd K
        </Badge>
      ) : null}

      <GlobalSearchResultsPanel
        error={error}
        hasMinimumQuery={hasMinimumQuery}
        loading={loading}
        open={open}
        resultCount={resultCount}
        results={results}
        onNavigate={navigate}
      />
    </div>
  );
}
