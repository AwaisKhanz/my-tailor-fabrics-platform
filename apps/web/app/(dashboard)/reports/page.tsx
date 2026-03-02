"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileDown, FileText, Printer, Calendar, BarChart3 } from "lucide-react";
import { reportsApi, ReportSummary } from "@/lib/api/reports";
import { paymentsApi } from "@/lib/api/payments";
import { Skeleton } from "@/components/ui/skeleton";
import { DesignAnalyticsCharts } from "@/components/reports/DesignAnalyticsCharts";

export default function ReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getSummary(dateRange.from, dateRange.to);
      if (res.success) {
        setSummary(res.data);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load analytics data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [dateRange.from, dateRange.to, toast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = async (type: string, format: "pdf" | "excel") => {
    try {
      toast({ title: `Generating ${type} ${format.toUpperCase()}...` });
      
      const blob = await reportsApi.exportReport(type, format, dateRange.from, dateRange.to);
      
      const url = window.URL.createObjectURL(blob);
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

  const handleWeeklyPrint = async () => {
    try {
      toast({ title: "Generating Print View..." });
      
      const blob = await paymentsApi.getWeeklyReportPdf();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'weekly_production_summary.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast({ title: "Print Failed", description: "Failed to generate the print view.", variant: "destructive" });
    }
  };

  return (
    <div className=" space-y-8 max-w-9xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">Analytics & Intelligence</h1>
          <p className="text-muted-foreground mt-1">Global business performance and design popularity insights.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="font-bold border-primary/20 hover:bg-primary/5 text-primary" onClick={fetchAnalytics}>
              Refresh Feed
           </Button>
        </div>
      </div>

      <Card variant="premium">
        <CardHeader className="pb-4">
          <CardTitle variant="dashboard" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Reports Timeframe
          </CardTitle>
          <CardDescription className="text-xs">Adjust dates to recalculate metrics across the entire dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-6">
          <div className="space-y-2 flex-1">
            <Label variant="dashboard">Start Date</Label>
            <Input variant="premium" type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="h-11 font-bold" />
          </div>
          <div className="space-y-2 flex-1">
            <Label variant="dashboard">End Date</Label>
            <Input type="date" variant="premium" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="h-11 font-bold" />
          </div>
        </CardContent>
      </Card>

      {/* Analytics Visualization Section */}
      <div className="space-y-6">
         <div className="flex items-center gap-3 px-1">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
               <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Live Insights Breakdown</h1>
         </div>

         {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[300px] rounded-3xl" />
              <Skeleton className="h-[300px] rounded-3xl" />
           </div>
         ) : summary ? (
           <DesignAnalyticsCharts 
              designs={summary.designs} 
              addons={summary.addons}
              totalDesignRevenue={summary.totalDesignRevenue}
              totalAddonRevenue={summary.totalAddonRevenue}
           />
         ) : null}
      </div>

      <div className="space-y-6 mt-12">
        <div className="flex items-center gap-3 px-1">
            <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
               <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Document Exports</h1>
         </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Orders Report */}
          <Card variant="premium">
            <CardHeader>
              <CardTitle variant="dashboard">Order Ledger</CardTitle>
              <CardDescription className="text-[11px] leading-relaxed">Financial summary of bookings, balances and fulfilment.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 font-bold" onClick={() => handleExport('orders', 'excel')}>
                <FileDown className="mr-2 h-3 w-3" /> Excel
              </Button>
              <Button variant="outline" size="sm" className="flex-1 font-bold" onClick={() => handleExport('orders', 'pdf')}>
                <FileText className="mr-2 h-3 w-3" /> PDF
              </Button>
            </CardContent>
          </Card>

          {/* Payments Report */}
          <Card variant="premium">
            <CardHeader>
              <CardTitle variant="dashboard">Employee Payroll</CardTitle>
              <CardDescription className="text-[11px] leading-relaxed">Karigar earning summaries and historical disbursement data.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 font-bold" onClick={() => handleExport('payments', 'excel')}>
                <FileDown className="mr-2 h-3 w-3" /> Excel
              </Button>
              <Button variant="outline" size="sm" className="flex-1 font-bold" onClick={() => handleExport('payments', 'pdf')}>
                <FileText className="mr-2 h-3 w-3" /> PDF
              </Button>
            </CardContent>
          </Card>

          {/* Expenses Report */}
          <Card variant="premium">
            <CardHeader>
              <CardTitle variant="dashboard">Expense Audit</CardTitle>
              <CardDescription className="text-[11px] leading-relaxed">Overhead and miscellaneous business spending logs.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 font-bold" onClick={() => handleExport('expenses', 'excel')}>
                <FileDown className="mr-2 h-3 w-3" /> Excel
              </Button>
              <Button variant="outline" size="sm" className="flex-1 font-bold" onClick={() => handleExport('expenses', 'pdf')}>
                <FileText className="mr-2 h-3 w-3" /> PDF
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Print Summary */}
        <Card variant="premium">
          <CardHeader>
            <CardTitle variant="dashboard" className="flex items-center justify-between">
              Production Work-Order Summary <Printer className="h-4 w-4 text-primary" />
            </CardTitle>
            <CardDescription className="text-xs ">Optimized for physical printing – used for shift-based task management.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="premium" className="w-full" size="lg" onClick={handleWeeklyPrint}>
              <FileText className="mr-2 h-4 w-4" /> Generate Print View
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
