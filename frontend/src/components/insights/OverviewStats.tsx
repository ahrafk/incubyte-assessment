"use client";

import { useEffect, useState } from "react";
import { Users, DollarSign, Globe, Building2 } from "lucide-react";
import type { OverviewStats } from "@/types";
import { insightsApi, formatCurrency } from "@/lib/api";
import StatCard from "./StatCard";

export default function OverviewStats() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insightsApi
      .overview()
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg border bg-muted" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const activeRate = stats.total_employees
    ? Math.round((stats.active_count / stats.total_employees) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <StatCard
        title="Total Employees"
        value={stats.total_employees.toLocaleString()}
        icon={Users}
        subtitle={`${activeRate}% active`}
      />
      <StatCard
        title="Active"
        value={stats.active_count.toLocaleString()}
        icon={Users}
      />
      <StatCard
        title="Total Payroll"
        value={formatCurrency(stats.total_payroll)}
        icon={DollarSign}
        subtitle="per year"
      />
      <StatCard
        title="Avg Salary"
        value={formatCurrency(stats.avg_salary)}
        icon={DollarSign}
      />
      <StatCard
        title="Countries"
        value={stats.countries_count}
        icon={Globe}
      />
      <StatCard
        title="Departments"
        value={stats.departments_count}
        icon={Building2}
      />
    </div>
  );
}
