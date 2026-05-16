# Prompts Used During Development

Actual prompts typed to Claude Code (claude-sonnet-4-6) during each development session. Ordered by commit.

---

## Commit 1 — `chore(repo): initialize project structure and tooling`

> I want to build a salary management system as a technical assessment. set up the project structure — python backend with fastapi and uv as package manager, and a next.js 14 frontend with typescript and tailwind. keep them in separate folders: backend/ and frontend/ under the root. add a .gitignore that covers both. don't install anything yet, just get the skeleton right.

---

## Commit 2 — `feat(backend): add FastAPI app with health check endpoint`

> add a basic fastapi app in backend/app/main.py. just needs a health check endpoint at /health that returns status ok and the app version. use a settings class for config, read from .env with pydantic-settings. also add CORS middleware, I'll be running the frontend on localhost:3000.

---

## Commit 3 — `test(backend): add test for health check endpoint [RED → GREEN]`

> write a test for the health endpoint using httpx AsyncClient. I want to see it pass before moving on. put it in tests/ with a conftest that sets up the test client.

---

## Commit 4 — `feat(backend): setup async SQLAlchemy with SQLite`

> set up async sqlalchemy with aiosqlite for the database. I want an async engine, a session factory, and a get_session dependency for fastapi. also enable WAL mode and foreign keys via a sync engine event listener — sqlite doesn't support those as connection args. add a create_tables() function and call it on app startup.

---

## Commit 5 — `feat(frontend): initialize Next.js app with layout and navigation`

> scaffold the next.js frontend. add a dark sidebar with nav links for /employees and /insights, and a header that shows the current page title. use lucide icons. the sidebar should show icon-only on small screens and full labels on md+. wire it all into the root layout with a Toaster from sonner for notifications. also set up tailwind CSS variables for the sidebar colors (dark slate theme) and shadcn/ui — add button, input, card, dialog, alert-dialog, badge, label, select, separator, tooltip components.

---

## Commit 6 — `test(backend): add failing tests for employee model [RED]`

> before i build the employee model, write the tests first. I need tests that check: the table name is "employees", all required columns exist (id, full_name, email, job_title, department, country, salary, currency, employment_type, status, hire_date), salary has a check constraint that rejects values <= 0, and there's a composite index on country + job_title. run them — they should all fail since the model doesn't exist yet.

---

## Commit 7 — `feat(backend): add Employee SQLAlchemy model`

