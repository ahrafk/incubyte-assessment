import type {
  Employee,
  EmployeeCreate,
  EmployeeListResponse,
  SingleEmployeeResponse,
  OverviewStats,
  CountryStats,
  JobTitleStats,
  SalaryBucket,
  DepartmentStat,
  TopEarner,
  HeadcountPoint,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

// Employees
export const employeesApi = {
  list(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    department?: string;
    country?: string;
    status?: string;
    employment_type?: string;
  }): Promise<EmployeeListResponse> {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params ?? {})) {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    }
    const query = qs.toString() ? `?${qs}` : "";
    return request(`/api/v1/employees${query}`);
  },

  get(id: string): Promise<SingleEmployeeResponse> {
    return request(`/api/v1/employees/${id}`);
  },

  create(payload: EmployeeCreate): Promise<SingleEmployeeResponse> {
    return request("/api/v1/employees", { method: "POST", body: JSON.stringify(payload) });
  },

  update(id: string, payload: EmployeeCreate): Promise<SingleEmployeeResponse> {
    return request(`/api/v1/employees/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },

  patch(id: string, payload: Partial<EmployeeCreate>): Promise<SingleEmployeeResponse> {
    return request(`/api/v1/employees/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
  },

  delete(id: string): Promise<{ message: string }> {
    return request(`/api/v1/employees/${id}`, { method: "DELETE" });
  },
};

// Insights
export const insightsApi = {
  overview(): Promise<{ data: OverviewStats }> {
    return request("/api/v1/insights/overview");
  },
  country(country: string): Promise<{ data: CountryStats }> {
    return request(`/api/v1/insights/country/${encodeURIComponent(country)}`);
  },
  jobTitle(country: string, jobTitle: string): Promise<{ data: JobTitleStats }> {
    const qs = new URLSearchParams({ country, job_title: jobTitle });
    return request(`/api/v1/insights/job-title?${qs}`);
  },
  distribution(): Promise<{ data: SalaryBucket[] }> {
    return request("/api/v1/insights/distribution");
  },
  departments(): Promise<{ data: DepartmentStat[] }> {
    return request("/api/v1/insights/departments");
  },
  topEarners(limit = 10): Promise<{ data: TopEarner[] }> {
    return request(`/api/v1/insights/top-earners?limit=${limit}`);
  },
  headcountTrend(): Promise<{ data: HeadcountPoint[] }> {
    return request("/api/v1/insights/headcount-trend");
  },
};

export { ApiError };

// Helpers
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "INACTIVE":
      return "bg-red-100 text-red-800";
    case "ON_LEAVE":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

export function formatEmploymentType(type: string): string {
  return type.replace(/_/g, " ");
}
