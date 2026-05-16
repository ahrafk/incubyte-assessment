"use client";

import OverviewStats from "@/components/insights/OverviewStats";
import CountryInsights from "@/components/insights/CountryInsights";
import SalaryDistributionChart from "@/components/insights/SalaryDistributionChart";
import HeadcountTrendChart from "@/components/insights/HeadcountTrendChart";
import DepartmentChart from "@/components/insights/DepartmentChart";

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground">Overview</h2>
        <OverviewStats />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <SalaryDistributionChart />
        <HeadcountTrendChart />
      </section>

      <section>
        <DepartmentChart />
      </section>

      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground">Country Insights</h2>
        <CountryInsights />
      </section>
    </div>
  );
}
