"use client";

import type { Employee, EmployeeCreate } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmployeeForm from "./EmployeeForm";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeCreate) => void;
  employee?: Employee | null;
  loading?: boolean;
}

function toInitialData(emp: Employee): EmployeeCreate {
  return {
    full_name: emp.full_name,
    email: emp.email,
    job_title: emp.job_title,
    department: emp.department,
    country: emp.country,
    salary: emp.salary,
    currency: emp.currency,
    employment_type: emp.employment_type,
    status: emp.status,
    hire_date: emp.hire_date,
  };
}

export default function EmployeeDialog({ open, onClose, onSubmit, employee, loading }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add Employee"}</DialogTitle>
        </DialogHeader>
        <EmployeeForm
          initialData={employee ? toInitialData(employee) : undefined}
          onSubmit={onSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
