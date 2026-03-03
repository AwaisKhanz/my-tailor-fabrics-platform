"use client";

import React from "react";
import { type AddonAnalytics, type DesignAnalytics } from "@tbms/shared-types";
import { ReportsAddonCategoriesCard } from "@/components/reports/reports-addon-categories-card";
import { ReportsDesignPopularityCard } from "@/components/reports/reports-design-popularity-card";
import { ReportsFinancialSummaryCard } from "@/components/reports/reports-financial-summary-card";

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
  totalAddonRevenue,
}: DesignAnalyticsChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReportsDesignPopularityCard designs={designs} />
        <ReportsAddonCategoriesCard
          addons={addons}
          totalAddonRevenue={totalAddonRevenue}
        />
      </div>

      <ReportsFinancialSummaryCard
        totalDesignRevenue={totalDesignRevenue}
        totalAddonRevenue={totalAddonRevenue}
      />
    </div>
  );
}
