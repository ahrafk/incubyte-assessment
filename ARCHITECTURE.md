# Architecture

## Overview

A full-stack salary management system with a Python/FastAPI backend and a Next.js 14 frontend. SQLite is used as the database for simplicity; migrating to PostgreSQL requires only changing `DATABASE_URL` and swapping `func.strftime` for `date_trunc` in the headcount-trend query.

```
incubyte-assessment/
├── backend/          # Python 3.12 + FastAPI
└── frontend/         # Next.js 14 + TypeScript + Tailwind CSS
```

---

## Backend

### Stack

| Layer | Technology |
|-------|-----------|
| Language | Python 3.12 |
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 (async) |
| Database | SQLite via aiosqlite |
| Validation | Pydantic v2 |
| Package manager | uv |
| Testing | pytest + pytest-asyncio + httpx |

### Directory Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── cache.py          # TTL cache for insights endpoints
│   │   ├── config.py         # Pydantic settings (reads .env)
│   │   ├── exceptions.py     # NotFoundError, ConflictError
│   │   └── rate_limit.py     # Sliding-window rate limiter middleware
│   ├── models/
│   │   ├── employee.py       # SQLAlchemy Employee model + indexes
│   │   └── enums.py          # EmploymentType, EmployeeStatus
│   ├── repositories/
│   │   └── employee_repository.py  # DB access layer (CRUD + filters)
│   ├── routers/
│   │   ├── employees.py      # REST endpoints for employees
│   │   └── insights.py       # Aggregation/analytics endpoints
│   ├── schemas/
│   │   ├── employee.py       # Pydantic request/response schemas
│   │   └── insights.py       # Insights response schemas
│   ├── services/
│   │   ├── employee_service.py   # Business logic for employees
│   │   └── insights_service.py   # Aggregation queries
│   ├── database.py           # Async engine, session factory, create_tables
│   └── main.py               # App factory, middleware, exception handlers
├── scripts/
│   ├── seed.py               # High-performance seed script (10k rows <10s)
│   ├── verify_indexes.py     # EXPLAIN QUERY PLAN index verification
│   ├── first_names.txt       # 800+ global first names
│   └── last_names.txt        # 1000+ global last names
└── tests/
    ├── conftest.py            # In-memory SQLite fixtures, test client
    ├── test_employees_api.py  # CRUD endpoint tests
    └── test_insights_api.py   # Aggregation endpoint tests
```

### Request Flow

```
HTTP Request
  → RateLimitMiddleware (sliding window per IP)
  → CORSMiddleware
  → Router (FastAPI)
  → Service (business rules, cache invalidation)
  → Repository (SQLAlchemy queries)
  → SQLite (WAL mode)
```

### Key Design Decisions

- **Repository pattern**: separates data access from business logic, keeping routers thin
- **`from __future__ import annotations`**: prevents Python 3.12's `list` built-in from being shadowed when a class method is also named `list`
- **SQL aggregations only**: insights never pull rows to Python; all `COUNT`, `AVG`, `SUM`, `MIN`, `MAX` run in SQLite
- **O(1) median**: uses `LIMIT/OFFSET` with `total // 2` instead of loading all rows to sort in Python
- **TTL cache**: 60-second dict-based cache on hot insight endpoints to avoid repeated aggregations
- **Decimal salary**: stored as `NUMERIC(12,2)` to avoid float precision issues

### Indexes

```sql
CREATE INDEX ix_employees_full_name  ON employees(full_name);
CREATE INDEX ix_employees_job_title  ON employees(job_title);
CREATE INDEX ix_employees_country_jt ON employees(country, job_title);
CREATE INDEX ix_employees_status     ON employees(status);
CREATE INDEX ix_employees_department ON employees(department);
CREATE INDEX ix_employees_hire_date  ON employees(hire_date);
```

Run `uv run python scripts/verify_indexes.py` to confirm all critical query paths use indexes.

---

## Frontend

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Charts | Recharts |
| Notifications | Sonner |
| Testing | Jest + React Testing Library |

### Directory Structure

```
frontend/src/
├── app/
│   ├── employees/page.tsx    # CRUD table with pagination, filters, dialogs
│   ├── insights/page.tsx     # Charts + country lookup + CSV export
│   ├── layout.tsx            # Root layout with Sidebar + Header
│   └── globals.css           # CSS variables (sidebar theme, primary color)
├── components/
│   ├── employees/
│   │   ├── EmployeeTable.tsx       # Sortable data table
│   │   ├── EmployeeForm.tsx        # Controlled form with validation
│   │   ├── EmployeeDialog.tsx      # Modal wrapper for create/edit
│   │   └── DeleteConfirmDialog.tsx # Destructive action confirmation
│   ├── insights/
│   │   ├── StatCard.tsx            # KPI card with icon + trend
│   │   ├── OverviewStats.tsx       # 6-stat overview grid
│   │   ├── CountryInsights.tsx     # Searchable country breakdown
│   │   ├── SalaryDistributionChart.tsx  # Bucket bar chart
│   │   ├── HeadcountTrendChart.tsx      # Monthly line chart
│   │   ├── DepartmentChart.tsx          # Dept avg salary horizontal bars
│   │   └── ExportButton.tsx             # Parallel fetch + CSV download
│   ├── layout/
│   │   ├── Sidebar.tsx        # Collapsible nav with toggle button
│   │   ├── Header.tsx         # Page title + mobile menu button
│   │   └── SidebarContext.tsx # Collapse state shared via context
│   └── ui/
│       ├── ErrorBoundary.tsx  # React class boundary with retry
│       ├── LoadingSpinner.tsx # Reusable spinner (sm/md/lg)
│       └── (shadcn components)
├── hooks/
│   └── useKeyboardShortcuts.ts  # Declarative shortcut hook with input guard
├── lib/
│   ├── api.ts          # Typed fetch wrapper + helper utilities
│   └── utils.ts        # cn() (clsx + tailwind-merge)
└── types/
    └── index.ts        # Shared Employee, Insights, and Pagination types
```

### API Client

`src/lib/api.ts` exposes `employeesApi` and `insightsApi` — typed wrappers around `fetch` that throw `ApiError` on non-2xx responses. Helper functions (`formatCurrency`, `formatDate`, `getStatusColor`, `truncate`) are co-located here.

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `e` | Navigate to /employees |
| `i` | Navigate to /insights |
| `n` | Open Add Employee dialog |

Shortcuts are suppressed when focus is inside an `<input>`, `<textarea>`, or `<select>`.

---

## Running Locally

### Without Docker

```bash
# Backend
cd backend
uv sync
uv run uvicorn app.main:app --reload

# Seed data (optional)
uv run python scripts/seed.py --count 10000

# Frontend
cd frontend
npm install
npm run dev
```

### With Docker

```bash
docker compose up --build
```

Backend: http://localhost:8000 | Docs: http://localhost:8000/docs  
Frontend: http://localhost:3000

---

## Testing

```bash
# Backend (32 tests)
cd backend && uv run pytest

# Frontend (34 tests)
cd frontend && npx jest
```
