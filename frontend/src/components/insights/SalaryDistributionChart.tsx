"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { insightsApi } from "@/lib/api";
import type { SalaryBucket } from "@/types";

export default function SalaryDistributionChart() {
  const [data, setData] = useState<SalaryBucket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insightsApi
      .distribution()
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Salary Distribution</h3>
      {loading ? (
        <div className="h-48 animate-pulse rounded bg-muted" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              formatter={(v: number) => [v.toLocaleString(), "Employees"]}
            />
            <Bar dataKey="count" fill="hsl(221.2 83.2% 53.3%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
