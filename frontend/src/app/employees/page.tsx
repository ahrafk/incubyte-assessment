"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Employee, EmployeeCreate, PaginationMeta } from "@/types";
import { employeesApi, ApiError } from "@/lib/api";
import EmployeeTable from "@/components/employees/EmployeeTable";
import EmployeeDialog from "@/components/employees/EmployeeDialog";
import DeleteConfirmDialog from "@/components/employees/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

const PER_PAGE = 20;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeesApi.list({ page, per_page: PER_PAGE, search, department, status });
      setEmployees(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [page, search, department, status]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    setPage(1);
  }, [search, department, status]);

  async function handleSubmit(data: EmployeeCreate) {
    setSaving(true);
    try {
      if (editEmployee) {
        await employeesApi.update(editEmployee.id, data);
        toast.success("Employee updated");
      } else {
        await employeesApi.create(data);
        toast.success("Employee added");
      }
      setDialogOpen(false);
      setEditEmployee(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setSaving(true);
    try {
      await employeesApi.delete(deleteId);
      toast.success("Employee deleted");
      setDeleteId(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(employee: Employee) {
    setEditEmployee(employee);
    setDialogOpen(true);
  }

  function openDelete(id: string) {
    const emp = employees.find((e) => e.id === id);
    setDeleteName(emp?.full_name ?? "");
    setDeleteId(id);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search employees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Input
          className="w-40"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm w-36"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_LEAVE">On Leave</option>
        </select>
        <Button
          onClick={() => { setEditEmployee(null); setDialogOpen(true); }}
          className="ml-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
          Loading…
        </div>
      ) : (
        <EmployeeTable employees={employees} onEdit={openEdit} onDelete={openDelete} />
      )}

      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, meta.total)} of {meta.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <EmployeeDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditEmployee(null); }}
        onSubmit={handleSubmit}
        employee={editEmployee}
        loading={saving}
      />
      <DeleteConfirmDialog
        open={Boolean(deleteId)}
        employeeName={deleteName}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={saving}
      />
    </div>
  );
}
