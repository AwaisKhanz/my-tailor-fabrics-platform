"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer, Employee, Order } from "@tbms/shared-types";
import {
  ClipboardList,
  Loader2,
  Search,
  UserSquare2,
  Users,
  X,
} from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import { customerApi } from "@/lib/api/customers";
import { employeesApi } from "@/lib/api/employees";
import { Card, CardHeader } from "@/components/ui/card";
import { InfoTile, infoTileVariants } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { MetaPill } from "@/components/ui/meta-pill";
import { SectionIcon } from "@/components/ui/section-icon";
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
            employeesApi.getEmployees({
              page: 1,
              limit: SEARCH_LIMIT,
              search: term,
            }),
          ]);

        if (cancelled) {
          return;
        }

        setResults({
          orders: ordersResponse.success ? ordersResponse.data.data : [],
          customers: customersResponse.success
            ? customersResponse.data.data
            : [],
          employees: employeesResponse.success
            ? employeesResponse.data.data
            : [],
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
      <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-secondary" />
      <Input
        ref={inputRef}
        variant="searchCommand"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          if (!open) {
            setOpen(true);
          }
        }}
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
          "w-full pl-10",
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
          className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-text-secondary hover:bg-interaction-hover hover:text-text-primary"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : !compact ? (
        <MetaPill className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 gap-1 px-1.5 py-0.5 text-[10px] font-medium xl:inline-flex">
          Ctrl/Cmd K
        </MetaPill>
      ) : null}

      {open ? (
        <Card
          variant="elevatedPanel"
          className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-[70] overflow-hidden"
        >
          <CardHeader variant="rowSection" density="compact">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
              Global Search
            </p>
            <p className="text-xs text-text-secondary">
              {hasMinimumQuery
                ? loading
                  ? "Searching..."
                  : `${resultCount} result${resultCount === 1 ? "" : "s"}`
                : "Type at least 2 characters"}
            </p>
          </CardHeader>

          <ScrollArea variant="default">
            <div className="space-y-3 py-3 px-2">
              {loading ? (
                <InfoTile
                  tone="elevatedMuted"
                  padding="md"
                  layout="row"
                  className="text-sm text-text-secondary"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching orders, customers, and employees...
                </InfoTile>
              ) : null}

              {!loading && error ? (
                <InfoTile
                  tone="error"
                  padding="md"
                  className="text-sm text-error"
                >
                  {error}
                </InfoTile>
              ) : null}

              {!loading && !error && !hasMinimumQuery ? (
                <InfoTile
                  tone="elevatedMuted"
                  padding="md"
                  className="text-sm text-text-secondary"
                >
                  Start typing to search order number, customer, phone, or
                  employee code.
                </InfoTile>
              ) : null}

              {!loading && !error && hasMinimumQuery && resultCount === 0 ? (
                <InfoTile
                  tone="elevatedMuted"
                  padding="md"
                  className="text-sm text-text-secondary"
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
                          onClick={() => navigate(`/orders/${order.id}`)}
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
                          onClick={() => navigate(`/customers/${customer.id}`)}
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
                          onClick={() => navigate(`/employees/${employee.id}`)}
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
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
          {title}
        </p>
        <p className="text-[11px] text-text-secondary">{count}</p>
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
          tone: "elevatedMuted",
          padding: "lg",
          layout: "row",
        }),
        "w-full text-left transition-colors hover:border-primary/35 hover:bg-interaction-hover",
      )}
    >
      <SectionIcon tone="primary" framed={false} className="rounded-md">
        <Icon className="h-4 w-4" />
      </SectionIcon>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text-primary">
          {title}
        </span>
        <span className="block truncate text-xs text-text-secondary">
          {subtitle}
        </span>
      </span>
    </button>
  );
}
