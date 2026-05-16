# AI Prompts Log

This document records the key prompts used to build this project with Claude (claude-sonnet-4-6) via Claude Code, along with notes on the engineering intent behind each prompt category.

---

## Project Specification Prompt

The session opened with a single, highly detailed prompt that established the full project contract:

> "Build a production-grade Salary Management System for Incubyte's technical assessment.
> Follow a precise 45-commit specification. Demonstrate real engineering discipline with TDD,
> clean architecture (repository/service/router layers), and a polished UI.
> Tech stack: Python 3.12 + FastAPI + SQLAlchemy 2.0 async + SQLite / Next.js 14 + TypeScript
> + Tailwind CSS + shadcn/ui + Recharts. Package managers: uv (Python), npm (frontend).
> TDD discipline: write failing test → confirm RED → implement → confirm GREEN → commit.
> No Co-Authored-By lines. All commits authored as 'Ahraf Khatri'."

**Intent**: Establishing unambiguous constraints upfront prevents mid-session drift. Spelling out the commit authorship requirement, TDD order, and layer boundaries removed the need for correction prompts later.

---

## Architecture and Layer Prompts

### Repository Pattern
> "Use strict repository / service / router layering. Repositories handle all DB access,
> services enforce business rules, routers are thin — they only call services and return responses."

**Why**: Fat routes couple HTTP concerns to database logic. Repository + service separation makes unit testing services without HTTP scaffolding straightforward.

### `from __future__ import annotations`
Discovered during implementation that Python 3.12 raises `TypeError: 'function' object is not subscriptable` when a method named `list` exists in the same class as a `list[T]` return-type annotation. The fix — `from __future__ import annotations` — defers evaluation of all annotations to strings, sidestepping the collision.

### SQL-Only Aggregations
> "Insights must never pull rows to Python for aggregation. All COUNT, AVG, SUM, MIN, MAX
> must run as SQL. Use LIMIT/OFFSET for the median calculation."

**Why**: With 10k rows the difference is negligible, but the pattern matters at scale. SQLite can compute a median via `LIMIT 1 OFFSET n//2` in O(log n) I/O vs O(n) memory for a Python sort.

---

## TDD Prompts

Each feature cycle used two prompts:

1. **RED**: "Write failing tests for `<component>`. The component does not exist yet. Confirm tests fail before committing."
2. **GREEN**: "Implement `<component>` to make the tests pass."

This forced the assistant to actually run the tests and confirm the failure state before writing production code — a common shortcut AI assistants take when not explicitly required to verify.

---

## Performance Prompts

### Seed Script
> "Implement a seed script that inserts 10 000 employees in under 10 seconds using bulk
> executemany, batched commits of 500 rows, and aiosqlite. Idempotent via OR IGNORE and
> email deduplication. Support --count and --clear flags."

**Result**: 10k rows inserted in ~0.3 seconds using batch size 500 with `executemany`.

### Index Verification
> "Add a verify_indexes.py script that uses EXPLAIN QUERY PLAN on an in-memory SQLite DB
> to confirm every critical query pattern hits an index. LIKE '%term%' scans are acceptable
> since leading-wildcard patterns cannot use B-tree indexes."

**Why**: Writing indexes is easy; verifying they're actually used by the query planner is where most teams fail. The script acts as a regression test for the query plan.

---

## Code Review Prompts (`/simplify`)

After an initial implementation batch, `/simplify` was invoked to run three parallel review agents:

- **Code Reuse**: flagged duplicate salary validators in `EmployeeCreate` and `EmployeePatch` → extracted to `_validate_positive_salary()`
- **Code Quality**: flagged dead code (`EmployeeUpdate`, `SingleEmployeeResponse`, `EmployeeListResponse`) → removed
- **Efficiency**: flagged O(n) median (`scalars().all()` then Python sort) → replaced with SQL `LIMIT/OFFSET`

---

## Frontend Architecture Prompts

### Sidebar Context
> "The sidebar collapse state needs to be shared between Sidebar (which renders the toggle)
> and Header (which renders the mobile menu button). Use a React context."

### API Client Design
> "The API client should be a typed fetch wrapper that throws ApiError on non-2xx responses.
> Co-locate formatCurrency, formatDate, getStatusColor, and truncate helpers in the same file
> since they're always used together with API data."

### CSV Export
> "The export button should fetch overview, distribution, departments, and top-earners
> in parallel using Promise.all, then bundle them into sections in a single CSV file."

---

## Error Handling Prompts

### React Error Boundaries
> "Wrap each insights section in its own ErrorBoundary so a chart fetch error doesn't
> crash the entire page."

**Why**: Coarse error boundaries mean one failing API call takes down the whole UI. Fine-grained boundaries let the rest of the page render while showing an error only in the affected section.

### Backend Exception Mapping
> "Map NotFoundError → 404, ConflictError → 409, ValueError → 400. All error responses
> use the envelope: `{'error': {'code': '...', 'message': '...', 'details': {}}}`."

---

## Docker Prompt

> "Add a docker-compose.yml with a healthcheck on the backend before the frontend starts.
> Persist the SQLite database in a named volume. Both services build from their own Dockerfiles."

---

## Lessons Learned

1. **Specificity beats brevity in AI prompts.** Vague instructions like "add tests" produce shallow stubs. Explicit contracts ("write 8 tests covering X, Y, Z; confirm RED first") produce useful tests.

2. **Red-Green-commit discipline requires explicit enforcement.** Without a rule that commits must follow test confirmation, AI assistants will often skip the RED verification step.

3. **Catching design issues early is cheap.** The `/simplify` pass caught 8 issues in one session. The same issues found post-merge would cost 3–5× more in review and rework time.

4. **Context boundaries matter.** When the conversation context was compacted mid-session, the full project state (all 45 commits, their files, the error history) needed to be in the summary. The summary at `/home/ahraf/.claude/projects/.../20eea0b1...jsonl` captured that context and allowed seamless continuation.
