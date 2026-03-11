export { cn } from "@tbms/ui/lib/utils";

import { formatPKR as sharedFormatPKR } from "@tbms/shared-constants";

export { sharedFormatPKR as formatPKR };

export function formatDate(date: string | Date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
