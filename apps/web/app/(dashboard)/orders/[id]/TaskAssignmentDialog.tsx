"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ordersApi } from "@/lib/api/orders";
import { TaskStatus, OrderItem, OrderItemTask } from "@tbms/shared-types";
import { TASK_STATUS_LABELS, getEffectiveTaskRate } from "@tbms/shared-constants";
import { Edit2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { formatPKR } from "@/lib/utils";

interface TaskAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderItem: OrderItem | null;
  employees: { id: string; fullName: string }[];
  onSuccess: () => void;
}

export function TaskAssignmentDialog({
  open,
  onOpenChange,
  orderItem,
  employees,
  onSuccess,
}: TaskAssignmentDialogProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<string>("");
  const { toast } = useToast();

  if (!orderItem) return null;

  const tasks = [...(orderItem.tasks || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAssign = async (taskId: string, employeeId: string) => {
    setLoadingId(taskId);
    try {
      await ordersApi.assignTask(taskId, employeeId);
      toast({ title: "Task Assigned", description: "The employee has been assigned to this step." });
      onSuccess();
    } catch {
      toast({ title: "Assignment Failed", description: "Could not assign task.", variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    setLoadingId(taskId);
    try {
      await ordersApi.updateTaskStatus(taskId, status);
      toast({ title: "Status Updated", description: "The task status was successfully changed." });
      onSuccess();
    } catch {
      toast({ title: "Update Failed", description: "Could not change task status.", variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleRateUpdate = async (taskId: string) => {
    const paisas = Math.round(parseFloat(tempRate) * 100);
    if (isNaN(paisas)) return;
    
    setLoadingId(taskId);
    try {
      await ordersApi.updateTaskRate(taskId, paisas);
      toast({ title: "Rate Updated", description: "The task rate has been overridden." });
      setEditingRateId(null);
      onSuccess();
    } catch {
      toast({ title: "Update Failed", description: "Could not update task rate.", variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  };

  const statusColors: Record<TaskStatus, "default" | "secondary" | "success" | "outline" | "destructive"> = {
    [TaskStatus.PENDING]: "outline",
    [TaskStatus.IN_PROGRESS]: "default",
    [TaskStatus.DONE]: "success",
    [TaskStatus.CANCELLED]: "destructive"
  };

  const columns: ColumnDef<OrderItemTask>[] = [
    {
      header: "Step",
      cell: (task) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{task.stepName}</span>
          <span className="text-[10px] tracking-widest text-muted-foreground font-mono uppercase">{task.stepKey}</span>
        </div>
      )
    },
    {
      header: "Assigned Employee",
      cell: (task) => (
        <div className="min-w-[180px]">
          <Select 
            disabled={loadingId === task.id}
            value={task.assignedEmployeeId || "unassigned"} 
            onValueChange={(val) => {
              if (val !== "unassigned") handleAssign(task.id, val);
            }}
          >
            <SelectTrigger className="h-8 border-border bg-background">
              <SelectValue placeholder="Assign Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>{emp.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      header: "Status",
      cell: (task) => (
        <div className="min-w-[140px]">
          <Select 
            disabled={loadingId === task.id}
            value={task.status} 
            onValueChange={(val) => handleStatusChange(task.id, val as TaskStatus)}
          >
            <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted p-0 shadow-none">
              <Badge variant={statusColors[task.status] || "outline"} className="uppercase w-full justify-center">
                {TASK_STATUS_LABELS[task.status]}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      header: "Labor Rate",
      align: "right",
      cell: (task) => {
        const currentRate = getEffectiveTaskRate(task.rateSnapshot, task.rateOverride, task.designType?.defaultRate) / 100;
        const isEditing = editingRateId === task.id;

        if (isEditing) {
          return (
            <div className="flex items-center justify-end gap-1">
              <Input 
                className="h-7 w-20 text-xs text-right" 
                type="number" 
                value={tempRate} 
                onChange={(e) => setTempRate(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRateUpdate(task.id);
                  if (e.key === 'Escape') setEditingRateId(null);
                }}
              />
              <Button size="icon" variant="ghost" className="h-7 w-7 text-success" onClick={() => handleRateUpdate(task.id)}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setEditingRateId(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        }

        return (
          <div className="flex items-center justify-end gap-2 group">
            <div className="flex flex-col items-end">
              <span className={`font-bold text-sm ${task.rateOverride ? 'text-primary' : (task.designType?.defaultRate ? 'text-primary/80' : 'text-foreground')}`}>
                {formatPKR(getEffectiveTaskRate(task.rateSnapshot, task.rateOverride, task.designType?.defaultRate))}
              </span>
              {task.rateOverride && (
                <span className="text-[9px] text-muted-foreground line-through ">
                  Base: {formatPKR(task.rateSnapshot ?? 0)}
                </span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                setEditingRateId(task.id);
                setTempRate(currentRate.toString());
              }}
            >
              <Edit2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Production Tasks: {orderItem.garmentTypeName} (Piece #{orderItem.pieceNo})</DialogTitle>
          <DialogDescription>
            Manage production steps for this specific physical piece. 
            Assignments and status are tracked independently per piece.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <DataTable 
            columns={columns} 
            data={tasks} 
            loading={loadingId !== null && tasks.every(t => t.id !== loadingId)}
            itemLabel="tasks"
            emptyMessage="No tasks found. Was the workflow enabled when this order was placed?"
          />
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
