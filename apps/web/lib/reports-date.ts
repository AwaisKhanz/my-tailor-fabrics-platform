import type { TrendGranularity } from "@tbms/shared-types";

export type ReportDatePreset = "7d" | "30d" | "90d" | "mtd" | "qtd" | "ytd" | "custom";

export interface DateRangeValue {
  from: string;
  to: string;
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function atStartOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function atEndOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function getPresetRange(
  preset: Exclude<ReportDatePreset, "custom">,
  now = new Date(),
): DateRangeValue {
  const today = atStartOfDay(now);
  let from = new Date(today);

  switch (preset) {
    case "7d": {
      from.setDate(today.getDate() - 6);
      break;
    }
    case "30d": {
      from.setDate(today.getDate() - 29);
      break;
    }
    case "90d": {
      from.setDate(today.getDate() - 89);
      break;
    }
    case "mtd": {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    }
    case "qtd": {
      const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
      from = new Date(today.getFullYear(), quarterStartMonth, 1);
      break;
    }
    case "ytd": {
      from = new Date(today.getFullYear(), 0, 1);
      break;
    }
  }

  return {
    from: formatDateInput(from),
    to: formatDateInput(today),
  };
}

export function sanitizeRange(range: DateRangeValue): DateRangeValue {
  const fromDate = atStartOfDay(new Date(range.from));
  const toDate = atEndOfDay(new Date(range.to));

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return range;
  }

  if (fromDate.getTime() <= toDate.getTime()) {
    return range;
  }

  return {
    from: formatDateInput(toDate),
    to: formatDateInput(fromDate),
  };
}

export function getRangeDays(range: DateRangeValue): number {
  const fromDate = atStartOfDay(new Date(range.from));
  const toDate = atEndOfDay(new Date(range.to));

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return 30;
  }

  const diff = toDate.getTime() - fromDate.getTime();
  return Math.max(1, Math.floor(diff / (24 * 60 * 60 * 1000)) + 1);
}

export function resolveGranularityByRange(range: DateRangeValue): TrendGranularity {
  const days = getRangeDays(range);

  if (days <= 45) {
    return "day";
  }

  if (days <= 180) {
    return "week";
  }

  return "month";
}

export function getDefaultReportRange(now = new Date()): DateRangeValue {
  return getPresetRange("30d", now);
}

export function formatPresetLabel(preset: ReportDatePreset): string {
  switch (preset) {
    case "7d":
      return "7D";
    case "30d":
      return "30D";
    case "90d":
      return "90D";
    case "mtd":
      return "MTD";
    case "qtd":
      return "QTD";
    case "ytd":
      return "YTD";
    case "custom":
      return "Custom";
  }
}
