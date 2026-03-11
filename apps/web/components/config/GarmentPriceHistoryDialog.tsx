"use client";

import React, { useEffect } from "react";
import { Button } from "@tbms/ui/components/button";
import { useGarmentPriceHistory } from "@/hooks/queries/config-queries";
import { GarmentPriceLog } from "@tbms/shared-types";
import { format } from "date-fns";
import {
  History,
  User,
  ArrowRight,
  RotateCcw,
  Edit3,
} from "lucide-react";
import { Badge } from "@tbms/ui/components/badge";
import { ScrollArea } from "@tbms/ui/components/scroll-area";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";
import { LoadingState } from "@tbms/ui/components/loading-state";
import { formatPKR } from "@/lib/utils";
import { logDevError } from "@/lib/logger";

interface GarmentPriceHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  garmentId: string;
  garmentName: string;
}

export function GarmentPriceHistoryDialog({
  open,
  onOpenChange,
  garmentId,
  garmentName,
}: GarmentPriceHistoryDialogProps) {
  const garmentPriceHistoryQuery = useGarmentPriceHistory(garmentId || null);
  const logs: GarmentPriceLog[] = garmentPriceHistoryQuery.data?.success
    ? garmentPriceHistoryQuery.data.data
    : [];
  const loading = garmentPriceHistoryQuery.isLoading;

  const fetchHistory = React.useCallback(async () => {
    try {
      await garmentPriceHistoryQuery.refetch();
    } catch (error) {
      logDevError("Failed to fetch history:", error);
    }
  }, [garmentPriceHistoryQuery]);

  useEffect(() => {
    if (open && garmentId) {
      fetchHistory();
    }
  }, [open, garmentId, fetchHistory]);

  const formatPrice = (p: number | null) => {
    if (p === null) return "0.00";
    return formatPKR(p);
  };

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Price History"
      description={`${garmentName} • Global Pricing`}
      contentSize="2xl"
      maxWidthClass=""
      footerActions={
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      }
    >
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingState
                text="Loading timeline..."
                caption="Collecting garment price changes."
                className="w-full border-0 bg-transparent"
              />
            </div>
          ) : logs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
                <History className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-foreground">No History Found</p>
                <p className="text-xs text-muted-foreground max-w-[240px]">
                  This garment hasn&apos;t had any price updates yet.
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="relative space-y-8 before:absolute before:inset-0 before:left-[19px] before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-border/50 before:to-transparent">
                {logs.map((log) => (
                  <div key={log.id} className="relative pl-12">
                    {/* Dot */}
                    <div
                      className={`absolute left-0 top-1.5 z-10 flex h-10 w-10 items-center justify-center rounded-xl border-2 border-background shadow-sm ${
                        log.action === "UPDATE"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {log.action === "UPDATE" ? (
                        <Edit3 className="h-4 w-4" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-sm font-extrabold text-foreground flex items-center gap-2">
                            Price Updated
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {format(
                              new Date(log.createdAt),
                              "MMM d, yyyy • h:mm a",
                            )}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs font-bold uppercase "
                        >
                          {log.action}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 gap-4 rounded-xl bg-muted/40 p-4">
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Retail Price</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground line-through opacity-50">
                              {formatPrice(log.oldCustomerPrice)}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span
                              className={`text-sm font-extrabold ${log.action === "RESET" ? "text-muted-foreground" : "text-primary"}`}
                            >
                              {formatPrice(log.newCustomerPrice)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-1">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                          <User className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground">
                          Changed by{" "}
                          <span className="text-foreground">
                            {log.changedBy.name}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
    </ScrollableDialog>
  );
}
