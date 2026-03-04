"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer, Employee, Order } from "@tbms/shared-types";
import { ClipboardList, Loader2, Search, UserSquare2, Users, X } from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import { customerApi } from "@/lib/api/customers";
import { employeesApi } from "@/lib/api/employees";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatDate } from "@/lib/utils";

interface GlobalSearchCommandProps {
  className?: string;
  compact?: boolean;
  enableHotkeys?: boolean;
}

interface GlobalSearchResults {
  orders: Order[];
  customers: Customer[];
  employees: Employee[];
}

const EMPTY_RESULTS: GlobalSearchResults = {
  orders: [],
  customers: [],
  employees: [],
};

const SEARCH_LIMIT = 6;

export function GlobalSearchCommand({
  className,
  compact = false,
  enableHotkeys = true,
}: GlobalSearchCommandProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GlobalSearchResults>(EMPTY_RESULTS);

  const term = query.trim();
  const hasMinimumQuery = term.length >= 2;

  const resultCount =
    results.orders.length + results.customers.length + results.employees.length;

  const firstResultPath = useMemo(() => {
    if (results.orders[0]) {
      return `/orders/${results.orders[0].id}`;
    }
    if (results.customers[0]) {
      return `/customers/${results.customers[0].id}`;
    }
    if (results.employees[0]) {
      return `/employees/${results.employees[0].id}`;
    }
    return null;
  }, [results]);

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      setQuery("");
      router.push(path);
    },
    [router],
  );

  useEffect(() => {
    if (!enableHotkeys) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
        window.requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [enableHotkeys]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!hasMinimumQuery) {
      setLoading(false);
      setError(null);
      setResults(EMPTY_RESULTS);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const [ordersResponse, customersResponse, employeesResponse] =
          await Promise.all([
            ordersApi.getOrders({ page: 1, limit: SEARCH_LIMIT, search: term }),
            customerApi.getCustomers(1, SEARCH_LIMIT, term),
            employeesApi.getEmployees({ page: 1, limit: SEARCH_LIMIT, search: term }),
          ]);

        if (cancelled) {
          return;
        }

        setResults({
          orders: ordersResponse.success ? ordersResponse.data.data : [],
          customers: customersResponse.success ? customersResponse.data.data : [],
          employees: employeesResponse.success ? employeesResponse.data.data : [],
        });
      } catch {
        if (cancelled) {
          return;
        }
        setResults(EMPTY_RESULTS);
        setError("Search service is temporarily unavailable.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, hasMinimumQuery, term]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        variant="table"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          if (!open) {
            setOpen(true);
          }
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && firstResultPath && hasMinimumQuery && !loading) {
            event.preventDefault();
            navigate(firstResultPath);
          }
        }}
        placeholder={compact ? "Search orders, customers..." : "Search orders, customers, and staff..."}
        className={cn(
          "h-9 w-full border-border/70 bg-background/90 pl-10",
          query ? "pr-9" : !compact ? "pr-24" : undefined,
        )}
      />

      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setResults(EMPTY_RESULTS);
            setError(null);
            inputRef.current?.focus();
          }}
          className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : !compact ? (
        <div className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border/70 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground xl:inline-flex">
          Ctrl/Cmd K
        </div>
      ) : null}

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-[70] overflow-hidden rounded-xl border border-border/70 bg-card shadow-theme-elevated">
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Global Search
            </p>
            <p className="text-xs text-muted-foreground">
              {hasMinimumQuery
                ? loading
                  ? "Searching..."
                  : `${resultCount} result${resultCount === 1 ? "" : "s"}`
                : "Type at least 2 characters"}
            </p>
          </div>

          <ScrollArea className="max-h-[420px]">
            <div className="space-y-3 p-3">
              {loading ? (
                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching orders, customers, and employees...
                </div>
              ) : null}

              {!loading && error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              {!loading && !error && !hasMinimumQuery ? (
                <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm text-muted-foreground">
                  Start typing to search order number, customer, phone, or employee code.
                </div>
              ) : null}

              {!loading && !error && hasMinimumQuery && resultCount === 0 ? (
                <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm text-muted-foreground">
                  No matching records found.
                </div>
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
                          onClick={() => navigate(`/orders/${order.id}`)}
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
                          onClick={() => navigate(`/customers/${customer.id}`)}
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
                          onClick={() => navigate(`/employees/${employee.id}`)}
                        />
                      ))}
                    </ResultGroup>
                  ) : null}
                </>
              ) : null}
            </div>
          </ScrollArea>
        </div>
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
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground">{count}</p>
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
      className="flex w-full items-center gap-3 rounded-lg border border-border/60 bg-background/35 px-3 py-2.5 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}