> implement the Employee model to make those tests pass. use String(36) for the UUID id (sqlite doesn't have a native uuid type), NUMERIC(12,2) for salary. add a CheckConstraint for salary > 0. put the indexes in __table_args__.

---

## Commit 8 — `refactor(backend): extract enums and add model constraints`

> move EmploymentType and EmployeeStatus into their own enums.py file. they should be str enums so they serialize cleanly to/from the DB. EmploymentType: FULL_TIME, PART_TIME, CONTRACT, INTERN. EmployeeStatus: ACTIVE, INACTIVE, ON_LEAVE.

---

## Commit 9 — `test(backend): add failing tests for EmployeeRepository [RED]`

> write failing tests for EmployeeRepository. cover: create(), get_by_id() returns the record, get_by_id() raises NotFoundError when missing, list() returns all records, update() changes fields, delete() removes the record, delete() raises NotFoundError when missing, searching by name returns matching rows. use an in-memory sqlite db in the fixtures, not the real one.

---

## Commit 10 — `feat(backend): implement EmployeeRepository`

> implement EmployeeRepository with create, get_by_id, list, update, delete, search methods. use sqlalchemy 2.0 select() syntax, not session.query(). search should accept optional filters for department, country, status, employment_type and a free-text search that matches full_name, email, or job_title with LIKE. also add a _apply_filters helper to keep things clean.

---

## Commit 11 — `refactor(backend): clean up repository filter logic`

> getting a TypeError: 'function' object is not subscriptable on the list method return type annotation. the issue is that having a method named `list` shadows the built-in list type in the same class scope. fix it with `from __future__ import annotations` at the top of the file — that defers annotation evaluation so it doesn't hit the collision.

---

## Commit 12 — `test(backend): add failing tests for EmployeeService [RED]`

> write failing tests for EmployeeService. needs to cover: create raises ValueError if salary <= 0, create raises ConflictError if email already exists, update raises NotFoundError if employee doesn't exist, delete raises NotFoundError if employee doesn't exist, list delegates to repo.search when a search term is given. write them against a real in-memory db, not mocked.

---

## Commit 13 — `feat(backend): implement EmployeeService`

> implement EmployeeService. it sits between the router and the repository. business rules: salary must be > 0 (raise ValueError), email must be unique on create (raise ConflictError), employee must exist for update and delete (raise NotFoundError). the service shouldn't know about HTTP — just domain errors.

---

## Commit 14 — `refactor(backend): standardize error handling across service layer`

> add NotFoundError and ConflictError to core/exceptions.py. NotFoundError should take a resource name and identifier. wire them up as exception handlers in main.py that return structured JSON: `{"error": {"code": "...", "message": "...", "details": {}}}`. NotFoundError → 404, ConflictError → 409, ValueError → 400.

---

## Commit 15 — `test(backend): add failing tests for InsightsService [RED]`

> write failing tests for InsightsService. I need tests for: get_overview returns correct counts and totals, get_country_stats returns headcount and salary stats for a country, get_salary_distribution returns the right bucket counts, get_department_breakdown returns avg salary per dept, get_top_earners returns the N highest paid, get_headcount_trend returns monthly hire counts. seed some test data in the fixtures.

---

## Commit 16 — `feat(backend): implement InsightsService with DB aggregations`

> implement InsightsService. important: all aggregations must run in SQL — no pulling rows to python and computing in memory. use sqlalchemy func.count, func.avg, func.sum etc. for the median, use LIMIT/OFFSET with total//2 instead of fetching all rows and sorting. get_headcount_trend uses func.strftime — add a comment that this is sqlite-specific and needs date_trunc for postgres.

---

## Commit 17 — `feat(backend): add simple in-memory TTL cache for insights endpoints`

> add a TTLCache class in core/cache.py. just a dict with timestamps, 60 second TTL. needs get, set, and invalidate methods. create an insights_cache singleton. use it in InsightsService.get_overview and get_country_stats since those are the most expensive queries. invalidate the cache whenever an employee is created, updated, or deleted.

---

## Commit 18 — `test(backend): add failing integration tests for employees API [RED]`

> write integration tests that go through the actual HTTP layer for the employees API. cover the full CRUD cycle: POST creates and returns 201, GET /employees returns paginated list, GET /employees/{id} returns the employee, PUT updates it, PATCH partially updates, DELETE removes it and returns 204, GET after delete returns 404. also test the search and filter query params. they should all fail since the router isn't built yet.

---

## Commit 19 — `feat(backend): implement employees router`

> implement the employees router. endpoints: POST /api/v1/employees, GET /api/v1/employees (with page, per_page, search, department, country, status, employment_type query params), GET /api/v1/employees/{id}, PUT /api/v1/employees/{id}, PATCH /api/v1/employees/{id}, DELETE /api/v1/employees/{id}. wrap all responses in {"data": ..., "message": "success"}. paginated list also includes a meta object with total, page, per_page, total_pages. call insights_cache.invalidate() on writes.

---

## Commit 20 — `test(backend): add failing integration tests for insights API [RED]`

> write failing integration tests for the insights endpoints: GET /api/v1/insights/overview, /insights/country/{country}, /insights/job-title?country=&job_title=, /insights/distribution, /insights/departments, /insights/top-earners, /insights/headcount-trend. each should return {"data": ..., "message": "success"}. seed a few employees first so the aggregations have something to work with.

---

## Commit 21 — `feat(backend): implement insights router`

> build the insights router to make those tests green. 7 endpoints matching what the tests expect. keep the router thin — just call InsightsService methods and wrap in the response envelope. top-earners should accept a limit query param (1-50, default 10).

---

## Commit 22 — `refactor(backend): clean up schemas, router, cache, and insights service`

> do a cleanup pass on what we've built. specifically: there are two identical salary validators in EmployeeCreate and EmployeePatch, extract that to a shared function. EmployeeUpdate is unused since PUT reuses EmployeeCreate — delete it. SingleEmployeeResponse and EmployeeListResponse in schemas are dead code, remove them. the median calculation in InsightsService fetches all rows then sorts in python — replace with LIMIT/OFFSET. also remove any unnecessary imports.

---

## Commit 23 — `feat(backend): add request/response schemas with Pydantic v2`

> make sure all the pydantic schemas are properly set up for v2. use model_dump() not dict(), model_validate() not from_orm(). salary validators should use @field_validator with @classmethod. EmployeeCreate and EmployeePatch should both validate salary > 0. add a single_response() helper and a paginate() helper in schemas to keep the routers clean.

---

## Commit 24 — `chore(backend): add DB indexes and verify query performance`

> add indexes to the Employee model for the query patterns we actually use: full_name, job_title, a composite on (country, job_title), status, department, hire_date. then write a verify_indexes.py script that runs EXPLAIN QUERY PLAN on those patterns against an in-memory sqlite db to confirm they're actually being used. LIKE '%term%' scans are expected — leading wildcards can't use b-tree indexes, that's fine.

---

## Commit 25 — `chore(scripts): create first_names.txt and last_names.txt`

> I need name files for the seed script. create first_names.txt and last_names.txt in backend/scripts/. want a good mix of global names — south asian, east asian, african, european, latin american, middle eastern. aim for 500+ each. one name per line.

---

## Commit 26 — `feat(scripts): implement high-performance seed script`

> write a seed script at backend/scripts/seed.py that inserts 10000 employees. requirements: use aiosqlite directly (not sqlalchemy), batch inserts of 500 rows with executemany for speed, show a tqdm progress bar, idempotent via INSERT OR IGNORE and email dedup. support --count and --clear flags. realistic salary ranges per job title (engineers higher than interns etc). should finish in under 10 seconds. use the first_names.txt and last_names.txt files for names.

---

## Commit 27 — `feat(frontend): implement app layout with sidebar navigation`

> the current sidebar is just responsive css. I want a proper collapsible one with a toggle button. add a SidebarContext that holds the collapsed state and a toggle function. sidebar shows icon-only when collapsed with a chevron button to expand. the header gets a mobile menu button that also calls toggle. use transition-all for smooth width animation.

---

## Commit 28 — `feat(frontend): add API client and shared TypeScript types`

> add src/types/index.ts with interfaces for Employee, EmployeeCreate, EmployeePatch, PaginationMeta, EmployeeListResponse, and all the insights types (OverviewStats, CountryStats, SalaryBucket etc). then add src/lib/api.ts — a typed fetch wrapper that throws an ApiError class on non-2xx. add employeesApi and insightsApi objects that cover all the endpoints. also put formatCurrency, formatDate, getStatusColor, truncate helpers in the same file since they're always used alongside api data.

---

## Commit 29 — `test(frontend): add failing tests for EmployeeTable [RED]`

> before building EmployeeTable, write the tests. I want tests for: renders all column headers, shows empty state message when no data, renders employee rows with names, formats salary with currency symbol, shows the status badge, calls onEdit with the employee when edit button is clicked, calls onDelete with the id when delete is clicked, formats hire date in human readable form. import from @/components/employees/EmployeeTable which doesn't exist yet — confirm the tests fail first.

---

## Commit 30 — `feat(frontend): implement EmployeeTable component`

> implement EmployeeTable to make those tests pass. it gets employees[], onEdit, and onDelete props. shows a proper HTML table with headers. empty state row that spans all columns. format salary with formatCurrency, dates with formatDate, status as a colored badge using getStatusColor. edit/delete buttons with aria-labels so the tests can find them.

---

## Commit 31 — `test(frontend): add failing tests for EmployeeForm [RED]`

> write failing tests for EmployeeForm component. cover: all required fields render, submit button says "Add Employee" when no initialData, says "Update Employee" when initialData is passed, pre-fills fields from initialData, shows a validation error when salary is negative, calls onSubmit with the form data on valid submit, calls onCancel when cancel is clicked. use userEvent for typing. confirm they fail before committing.

---

## Commit 32 — `feat(frontend): implement EmployeeForm with validation`

> build EmployeeForm. controlled inputs for all fields. when initialData is passed, pre-fill everything. client side validation on submit: required fields, salary must be > 0. show error messages inline below the inputs. submit button label changes based on whether we're editing. call onSubmit with the full EmployeeCreate object. the form element needs role="form" so the tests can find it.

---

## Commit 33 — `feat(frontend): implement EmployeeDialog and DeleteConfirmDialog`

> add two dialog components. EmployeeDialog wraps EmployeeForm in a shadcn Dialog modal — title changes between "Add Employee" and "Edit Employee" based on whether an employee is passed. DeleteConfirmDialog uses AlertDialog with a destructive confirm button and loading state. both close on backdrop click.

---

## Commit 34 — `feat(frontend): build employees page with pagination and filters`

> build out src/app/employees/page.tsx — the actual page with everything wired up. search input, department filter, status dropdown, Add Employee button. fetch from the api with those params. show EmployeeTable with the results. pagination controls (previous/next) when there are multiple pages. clicking edit opens EmployeeDialog with that employee pre-filled. clicking delete opens DeleteConfirmDialog. toast on success and error for all operations. invalidate and refetch after any mutation.

---

## Commit 35 — `feat(frontend): implement StatCard component`

> add a reusable StatCard component at src/components/insights/StatCard.tsx. props: title, value (string or number), optional subtitle, optional lucide icon, optional trend object with value and label. icon renders in a small rounded container with primary/10 background. trend shows green for positive, red for negative. keep it clean, no unnecessary wrapper divs.

---

## Commit 36 — `feat(frontend): implement overview stats section`

> build OverviewStats component that fetches from /api/v1/insights/overview and renders 6 StatCards: total employees, active count, total payroll, avg salary, countries, departments. show skeleton placeholders while loading (animate-pulse divs). use a 2-col grid on small screens, 3-col on md, 6-col on lg.

---

## Commit 37 — `feat(frontend): implement country insights panel`

> add a CountryInsights component with a search input. defaults to "United States". on search it fetches /insights/country/{name} and displays: country, headcount, avg/min/max/median salary, total payroll in a definition list style grid. show loading and error states. add it below the overview section in the insights page.

---

## Commit 38 — `feat(frontend): add salary charts with Recharts`

> add three charts to the insights page using recharts. 1) salary distribution bar chart using /insights/distribution data with salary bucket labels on x-axis. 2) headcount trend line chart using /insights/headcount-trend, x axis shows month. 3) department avg salary horizontal bar chart using /insights/departments, sorted by avg salary descending. all three have skeleton loading states. put distribution and trend side by side on large screens, department chart full width below.

