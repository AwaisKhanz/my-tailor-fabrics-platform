import { type ReactNode } from "react";
import {
  ClipboardList,
  UserSquare2,
  Users,
} from "lucide-react";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { ScrollArea } from "@tbms/ui/components/scroll-area";
import { LoadingState } from "@tbms/ui/components/loading-state";
import { buildOrderDetailRoute } from "@/lib/order-routes";
import {
  buildCustomerDetailRoute,
  buildEmployeeDetailRoute,
} from "@/lib/people-routes";
import { cn, formatDate } from "@/lib/utils";
import { type GlobalSearchResults } from "@/hooks/use-global-search-command";

interface GlobalSearchResultsPanelProps {
  error: string | null;
  hasMinimumQuery: boolean;
  loading: boolean;
  open: boolean;
  resultCount: number;
  results: GlobalSearchResults;
  onNavigate: (path: string) => void;
}

export function GlobalSearchResultsPanel({
  error,
  hasMinimumQuery,
  loading,
  open,
  resultCount,
  results,
  onNavigate,
}: GlobalSearchResultsPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <Card className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-[70] overflow-hidden rounded-3xl">
      <CardHeader className="space-y-2 border-b bg-muted/35 pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Global Search
          </CardTitle>
          <CardDescription className="text-xs">
            {hasMinimumQuery
              ? loading
                ? "Searching..."
                : `${resultCount} result${resultCount === 1 ? "" : "s"}`
              : "Type at least 2 characters"}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea>
          <div className="space-y-3 px-2 py-3">
            {loading ? (
              <PanelMessage>
                <LoadingState
                  compact
                  text="Searching..."
                  caption="Orders, customers, and employees"
                  className="w-full items-start text-left"
                />
              </PanelMessage>
            ) : null}

            {!loading && error ? (
              <PanelMessage tone="destructive">{error}</PanelMessage>
            ) : null}

            {!loading && !error && !hasMinimumQuery ? (
              <PanelMessage>
                Start typing to search order number, customer, phone, or
                employee code.
              </PanelMessage>
            ) : null}

            {!loading && !error && hasMinimumQuery && resultCount === 0 ? (
              <PanelMessage>No matching records found.</PanelMessage>
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
                        onClick={() => onNavigate(buildOrderDetailRoute(order.id))}
                      />
                    ))}
                  </ResultGroup>
                ) : null}

                {results.customers.length > 0 ? (
                  <ResultGroup title="Customers" count={results.customers.length}>
                    {results.customers.map((customer) => (
                      <ResultItem
                        key={customer.id}
                        icon={Users}
                        title={customer.fullName}
                        subtitle={`${customer.sizeNumber} • ${customer.phone}`}
                        onClick={() =>
                          onNavigate(buildCustomerDetailRoute(customer.id))
                        }
                      />
                    ))}
                  </ResultGroup>
                ) : null}

                {results.employees.length > 0 ? (
                  <ResultGroup title="Employees" count={results.employees.length}>
                    {results.employees.map((employee) => (
                      <ResultItem
                        key={employee.id}
                        icon={UserSquare2}
                        title={employee.fullName}
                        subtitle={`${employee.employeeCode} • ${employee.phone}`}
                        onClick={() =>
                          onNavigate(buildEmployeeDetailRoute(employee.id))
                        }
                      />
                    ))}
                  </ResultGroup>
                ) : null}
              </>
            ) : null}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function PanelMessage({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "destructive";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm",
        tone === "destructive"
          ? "border-destructive/25 bg-destructive/5 text-destructive"
          : "border-border bg-muted/30 text-muted-foreground",
      )}
    >
      {children}
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
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <Badge variant="outline" className="h-5 rounded-md px-1.5 text-[10px]">
          {count}
        </Badge>
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
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="h-auto w-full justify-start gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-colors hover:border-primary/35 hover:bg-accent"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {subtitle}
        </span>
      </span>
    </Button>
  );
}
