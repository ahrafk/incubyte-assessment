import { formatCurrency, formatDate, getStatusColor, truncate, formatEmploymentType } from "@/lib/api";

describe("formatCurrency", () => {
  it("formats USD amounts", () => {
    expect(formatCurrency(75000)).toMatch(/\$75,000/);
  });

  it("uses provided currency", () => {
    expect(formatCurrency(50000, "EUR")).toMatch(/50,000/);
  });
});

describe("formatDate", () => {
  it("formats an ISO date string to human-readable form", () => {
    const result = formatDate("2022-03-15");
    expect(result).toMatch(/Mar/);
    expect(result).toMatch(/2022/);
  });
});

describe("getStatusColor", () => {
  it("returns green for ACTIVE", () => {
    expect(getStatusColor("ACTIVE")).toContain("green");
  });

  it("returns red for INACTIVE", () => {
    expect(getStatusColor("INACTIVE")).toContain("red");
  });

  it("returns yellow for ON_LEAVE", () => {
    expect(getStatusColor("ON_LEAVE")).toContain("yellow");
  });

  it("returns gray for unknown status", () => {
    expect(getStatusColor("UNKNOWN")).toContain("gray");
  });
});

describe("truncate", () => {
  it("does not truncate short strings", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates long strings with ellipsis", () => {
    expect(truncate("hello world", 5)).toBe("hello…");
  });
});

describe("formatEmploymentType", () => {
  it("replaces underscores with spaces", () => {
    expect(formatEmploymentType("FULL_TIME")).toBe("FULL TIME");
  });
});
