"use client";

import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, GitBranch } from "lucide-react";
import { type RateCard } from "@tbms/shared-types";
import { formatPKR } from "@/lib/utils";

interface RatesListProps {
  rates: (RateCard & { branch?: { code: string; name: string } | null })[];
  showBranch?: boolean;
}

export function RatesList({ rates, showBranch = true }: RatesListProps) {
  if (rates.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed border-border">
        <p className="text-sm text-muted-foreground">No rates defined yet.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden border-border/50">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider">Step</TableHead>
            {showBranch && <TableHead className="text-[10px] font-bold uppercase tracking-wider">Branch</TableHead>}
            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Rate</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Effective</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rates.map((rate) => (
            <TableRow key={rate.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-bold text-sm">
                {rate.stepKey}
              </TableCell>
              {showBranch && (
                <TableCell>
                  {rate.branchId ? (
                    <Badge variant="outline" className="text-[10px] font-bold gap-1">
                      <GitBranch className="h-2.5 w-2.5" />
                      {rate.branch?.code || 'Branch'}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] font-bold">Global</Badge>
                  )}
                </TableCell>
              )}
              <TableCell className="text-right font-black text-ready">
                {formatPKR(rate.amount)}
              </TableCell>
              <TableCell className="text-right text-[10px] text-muted-foreground whitespace-nowrap">
                <div className="flex flex-col items-end">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(rate.effectiveFrom).toLocaleDateString()}
                  </span>
                  {rate.effectiveTo && (
                    <span>until {new Date(rate.effectiveTo).toLocaleDateString()}</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
