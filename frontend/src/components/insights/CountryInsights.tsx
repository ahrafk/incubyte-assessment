"use client";

import { useEffect, useState } from "react";
import { insightsApi, formatCurrency } from "@/lib/api";
import type { CountryStats } from "@/types";

export default function CountryInsights() {
  const [country, setCountry] = useState("United States");
  const [input, setInput] = useState("United States");
  const [stats, setStats] = useState<CountryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fetchStats(c: string) {
    setLoading(true);
    setError(null);
    insightsApi
      .country(c)
      .then((r) => setStats(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchStats(country);
  }, [country]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) setCountry(input.trim());
  }

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Country Breakdown</h3>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          className="flex-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter country…"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && stats && (
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm md:grid-cols-3">
          <Stat label="Country" value={stats.country ?? country} />
          <Stat label="Headcount" value={stats.headcount.toLocaleString()} />
          <Stat label="Avg Salary" value={stats.avg_salary != null ? formatCurrency(stats.avg_salary) : "—"} />
          <Stat label="Min Salary" value={stats.min_salary != null ? formatCurrency(stats.min_salary) : "—"} />
          <Stat label="Max Salary" value={stats.max_salary != null ? formatCurrency(stats.max_salary) : "—"} />
          <Stat label="Median Salary" value={stats.median_salary != null ? formatCurrency(stats.median_salary) : "—"} />
          <Stat label="Total Payroll" value={stats.total_payroll != null ? formatCurrency(stats.total_payroll) : "—"} />
        </dl>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
