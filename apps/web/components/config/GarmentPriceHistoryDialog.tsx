"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { configApi } from "@/lib/api/config";
import { GarmentPriceLog } from "@tbms/shared-types";
import { format } from "date-fns";
import { History, User, ArrowRight, RotateCcw, Edit3, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [logs, setLogs] = useState<GarmentPriceLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await configApi.getGarmentPriceHistory(garmentId);
      if (res.success) {
        setLogs(res.data);
      }
    } catch (error) {
      logDevError("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  }, [garmentId]);

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
      <DialogContent className="max-w-2xl border-none shadow-2xl overflow-hidden p-0 bg-background">
        <DialogHeader className="p-8 pb-0">
          <div className="flex items-center gap-3 mb-2">
             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <History className="h-5 w-5 text-primary" />
             </div>
             <div className="flex flex-col">
                <DialogTitle className="text-2xl font-extrabold tracking-tight">Price History</DialogTitle>
                 <Label variant="dashboard" className="opacity-100 text-foreground text-xs">{garmentName} • Global Pricing</Label>
             </div>
          </div>
        </DialogHeader>

        <div className="p-8">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <Label variant="dashboard" className="animate-pulse">Loading timeline...</Label>
            </div>
          ) : logs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 bg-muted/30 rounded-2xl border-2 border-dashed border-border p-8 text-center">
               <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <History className="h-6 w-6 text-muted-foreground" />
               </div>
               <div className="space-y-1">
                  <p className="font-bold text-foreground">No History Found</p>
                   <p className="text-xs text-muted-foreground max-w-[240px]">This garment hasn&apos;t had any price updates yet.</p>
               </div>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="relative space-y-8 before:absolute before:inset-0 before:left-[19px] before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-border/50 before:to-transparent">
                {logs.map((log) => (
                  <div key={log.id} className="relative pl-12">
                    {/* Dot */}
                    <div className={`absolute left-0 top-1.5 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg border-2 border-background z-10 ${
                      log.action === "UPDATE" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {log.action === "UPDATE" ? <Edit3 className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                    </div>

                    <div className="flex flex-col gap-3 group">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                           <p className="text-sm font-extrabold text-foreground flex items-center gap-2">
                             Price Updated
                           </p>
                           <Label variant="dashboard" className="opacity-100 text-[10px] mt-0.5">
                             {format(new Date(log.createdAt), "MMM d, yyyy • h:mm a")}
                           </Label>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-muted/50">
                           {log.action}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-card border border-border/60 shadow-sm transition-all group-hover:border-primary/20 group-hover:shadow-md">
                        <div className="space-y-2">
                           <Label variant="dashboard">Retail Price</Label>
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground line-through opacity-50">
                                 {formatPrice(log.oldCustomerPrice)}
                              </span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className={`text-sm font-extrabold ${log.action === 'RESET' ? 'text-muted-foreground' : 'text-primary'}`}>
                                 {formatPrice(log.newCustomerPrice)}
                              </span>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <Label variant="dashboard">Tailor Rate</Label>
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground line-through opacity-50">
                                 {formatPrice(log.oldEmployeeRate)}
                              </span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className={`text-sm font-extrabold ${log.action === 'RESET' ? 'text-muted-foreground' : 'text-foreground'}`}>
                                 {formatPrice(log.newEmployeeRate)}
                              </span>
                           </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-1">
                         <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-3 w-3 text-muted-foreground" />
                         </div>
                         <p className="text-xs font-bold text-muted-foreground">
                            Changed by <span className="text-foreground">{log.changedBy.name}</span>
                         </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
