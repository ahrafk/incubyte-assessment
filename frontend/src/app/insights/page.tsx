"use client";

import OverviewStats from "@/components/insights/OverviewStats";
import CountryInsights from "@/components/insights/CountryInsights";

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground">Overview</h2>
        <OverviewStats />
      </section>

      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground">Country Insights</h2>
        <CountryInsights />
      </section>
    </div>
  );
}
