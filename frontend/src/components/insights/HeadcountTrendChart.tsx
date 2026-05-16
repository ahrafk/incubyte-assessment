"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { insightsApi } from "@/lib/api";
import type { HeadcountPoint } from "@/types";

export default function HeadcountTrendChart() {
  const [data, setData] = useState<HeadcountPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insightsApi
      .headcountTrend()
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Headcount Trend</h3>
      {loading ? (
        <div className="h-48 animate-pulse rounded bg-muted" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: string) => v.slice(0, 7)}
            />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              formatter={(v: number) => [v.toLocaleString(), "Hired"]}
              labelFormatter={(l: string) => l.slice(0, 7)}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(221.2 83.2% 53.3%)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
