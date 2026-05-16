export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE";

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  salary: number;
  currency: string;
  employment_type: EmploymentType;
  status: EmployeeStatus;
  hire_date: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreate {
  full_name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  salary: number;
  currency: string;
  employment_type: EmploymentType;
  status: EmployeeStatus;
  hire_date: string;
}

export type EmployeePatch = Partial<EmployeeCreate>;

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface EmployeeListResponse {
  data: Employee[];
  meta: PaginationMeta;
  message: string;
}

export interface SingleEmployeeResponse {
  data: Employee;
  message: string;
}

// Insights types
export interface OverviewStats {
  total_employees: number;
  active_count: number;
  total_payroll: number;
  avg_salary: number;
  countries_count: number;
  departments_count: number;
}

export interface CountryStats {
  country: string | null;
  headcount: number;
  min_salary: number | null;
  max_salary: number | null;
  avg_salary: number | null;
  median_salary: number | null;
  total_payroll: number | null;
}

export interface JobTitleStats {
  country: string | null;
  job_title: string | null;
  headcount: number;
  min_salary: number | null;
  max_salary: number | null;
  avg_salary: number | null;
}

export interface SalaryBucket {
  label: string;
  count: number;
}

export interface DepartmentStat {
  department: string;
  avg_salary: number;
  headcount: number;
}

export interface TopEarner {
  id: string;
  full_name: string;
  job_title: string;
  department: string;
  country: string;
  salary: number;
  currency: string;
}

export interface HeadcountPoint {
  month: string;
  count: number;
}
