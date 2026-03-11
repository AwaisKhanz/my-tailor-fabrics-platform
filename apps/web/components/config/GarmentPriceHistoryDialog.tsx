"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogSection } from "@/components/ui/form-layout";
import { useGarmentPriceHistory } from "@/hooks/queries/config-queries";
import { GarmentPriceLog } from "@tbms/shared-types";
import { format } from "date-fns";
import {
  History,
  User,
  ArrowRight,
  RotateCcw,
  Edit3,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FieldLabel } from "@/components/ui/field";
import { InfoTile } from "@/components/ui/info-tile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionIcon } from "@/components/ui/section-icon";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl" className="gap-0 overflow-hidden p-0">
        <DialogHeader surface="mutedSection" padding="md" trimBottom>
          <div className="flex items-center gap-3 mb-2">
            <SectionIcon
              tone="default"
              size="lg"
              framed={false}
              className="h-10 w-10"
            >
              <History className="h-5 w-5 text-primary" />
            </SectionIcon>
            <div className="flex flex-col">
              <DialogTitle className="text-2xl font-extrabold ">
                Price History
              </DialogTitle>
              <FieldLabel size="compact" tone="foreground">
                {garmentName} • Global Pricing
              </FieldLabel>
            </div>
          </div>
        </DialogHeader>

        <DialogSection className="px-6 pb-6 pt-4">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <FieldLabel className="animate-pulse">Loading timeline...</FieldLabel>
            </div>
          ) : logs.length === 0 ? (
            <InfoTile
              borderStyle="dashedStrong"
              padding="none"
              radius="xl"
              className="h-64 flex flex-col items-center justify-center gap-4 p-8 text-center"
            >
              <SectionIcon framed={false} className="h-12 w-12 rounded-full">
                <History className="h-6 w-6 text-muted-foreground" />
              </SectionIcon>
              <div className="space-y-1">
                <p className="font-bold text-foreground">No History Found</p>
                <p className="text-xs text-muted-foreground max-w-[240px]">
                  This garment hasn&apos;t had any price updates yet.
                </p>
              </div>
            </InfoTile>
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
                          <FieldLabel size="compact" className="mt-0.5">
                            {format(
                              new Date(log.createdAt),
                              "MMM d, yyyy • h:mm a",
                            )}
                          </FieldLabel>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs font-bold uppercase "
                        >
                          {log.action}
                        </Badge>
                      </div>

                      <InfoTile
                        tone="default"
                        padding="contentLg"
                        radius="xl"
                        interaction="interactive"
                        className="grid grid-cols-1 gap-4 hover:border-primary/35 hover:bg-primary/5"
                      >
                        <div className="space-y-2">
                          <FieldLabel>Retail Price</FieldLabel>
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
                      </InfoTile>

                      <div className="flex items-center gap-2 pl-1">
                        <SectionIcon
                          framed={false}
                          className="h-5 w-5 rounded-full"
                        >
                          <User className="h-3 w-3 text-muted-foreground" />
                        </SectionIcon>
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
        </DialogSection>
      </DialogContent>
    </Dialog>
  );
}