---

## Commit 39 — `feat(frontend): add CSV export to insights page`

> add an Export CSV button on the insights page. when clicked it should fetch overview, distribution, departments, and top 50 earners in parallel with Promise.all, then format everything into a single CSV with section headers and trigger a browser download. filename should include today's date. show a loading state on the button while fetching.

---

## Commit 40 — `feat(frontend): add keyboard shortcuts`

> add a useKeyboardShortcuts hook that takes an array of {key, action, description} objects and attaches a keydown listener. important: if the event target is an input, textarea, or select, ignore it — don't want shortcuts firing while the user is typing. add useGlobalShortcuts on top of that with e → /employees, i → /insights, n → open add employee dialog. wire useGlobalShortcuts into the employees page. clean up the event listener on unmount.

---

## Commit 41 — `feat(backend): add rate limiting to API`

> add a sliding window rate limiter as fastapi middleware. tracks request timestamps per client IP in a deque, drops timestamps older than the window on each request. limit is 100 req/min from settings. return 429 with Retry-After header when exceeded. add X-RateLimit-Limit and X-RateLimit-Remaining headers to every response. use X-Forwarded-For if present for the IP. add it before CORS middleware in main.py.

---

## Commit 42 — `chore(frontend): add loading and error boundaries`

> add an ErrorBoundary class component in src/components/ui/ErrorBoundary.tsx — catches render errors and shows an error message with a "try again" button that resets state. also add a LoadingSpinner component with sm/md/lg size variants. wrap each section of the insights page in its own ErrorBoundary so one failing chart doesn't take down the whole page.

