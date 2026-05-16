"use client";

import { useState } from "react";
import type { EmployeeCreate, EmploymentType, EmployeeStatus } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  initialData?: EmployeeCreate;
  onSubmit: (data: EmployeeCreate) => void;
  onCancel: () => void;
  loading?: boolean;
}

const EMPLOYMENT_TYPES: EmploymentType[] = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"];
const STATUSES: EmployeeStatus[] = ["ACTIVE", "INACTIVE", "ON_LEAVE"];

function toLabel(val: string) {
  return val.replace(/_/g, " ");
}

const DEFAULT: EmployeeCreate = {
  full_name: "",
  email: "",
  job_title: "",
  department: "",
  country: "",
  salary: 0,
  currency: "USD",
  employment_type: "FULL_TIME",
  status: "ACTIVE",
  hire_date: new Date().toISOString().split("T")[0],
};

export default function EmployeeForm({ initialData, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState<EmployeeCreate>(initialData ?? DEFAULT);
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeCreate, string>>>({});

  const isEdit = Boolean(initialData);

  function set<K extends keyof EmployeeCreate>(key: K, value: EmployeeCreate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.full_name.trim()) next.full_name = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.job_title.trim()) next.job_title = "Job title is required";
    if (!form.department.trim()) next.department = "Department is required";
    if (!form.country.trim()) next.country = "Country is required";
    if (!form.salary || form.salary <= 0) next.salary = "Salary must be positive";
    if (!form.hire_date) next.hire_date = "Hire date is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit({ ...form, salary: Number(form.salary) });
  }

  return (
    <form role="form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            placeholder="Jane Smith"
          />
          {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@example.com"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="job_title">Job Title</Label>
          <Input
            id="job_title"
            value={form.job_title}
            onChange={(e) => set("job_title", e.target.value)}
            placeholder="Software Engineer"
          />
          {errors.job_title && <p className="text-xs text-destructive">{errors.job_title}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={form.department}
            onChange={(e) => set("department", e.target.value)}
            placeholder="Engineering"
          />
          {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            placeholder="United States"
          />
          {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="salary">Salary</Label>
          <Input
            id="salary"
            type="number"
            min={1}
            value={form.salary || ""}
            onChange={(e) => set("salary", Number(e.target.value))}
            placeholder="75000"
          />
          {errors.salary && <p className="text-xs text-destructive">{errors.salary}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            value={form.currency}
            onChange={(e) => set("currency", e.target.value.toUpperCase())}
            maxLength={3}
            placeholder="USD"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="hire_date">Hire Date</Label>
          <Input
            id="hire_date"
            type="date"
            value={form.hire_date}
            onChange={(e) => set("hire_date", e.target.value)}
          />
          {errors.hire_date && <p className="text-xs text-destructive">{errors.hire_date}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="employment_type">Employment Type</Label>
          <select
            id="employment_type"
            value={form.employment_type}
            onChange={(e) => set("employment_type", e.target.value as EmploymentType)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>{toLabel(t)}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => set("status", e.target.value as EmployeeStatus)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{toLabel(s)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {isEdit ? "Update Employee" : "Add Employee"}
        </Button>
      </div>
    </form>
  );
}
