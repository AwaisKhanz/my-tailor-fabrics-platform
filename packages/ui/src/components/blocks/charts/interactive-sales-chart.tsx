"use client";

import * as React from "react";
import {
  ArrowDownToLineIcon,
  FileJsonIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  SettingsIcon,
  Share2Icon,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@tbms/ui/components/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tbms/ui/components/dropdown-menu";

export interface InteractiveSalesChartRow {
  label: string;
  revenue: number;
  expenses: number;
}

export interface InteractiveSalesChartProps {
  data: InteractiveSalesChartRow[];
  title?: string;
  description?: string;
  currencyFormatter?: (value: number) => string;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const defaultCurrencyFormatter = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export function InteractiveSalesChart({
  data,
  title = "Revenue vs Expenses",
  description = "Monthly financial movement for the selected period.",
  currencyFormatter = defaultCurrencyFormatter,
}: InteractiveSalesChartProps) {
  const totals = React.useMemo(() => {
    const revenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const expenses = data.reduce((sum, item) => sum + item.expenses, 0);
    const net = revenue - expenses;
    return { revenue, expenses, net };
  }, [data]);

  return (
    <Card className="@container/card max-md:py-4!">
      <CardHeader className="max-md:px-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            className="max-sm:hidden"
            aria-label="Refresh"
          >
            <RefreshCwIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="max-sm:hidden"
            aria-label="Download"
          >
            <ArrowDownToLineIcon />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="More options"
                >
                  <MoreHorizontalIcon />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuItem>
                  <SettingsIcon />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <RefreshCwIcon />
                  Refresh Data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <ArrowDownToLineIcon />
                  Export PNG
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileJsonIcon />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2Icon />
                  Share Chart
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>

        <div className="mt-4 flex items-center gap-6">
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-sm font-medium">Revenue</p>
            <p className="text-lg leading-none font-bold sm:text-2xl">
              {currencyFormatter(totals.revenue)}
            </p>
          </div>
          <div className="bg-border h-10 w-px" />
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-sm font-medium">
              Expenses
            </p>
            <p className="text-lg leading-none font-bold sm:text-2xl">
              {currencyFormatter(totals.expenses)}
            </p>
          </div>
          <div className="bg-border h-10 w-px max-sm:hidden" />
          <div className="space-y-1.5 max-sm:hidden">
            <p className="text-muted-foreground text-sm font-medium">Net</p>
            <p className="text-lg leading-none font-bold sm:text-2xl">
              {currencyFormatter(totals.net)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-expenses)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-expenses)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={35}
              className="text-xs"
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => String(value)}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="expenses"
              type="natural"
              fill="url(#fillExpenses)"
              stroke="var(--color-expenses)"
              strokeWidth={2}
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