---

## Commit 43 — `chore(repo): add docker-compose for one-command local setup`

> add Dockerfiles for backend and frontend plus a docker-compose.yml. backend uses python:3.12-slim with uv. frontend uses a multi-stage build: deps install, builder runs next build, runner uses the standalone output. docker-compose: backend exposes 8000, frontend exposes 3000. frontend has depends_on with condition: service_healthy on the backend healthcheck. persist the sqlite db in a named volume mounted at /app/data.

---

## Commit 44 — `test(frontend): add remaining component and hook tests [GREEN]`

> add tests for StatCard, useKeyboardShortcuts, and the api helper functions. StatCard: title and value render, subtitle shows when provided, icon renders as svg, positive trend gets green class, negative gets red. useKeyboardShortcuts: fires action on matching key, doesn't fire on wrong key, ignores events from input elements, cleans up listener on unmount. api helpers: formatCurrency formats with symbol, formatDate shows month and year, getStatusColor returns correct color classes, truncate adds ellipsis, formatEmploymentType replaces underscores. run all tests and confirm green before committing.

---

## Commit 45 — `docs: add ARCHITECTURE.md`

> write an ARCHITECTURE.md that explains the project structure honestly — what tech is used, how the layers fit together (repository → service → router), the key design decisions like why sql-only aggregations for insights, why `from __future__ import annotations` was needed, the index strategy and how to verify it. include the directory trees for both backend and frontend. add a running locally section that covers both with and without docker.
