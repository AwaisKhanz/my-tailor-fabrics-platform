"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileDown, FileText, Printer, Calendar } from "lucide-react";
import { api } from "@/lib/api";

export default function ReportsPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const handleExport = async (type: string, format: "pdf" | "excel") => {
    try {
      toast({ title: `Generating ${type} ${format.toUpperCase()}...` });
      
      const endpoint = `/reports/${type}?format=${format}&from=${dateRange.from}&to=${dateRange.to}`;
      const response = await api.get(endpoint, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${dateRange.from}_to_${dateRange.to}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast({ title: "Export Failed", description: "Failed to generate the report. Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className=" space-y-6 max-w-9xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-muted-foreground">Export business data to PDF or Excel for offline analysis.</p>
      </div>

      <Card variant="premium">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Global Date Range
          </CardTitle>
          <CardDescription>Select the period for all reports below.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-6">
          <div className="space-y-1.5 flex-1">
            <Label>From Date</Label>
            <Input variant="premium" type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />
          </div>
          <div className="space-y-1.5 flex-1">
            <Label>To Date</Label>
            <Input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orders Report */}
        <Card variant="premium">
          <CardHeader>
            <CardTitle className="text-lg">Orders Report</CardTitle>
            <CardDescription>Full list of orders with status, customer, and totals.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => handleExport('orders', 'excel')}>
              <FileDown className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => handleExport('orders', 'pdf')}>
              <FileText className="mr-2 h-4 w-4" /> PDF
            </Button>
          </CardContent>
        </Card>

        {/* Payments Report */}
        <Card variant="premium">
          <CardHeader>
            <CardTitle className="text-lg">Payments Report</CardTitle>
            <CardDescription>Employee disbursement history and weekly breakdowns.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => handleExport('payments', 'excel')}>
              <FileDown className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => handleExport('payments', 'pdf')}>
              <FileText className="mr-2 h-4 w-4" /> PDF
            </Button>
          </CardContent>
        </Card>

        {/* Expenses Report */}
        <Card variant="premium">
          <CardHeader>
            <CardTitle className="text-lg">Expenses Report</CardTitle>
            <CardDescription>Overhead costs categorized by business needs.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => handleExport('expenses', 'excel')}>
              <FileDown className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => handleExport('expenses', 'pdf')}>
              <FileText className="mr-2 h-4 w-4" /> PDF
            </Button>
          </CardContent>
        </Card>

        {/* Weekly Print Summary */}
        <Card variant="premium" className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Weekly Print Summary <Printer className="h-4 w-4 text-primary" />
            </CardTitle>
            <CardDescription>Printable sheet for current week&apos;s hand-overs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.print()}>
              <FileText className="mr-2 h-4 w-4" /> Generate Print View
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
