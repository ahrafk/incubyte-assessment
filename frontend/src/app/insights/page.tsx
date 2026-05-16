"use client";

import OverviewStats from "@/components/insights/OverviewStats";
import CountryInsights from "@/components/insights/CountryInsights";
import SalaryDistributionChart from "@/components/insights/SalaryDistributionChart";
import HeadcountTrendChart from "@/components/insights/HeadcountTrendChart";
import DepartmentChart from "@/components/insights/DepartmentChart";
import ExportButton from "@/components/insights/ExportButton";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end">
        <ExportButton />
      </div>

      <ErrorBoundary>
        <section>
          <h2 className="mb-4 text-base font-semibold text-foreground">Overview</h2>
          <OverviewStats />
        </section>
      </ErrorBoundary>

      <ErrorBoundary>
        <section className="grid gap-6 lg:grid-cols-2">
          <SalaryDistributionChart />
          <HeadcountTrendChart />
        </section>
      </ErrorBoundary>

      <ErrorBoundary>
        <section>
          <DepartmentChart />
        </section>
      </ErrorBoundary>

      <ErrorBoundary>
        <section>
          <h2 className="mb-4 text-base font-semibold text-foreground">Country Insights</h2>
          <CountryInsights />
        </section>
      </ErrorBoundary>
    </div>
  );
}
