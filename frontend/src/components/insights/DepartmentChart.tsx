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
import { insightsApi, formatCurrency } from "@/lib/api";
import type { DepartmentStat } from "@/types";

export default function DepartmentChart() {
  const [data, setData] = useState<DepartmentStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insightsApi
      .departments()
      .then((r) => setData(r.data.slice().sort((a, b) => b.avg_salary - a.avg_salary)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Avg Salary by Department</h3>
      {loading ? (
        <div className="h-64 animate-pulse rounded bg-muted" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 40, bottom: 4, left: 90 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis dataKey="department" type="category" tick={{ fontSize: 11 }} width={85} />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              formatter={(v: number) => [formatCurrency(v), "Avg Salary"]}
            />
            <Bar dataKey="avg_salary" fill="hsl(160 60% 45%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
