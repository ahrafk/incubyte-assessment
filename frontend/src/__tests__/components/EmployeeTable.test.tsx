import { render, screen, fireEvent } from "@testing-library/react";
import type { Employee } from "@/types";
import EmployeeTable from "@/components/employees/EmployeeTable";

const makeEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  id: "abc-123",
  full_name: "Jane Smith",
  email: "jane@example.com",
  job_title: "Software Engineer",
  department: "Engineering",
  country: "United States",
  salary: 120000,
  currency: "USD",
  employment_type: "FULL_TIME",
  status: "ACTIVE",
  hire_date: "2022-03-15",
  created_at: "2022-03-15T00:00:00",
  updated_at: "2022-03-15T00:00:00",
  ...overrides,
});

describe("EmployeeTable", () => {
  const noop = () => {};

  it("renders column headers", () => {
    render(<EmployeeTable employees={[]} onEdit={noop} onDelete={noop} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Department")).toBeInTheDocument();
    expect(screen.getByText("Job Title")).toBeInTheDocument();
    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders an empty-state message when no employees", () => {
    render(<EmployeeTable employees={[]} onEdit={noop} onDelete={noop} />);
    expect(screen.getByText(/no employees found/i)).toBeInTheDocument();
  });

  it("renders employee rows", () => {
    const employees = [
      makeEmployee({ id: "1", full_name: "Alice Wong" }),
      makeEmployee({ id: "2", full_name: "Bob Kumar" }),
    ];
    render(<EmployeeTable employees={employees} onEdit={noop} onDelete={noop} />);
    expect(screen.getByText("Alice Wong")).toBeInTheDocument();
    expect(screen.getByText("Bob Kumar")).toBeInTheDocument();
  });

  it("formats salary with currency symbol", () => {
    render(<EmployeeTable employees={[makeEmployee()]} onEdit={noop} onDelete={noop} />);
    expect(screen.getByText(/\$120,000/)).toBeInTheDocument();
  });

  it("shows status badge with correct text", () => {
    render(<EmployeeTable employees={[makeEmployee({ status: "INACTIVE" })]} onEdit={noop} onDelete={noop} />);
    expect(screen.getByText("INACTIVE")).toBeInTheDocument();
  });

  it("calls onEdit with the employee when Edit is clicked", () => {
    const onEdit = jest.fn();
    render(<EmployeeTable employees={[makeEmployee()]} onEdit={onEdit} onDelete={noop} />);
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: "abc-123" }));
  });

  it("calls onDelete with the employee id when Delete is clicked", () => {
    const onDelete = jest.fn();
    render(<EmployeeTable employees={[makeEmployee()]} onEdit={noop} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith("abc-123");
  });

  it("renders hire date in a human-readable format", () => {
    render(<EmployeeTable employees={[makeEmployee()]} onEdit={noop} onDelete={noop} />);
    expect(screen.getByText(/mar/i)).toBeInTheDocument();
  });
});
