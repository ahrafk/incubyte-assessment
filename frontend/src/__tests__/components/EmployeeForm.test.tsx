import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeeForm from "@/components/employees/EmployeeForm";

describe("EmployeeForm", () => {
  const noop = () => {};

  it("renders all required fields", () => {
    render(<EmployeeForm onSubmit={noop} onCancel={noop} />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
  });

  it("shows a submit button labelled 'Add Employee' when no initial data", () => {
    render(<EmployeeForm onSubmit={noop} onCancel={noop} />);
    expect(screen.getByRole("button", { name: /add employee/i })).toBeInTheDocument();
  });

  it("shows 'Update Employee' when initial data is provided", () => {
    render(
      <EmployeeForm
        onSubmit={noop}
        onCancel={noop}
        initialData={{
          full_name: "Jane Doe",
          email: "jane@example.com",
          job_title: "Engineer",
          department: "Engineering",
          country: "USA",
          salary: 100000,
          currency: "USD",
          employment_type: "FULL_TIME",
          status: "ACTIVE",
          hire_date: "2022-01-01",
        }}
      />
    );
    expect(screen.getByRole("button", { name: /update employee/i })).toBeInTheDocument();
  });

  it("pre-fills fields with initial data", () => {
    render(
      <EmployeeForm
        onSubmit={noop}
        onCancel={noop}
        initialData={{
          full_name: "John Kim",
          email: "john@example.com",
          job_title: "Designer",
          department: "Design",
          country: "Canada",
          salary: 90000,
          currency: "USD",
          employment_type: "FULL_TIME",
          status: "ACTIVE",
          hire_date: "2021-06-01",
        }}
      />
    );
    expect(screen.getByLabelText(/full name/i)).toHaveValue("John Kim");
    expect(screen.getByLabelText(/email/i)).toHaveValue("john@example.com");
  });

  it("shows validation error when salary is negative", async () => {
    render(<EmployeeForm onSubmit={noop} onCancel={noop} />);
    const salaryInput = screen.getByLabelText(/salary/i);
    await userEvent.clear(salaryInput);
    await userEvent.type(salaryInput, "-100");
    fireEvent.submit(screen.getByRole("form"));
    await waitFor(() => {
      expect(screen.getByText(/salary must be positive/i)).toBeInTheDocument();
    });
  });

  it("calls onSubmit with form values when valid data is entered", async () => {
    const onSubmit = jest.fn();
    render(<EmployeeForm onSubmit={onSubmit} onCancel={noop} />);
    await userEvent.type(screen.getByLabelText(/full name/i), "Alice Green");
    await userEvent.type(screen.getByLabelText(/email/i), "alice@example.com");
    await userEvent.type(screen.getByLabelText(/job title/i), "Engineer");
    await userEvent.type(screen.getByLabelText(/department/i), "Engineering");
    await userEvent.type(screen.getByLabelText(/country/i), "USA");
    await userEvent.clear(screen.getByLabelText(/salary/i));
    await userEvent.type(screen.getByLabelText(/salary/i), "95000");
    fireEvent.submit(screen.getByRole("form"));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ full_name: "Alice Green", salary: 95000 })
      );
    });
  });

  it("calls onCancel when Cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(<EmployeeForm onSubmit={noop} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
