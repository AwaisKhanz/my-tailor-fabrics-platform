"use client";

import { useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Loader2,
  Search,
  UserSquare2,
  Users,
  X,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { InfoTile, infoTileVariants } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { MetaPill } from "@/components/ui/meta-pill";
import { useGlobalSearchCommand } from "@/hooks/use-global-search-command";
import {
  buildCustomerDetailRoute,
  buildEmployeeDetailRoute,
} from "@/lib/people-routes";
import { buildOrderDetailRoute } from "@/lib/order-routes";
import { SectionIcon } from "@/components/ui/section-icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatDate } from "@/lib/utils";

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
    <div
      ref={containerRef}
      className={cn("dashboard-shell-search relative w-full", className)}
    >
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
          "w-full rounded-snow-20 pl-10",
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
        <MetaPill className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 gap-1 px-1.5 py-0.5 text-xs font-medium xl:inline-flex">
          Ctrl/Cmd K
        </MetaPill>
      ) : null}

      {open ? (
        <Card className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-[70] overflow-hidden rounded-snow-28">
          <CardHeader
            density="compact"
            layout="rowBetween"
            surface="secondarySection"
          >
            <p className="text-xs font-semibold uppercase  text-muted-foreground">
              Global Search
            </p>
            <p className="text-xs text-muted-foreground">
              {hasMinimumQuery
                ? loading
                  ? "Searching..."
                  : `${resultCount} result${resultCount === 1 ? "" : "s"}`
                : "Type at least 2 characters"}
            </p>
          </CardHeader>

          <ScrollArea>
            <div className="space-y-3 py-3 px-2">
              {loading ? (
                <InfoTile
                  tone="secondary"
                  padding="md"
                  layout="row"
                  className="text-sm text-muted-foreground"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching orders, customers, and employees...
                </InfoTile>
              ) : null}

              {!loading && error ? (
                <InfoTile
                  tone="destructive"
                  padding="md"
                  className="text-sm text-destructive"
                >
                  {error}
                </InfoTile>
              ) : null}

              {!loading && !error && !hasMinimumQuery ? (
                <InfoTile
                  tone="secondary"
                  padding="md"
                  className="text-sm text-muted-foreground"
                >
                  Start typing to search order number, customer, phone, or
                  employee code.
                </InfoTile>
              ) : null}

              {!loading && !error && hasMinimumQuery && resultCount === 0 ? (
                <InfoTile
                  tone="secondary"
                  padding="md"
                  className="text-sm text-muted-foreground"
                >
                  No matching records found.
                </InfoTile>
              ) : null}

              {!loading && !error && hasMinimumQuery ? (
                <>
                  {results.orders.length > 0 ? (
                    <ResultGroup title="Orders" count={results.orders.length}>
                      {results.orders.map((order) => (
                        <ResultItem
                          key={order.id}
                          icon={ClipboardList}
                          title={order.orderNumber}
                          subtitle={`${order.customer?.fullName ?? "Unknown customer"} • Due ${formatDate(order.dueDate)}`}
                          onClick={() => navigate(buildOrderDetailRoute(order.id))}
                        />
                      ))}
                    </ResultGroup>
                  ) : null}

                  {results.customers.length > 0 ? (
                    <ResultGroup
                      title="Customers"
                      count={results.customers.length}
                    >
                      {results.customers.map((customer) => (
                        <ResultItem
                          key={customer.id}
                          icon={Users}
                          title={customer.fullName}
                          subtitle={`${customer.sizeNumber} • ${customer.phone}`}
                          onClick={() =>
                            navigate(buildCustomerDetailRoute(customer.id))
                          }
                        />
                      ))}
                    </ResultGroup>
                  ) : null}

                  {results.employees.length > 0 ? (
                    <ResultGroup
                      title="Employees"
                      count={results.employees.length}
                    >
                      {results.employees.map((employee) => (
                        <ResultItem
                          key={employee.id}
                          icon={UserSquare2}
                          title={employee.fullName}
                          subtitle={`${employee.employeeCode} • ${employee.phone}`}
                          onClick={() =>
                            navigate(buildEmployeeDetailRoute(employee.id))
                          }
                        />
                      ))}
                    </ResultGroup>
                  ) : null}
                </>
              ) : null}
            </div>
          </ScrollArea>
        </Card>
      ) : null}
    </div>
  );
}

function ResultGroup({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase  text-muted-foreground">
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{count}</p>
      </div>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function ResultItem({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        infoTileVariants({
          tone: "secondary",
          padding: "lg",
          layout: "row",
        }),
        "w-full text-left transition-colors hover:border-primary/35 hover:bg-accent",
      )}
    >
      <SectionIcon tone="default" framed={false} className="rounded-md">
        <Icon className="h-4 w-4" />
      </SectionIcon>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {subtitle}
        </span>
      </span>
    </button>
  );
}
