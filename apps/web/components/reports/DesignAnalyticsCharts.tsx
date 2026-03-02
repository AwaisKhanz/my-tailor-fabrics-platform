"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DesignAnalytics, AddonAnalytics } from "@/lib/api/reports";
import { formatPKR } from "@/lib/utils";
import { PieChart, List, Banknote, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface DesignAnalyticsChartsProps {
  designs: DesignAnalytics[];
  addons: AddonAnalytics[];
  totalDesignRevenue: number;
  totalAddonRevenue: number;
}

export function DesignAnalyticsCharts({ 
  designs, 
  addons, 
  totalDesignRevenue, 
  totalAddonRevenue 
}: DesignAnalyticsChartsProps) {
  const maxCount = Math.max(...designs.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Design Popularity Bar Chart (CSS-based) */}
        <Card variant="premium" className="overflow-hidden">
          <CardHeader className="pb-2">
              <CardTitle variant="dashboard" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Design Popularity
              </CardTitle>
            <CardDescription>Breakdown of most requested design types</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {designs.length === 0 ? (
              <p className="text-sm text-muted-foreground  text-center py-8">No design data available for this period.</p>
            ) : (
              designs.map((design) => (
                <div key={design.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label variant="dashboard" className="opacity-100">{design.name}</Label>
                    <Label variant="dashboard">{design.count} items</Label>
                  </div>
                  <div className="relative h-2.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${(design.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <Label variant="dashboard" className="lowercase">revenue: {formatPKR(design.revenue)}</Label>
                    <Label variant="dashboard" className="text-ready lowercase">payout: {formatPKR(design.payout)}</Label>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Addon Breakdown */}
        <Card variant="premium">
          <CardHeader className="pb-2">
              <CardTitle variant="dashboard" className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" /> Addon Categories
              </CardTitle>
            <CardDescription>Revenue contribution from manual addons</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4">
               {addons.length === 0 ? (
                 <p className="text-sm text-muted-foreground  text-center py-8">No addon data available.</p>
               ) : (
                 addons.map((addon) => (
                   <div key={addon.type} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                           <List className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                           <Label variant="dashboard" className="opacity-100 block">{addon.type.replace('_', ' ')}</Label>
                           <Label variant="dashboard" className="block">{addon.count} occurrences</Label>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-bold">{formatPKR(addon.total)}</p>
                      </div>
                   </div>
                 ))
               )}
            </div>
            
                <div className="flex items-center gap-2">
                   <Banknote className="h-4 w-4 text-primary" />
                   <Label variant="dashboard" className="text-primary/80 opacity-100">Total Addon Value</Label>
                </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary Card */}
      <Card variant="premium" >
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="text-center space-y-1">
               <Label variant="dashboard">Design Gross</Label>
               <p className="text-3xl font-bold tracking-tight">{formatPKR(totalDesignRevenue)}</p>
               <Badge variant="outline" size="xs">Service Fees</Badge>
            </div>
            <div className="h-12 w-px bg-border hidden md:block" />
            <div className="text-center space-y-1">
               <Label variant="dashboard">Addon Gross</Label>
               <p className="text-3xl font-bold tracking-tight text-ready">{formatPKR(totalAddonRevenue)}</p>
               <Badge variant="outline" size="xs">Manual Charges</Badge>
            </div>
            <div className="h-12 w-px bg-border hidden md:block" />
            <div className="text-center space-y-1">
               <Label variant="dashboard">Combined Premium</Label>
               <p className="text-4xl font-bold tracking-tight text-primary">{formatPKR(totalDesignRevenue + totalAddonRevenue)}</p>
               <Label variant="dashboard" className="mt-1 lowercase font-semibold">+8.4% vs last period</Label>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
