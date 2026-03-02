"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ordersApi } from "@/lib/api/orders";
import { TaskStatus, OrderItem } from "@tbms/shared-types";
import { TASK_STATUS_LABELS } from "@tbms/shared-constants";

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

  const statusColors: Record<TaskStatus, "default" | "secondary" | "success" | "outline" | "destructive"> = {
    [TaskStatus.PENDING]: "outline",
    [TaskStatus.IN_PROGRESS]: "default",
    [TaskStatus.DONE]: "success",
    [TaskStatus.CANCELLED]: "destructive"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Production Tasks: {orderItem.garmentTypeName}</DialogTitle>
          <DialogDescription>
            Manage the step-by-step assignments and status for this specific item. 
            All tasks generated based on the active Garment Type workflow sequence.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-muted/30 border border-dashed rounded-lg">
              No tasks found. Was the workflow enabled when this order was placed?
            </div>
          ) : (
             <div className="rounded-xl border border-border overflow-hidden">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                         <tr>
                             <th className="px-4 py-3 border-b">Step</th>
                             <th className="px-4 py-3 border-b">Assigned Employee</th>
                             <th className="px-4 py-3 border-b">Status</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y">
                         {tasks.map(task => (
                             <tr key={task.id} className="bg-card">
                                 <td className="px-4 py-4">
                                     <div className="flex flex-col">
                                         <span className="font-bold text-foreground">{task.stepName}</span>
                                         <span className="text-[10px] tracking-widest text-muted-foreground font-mono uppercase">{task.stepKey}</span>
                                     </div>
                                 </td>
                                 <td className="px-4 py-4 min-w-[200px]">
                                     <Select 
                                         disabled={loadingId === task.id}
                                         value={task.assignedEmployeeId || "unassigned"} 
                                         onValueChange={(val) => {
                                             if (val !== "unassigned") handleAssign(task.id, val);
                                         }}
                                     >
                                         <SelectTrigger className="h-8">
                                             <SelectValue placeholder="Assign Employee" />
                                         </SelectTrigger>
                                         <SelectContent>
                                             <SelectItem value="unassigned">Unassigned</SelectItem>
                                             {employees.map(emp => (
                                                 <SelectItem key={emp.id} value={emp.id}>{emp.fullName}</SelectItem>
                                             ))}
                                         </SelectContent>
                                     </Select>
                                 </td>
                                 <td className="px-4 py-4 min-w-[150px]">
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
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
