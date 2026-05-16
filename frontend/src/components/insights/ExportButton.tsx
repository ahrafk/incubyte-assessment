"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { insightsApi, formatCurrency } from "@/lib/api";

function toCsv(rows: object[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0] as Record<string, unknown>);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = String((row as Record<string, unknown>)[h] ?? "");
          return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(",")
    ),
  ];
  return lines.join("\n");
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const [overview, distribution, departments, topEarners] = await Promise.all([
        insightsApi.overview(),
        insightsApi.distribution(),
        insightsApi.departments(),
        insightsApi.topEarners(50),
      ]);

      const ovRow = {
        total_employees: overview.data.total_employees,
        active_count: overview.data.active_count,
        total_payroll: formatCurrency(overview.data.total_payroll),
        avg_salary: formatCurrency(overview.data.avg_salary),
        countries: overview.data.countries_count,
        departments: overview.data.departments_count,
      };

      const sections = [
        "=== Overview ===",
        toCsv([ovRow]),
        "",
        "=== Salary Distribution ===",
        toCsv(distribution.data),
        "",
        "=== Departments ===",
        toCsv(departments.data),
        "",
        "=== Top Earners ===",
        toCsv(
          topEarners.data.map((e) => ({
            ...e,
            salary: formatCurrency(e.salary, e.currency),
          }))
        ),
      ].join("\n");

      download(`salary-insights-${new Date().toISOString().slice(0, 10)}.csv`, sections);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Exporting…" : "Export CSV"}
    </Button>
  );
}
