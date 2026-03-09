import { type ReactNode } from "react";
import {
  ClipboardList,
  Loader2,
  UserSquare2,
  Users,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { InfoTile, infoTileVariants } from "@/components/ui/info-tile";
import { SectionIcon } from "@/components/ui/section-icon";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    </Card>
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
