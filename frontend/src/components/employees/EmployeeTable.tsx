import type { Employee } from "@/types";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

const COLUMNS = ["Name", "Department", "Job Title", "Country", "Salary", "Status", "Hire Date", "Actions"];

export default function EmployeeTable({ employees, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {COLUMNS.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left font-medium text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="py-12 text-center text-muted-foreground">
                No employees found
              </td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr key={emp.id} className="border-b transition-colors hover:bg-muted/30 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{emp.full_name}</div>
                  <div className="text-xs text-muted-foreground">{emp.email}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{emp.department}</td>
                <td className="px-4 py-3 text-muted-foreground">{emp.job_title}</td>
                <td className="px-4 py-3 text-muted-foreground">{emp.country}</td>
                <td className="px-4 py-3 font-medium">
                  {formatCurrency(emp.salary, emp.currency)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      getStatusColor(emp.status)
                    )}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(emp.hire_date)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(emp)}
                      aria-label="edit"
                      className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(emp.id)}
                      aria-label="delete"
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
