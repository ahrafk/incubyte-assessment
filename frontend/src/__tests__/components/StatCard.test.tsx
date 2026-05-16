import { render, screen } from "@testing-library/react";
import StatCard from "@/components/insights/StatCard";
import { TrendingUp } from "lucide-react";

describe("StatCard", () => {
  it("renders title and value", () => {
    render(<StatCard title="Total Employees" value={1234} />);
    expect(screen.getByText("Total Employees")).toBeInTheDocument();
    expect(screen.getByText("1234")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<StatCard title="Payroll" value="$1M" subtitle="per year" />);
    expect(screen.getByText("per year")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<StatCard title="Stats" value={42} icon={TrendingUp} />);
    // icon renders as svg
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  it("renders positive trend with green styling", () => {
    render(<StatCard title="Growth" value={100} trend={{ value: 5, label: "vs last month" }} />);
    const trend = screen.getByText("+5%");
    expect(trend).toHaveClass("text-green-600");
  });

  it("renders negative trend with red styling", () => {
    render(<StatCard title="Churn" value={10} trend={{ value: -3, label: "vs last month" }} />);
    const trend = screen.getByText("-3%");
    expect(trend).toHaveClass("text-red-600");
  });
});
