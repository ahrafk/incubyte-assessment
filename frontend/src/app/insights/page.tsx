"use client";

import OverviewStats from "@/components/insights/OverviewStats";

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground">Overview</h2>
        <OverviewStats />
      </section>
    </div>
  );
}
