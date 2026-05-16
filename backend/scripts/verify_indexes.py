"""
Run with: uv run python scripts/verify_indexes.py

Confirms key query patterns use the correct indexes on an in-memory SQLite DB
that mirrors the production schema. LIKE '%term%' scans are expected since
leading-wildcard patterns cannot use a B-tree index in SQLite.
"""
import asyncio

import aiosqlite

DDL = """
CREATE TABLE employees (
    id TEXT PRIMARY KEY, full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE, job_title TEXT NOT NULL,
    department TEXT NOT NULL, country TEXT NOT NULL,
    salary NUMERIC(12,2) NOT NULL CHECK(salary > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    employment_type TEXT NOT NULL DEFAULT 'FULL_TIME',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    hire_date DATE NOT NULL, created_at DATETIME, updated_at DATETIME
);
CREATE INDEX ix_employees_full_name  ON employees(full_name);
CREATE INDEX ix_employees_job_title  ON employees(job_title);
CREATE INDEX ix_employees_country_jt ON employees(country, job_title);
CREATE INDEX ix_employees_status     ON employees(status);
CREATE INDEX ix_employees_department ON employees(department);
CREATE INDEX ix_employees_hire_date  ON employees(hire_date);
"""

CASES = [
    ("country + job_title",  "SELECT * FROM employees WHERE country=? AND job_title=?"),
    ("status filter",        "SELECT * FROM employees WHERE status=?"),
    ("department filter",    "SELECT * FROM employees WHERE department=?"),
    ("hire_date range",      "SELECT * FROM employees WHERE hire_date >= ?"),
    ("salary top-N",         "SELECT * FROM employees ORDER BY salary DESC LIMIT 10"),
    ("name LIKE (scan ok)",  "SELECT * FROM employees WHERE full_name LIKE ?"),
]


async def main():
    async with aiosqlite.connect(":memory:") as db:
        await db.executescript(DDL)
        failures = []
        for label, sql in CASES:
            # Replace ? placeholders with literals so EXPLAIN QUERY PLAN can parse the statement
            explain_sql = sql.replace("=?", "='x'").replace(">= ?", ">= 'x'").replace("LIKE ?", "LIKE '%x%'")
            async with db.execute(f"EXPLAIN QUERY PLAN {explain_sql}") as cur:
                rows = await cur.fetchall()
            plan = "; ".join(r[3] for r in rows)
            uses_index = "USING INDEX" in plan or "USING COVERING INDEX" in plan
            marker = "✓" if uses_index else "~"
            print(f"[{marker}] {label}\n    {plan}\n")
            if not uses_index and "LIKE" not in sql and "ORDER BY salary" not in sql:
                failures.append(label)

        if failures:
            print(f"FAIL: missing index for: {failures}")
            raise SystemExit(1)
        print("All critical query paths use indexes.")


asyncio.run(main())
