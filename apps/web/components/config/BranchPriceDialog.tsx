"use client";

import React, { useEffect, useState } from "react";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Loader2 } from "lucide-react";
import { configApi } from "@/lib/api/config";
import { GarmentType, BranchPriceOverride } from "@/types/config";
import { useToast } from "@/hooks/use-toast";

interface BranchPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  garmentType: GarmentType | null;
  onSuccess: () => void;
}

export function BranchPriceDialog({
  open,
  onOpenChange,
  garmentType,
  onSuccess,
}: BranchPriceDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [overrides, setOverrides] = useState<BranchPriceOverride[]>([]);
  
  useEffect(() => {
    let active = true;
    const fetchOverrides = async () => {
      if (!garmentType) return;
      setLoading(true);
      try {
        const response = await configApi.getBranchPrices(garmentType.id);
        if (response.success && active) {
          setOverrides(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch overrides:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (open && garmentType) {
      fetchOverrides();
    }
    return () => { active = false; };
  }, [open, garmentType]);

  const handleUpdate = async (branchId: string, customerPrice: number, employeeRate: number) => {
    if (!garmentType) return;
    try {
      await configApi.setBranchPrice(garmentType.id, { 
        customerPrice: Math.round(customerPrice * 100), 
        employeeRate: Math.round(employeeRate * 100) 
      });
      toast({ title: "Success", description: "Branch price updated" });
      onSuccess();
    } catch {
      toast({ title: "Error", description: "Failed to update branch price", variant: "destructive" });
    }
  };

  const footerActions = (
    <div className="flex justify-end w-full">
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
        Close
      </Button>
    </div>
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Branch Price Overrides: ${garmentType?.name || ''}`}
      footerActions={footerActions}
      maxWidthClass="sm:max-w-xl"
    >
      <div className="space-y-4 px-1 pb-2">
          <p className="text-sm text-muted-foreground">
            Default: Rs. {garmentType ? (garmentType.customerPrice / 100) : 0} (Cust) / Rs. {garmentType ? (garmentType.employeeRate / 100) : 0} (Emp)
          </p>

          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Customer Price</TableHead>
                  <TableHead>Employee Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overrides.map((ov) => (
                  <TableRow key={ov.id}>
                    <TableCell className="font-medium">
                      {ov.branch?.name} ({ov.branch?.code})
                    </TableCell>
                    <TableCell>
                      <Input 
                        variant="premium"
                        type="number" 
                        defaultValue={(ov.customerPrice || 0) / 100}
                        className="w-24 h-8"
                        onBlur={(e) => handleUpdate(ov.branchId, Number(e.target.value), (ov.employeeRate || 0) / 100)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        variant="premium"
                        type="number" 
                        defaultValue={(ov.employeeRate || 0) / 100}
                        className="w-24 h-8"
                        onBlur={(e) => handleUpdate(ov.branchId, (ov.customerPrice || 0) / 100, Number(e.target.value))}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {overrides.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      No branch overrides defined. Use the active branch selector to add/edit.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground">
            Tip: To set a price for a specific branch, select that branch in the top bar first, then update the default price in the main table. This view shows all current overrides.
          </div>
        </div>
    </ScrollableDialog>
  );
}
