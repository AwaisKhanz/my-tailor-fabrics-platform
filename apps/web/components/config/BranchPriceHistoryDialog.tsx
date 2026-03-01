"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { configApi } from "@/lib/api/config";
import { BranchPriceLog } from "@tbms/shared-types";
import { format } from "date-fns";
import { History, User, ArrowRight, RotateCcw, Edit3, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";


interface BranchPriceHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  garmentId: string;
  garmentName: string;
  branchId: string;
  branchName: string;
}

export function BranchPriceHistoryDialog({
  open,
  onOpenChange,
  garmentId,
  garmentName,
  branchId,
  branchName,
}: BranchPriceHistoryDialogProps) {
  const [logs, setLogs] = useState<BranchPriceLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await configApi.getBranchPriceHistory(garmentId, branchId);
      if (res.success) {
        setLogs(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  }, [garmentId, branchId]);

  useEffect(() => {
    if (open && garmentId && branchId) {
      fetchHistory();
    }
  }, [open, garmentId, branchId, fetchHistory]);

  const formatPrice = (p: number | null) => {
    if (p === null) return "Standard";
    return `Rs. ${(p / 100).toLocaleString()}`;
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
                <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                   {garmentName} • {branchName}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="p-8">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Loading timeline...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 bg-muted/30 rounded-2xl border-2 border-dashed border-border p-8 text-center">
               <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <History className="h-6 w-6 text-muted-foreground" />
               </div>
               <div className="space-y-1">
                  <p className="font-bold text-foreground">No History Found</p>
                   <p className="text-xs text-muted-foreground max-w-[240px]">This garment hasn&apos;t had any manual price overrides yet at this branch.</p>
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
                             {log.action === "UPDATE" ? "Price Override Created" : "Override Reset to Global"}
                           </p>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                             {format(new Date(log.createdAt), "MMM d, yyyy • h:mm a")}
                           </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-muted/50">
                           {log.action}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-card border border-border/60 shadow-sm transition-all group-hover:border-primary/20 group-hover:shadow-md">
                        <div className="space-y-2">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Retail Price</p>
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
                           <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tailor Rate</p>
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
