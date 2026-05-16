"""
Seed the database with realistic employee data.

Usage:
    uv run python scripts/seed.py            # insert 10 000 employees
    uv run python scripts/seed.py --count 500
    uv run python scripts/seed.py --clear    # delete all rows first, then seed
"""
from __future__ import annotations

import argparse
import asyncio
import os
import random
import sys
import uuid
from datetime import date, timedelta
from pathlib import Path

# Allow importing app modules from the project root
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import aiosqlite
from tqdm import tqdm

DB_PATH = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./salary_management.db")
# Strip the SQLAlchemy prefix so aiosqlite can use it directly
_db_file = DB_PATH.replace("sqlite+aiosqlite:///", "").replace("sqlite+aiosqlite://", "")

SCRIPT_DIR = Path(__file__).parent
FIRST_NAMES = (SCRIPT_DIR / "first_names.txt").read_text().splitlines()
FIRST_NAMES = [n.strip() for n in FIRST_NAMES if n.strip()]
LAST_NAMES = (SCRIPT_DIR / "last_names.txt").read_text().splitlines()
LAST_NAMES = [n.strip() for n in LAST_NAMES if n.strip()]

DEPARTMENTS = [
    "Engineering", "Product", "Design", "Marketing", "Sales",
    "Finance", "HR", "Operations", "Legal", "Customer Success",
    "Data Science", "DevOps", "Security", "Research", "Support",
]

COUNTRIES = [
    "United States", "United Kingdom", "Germany", "France", "Canada",
    "Australia", "India", "Brazil", "Japan", "Netherlands",
    "Singapore", "Sweden", "Switzerland", "Spain", "Italy",
    "Poland", "Mexico", "South Korea", "Nigeria", "South Africa",
    "Kenya", "Ghana", "Egypt", "Argentina", "Colombia",
    "Portugal", "Denmark", "Norway", "Finland", "New Zealand",
]

# (job_title, salary_min, salary_max) — in USD
JOB_SALARY_RANGES: list[tuple[str, int, int]] = [
    ("Software Engineer",         70_000,  160_000),
    ("Senior Software Engineer",  110_000, 220_000),
    ("Staff Engineer",            160_000, 280_000),
    ("Principal Engineer",        200_000, 340_000),
    ("Engineering Manager",       150_000, 280_000),
    ("Product Manager",           90_000,  190_000),
    ("Senior Product Manager",    130_000, 240_000),
    ("UX Designer",               70_000,  140_000),
    ("Senior UX Designer",        100_000, 180_000),
    ("Data Scientist",            90_000,  190_000),
    ("Senior Data Scientist",     130_000, 240_000),
    ("Data Engineer",             85_000,  175_000),
    ("DevOps Engineer",           85_000,  170_000),
    ("Site Reliability Engineer", 100_000, 200_000),
    ("Security Engineer",         95_000,  190_000),
    ("QA Engineer",               65_000,  130_000),
    ("Marketing Manager",         75_000,  150_000),
    ("Sales Manager",             80_000,  160_000),
    ("Account Executive",         60_000,  130_000),
    ("Financial Analyst",         65_000,  120_000),
    ("HR Manager",                70_000,  130_000),
    ("HR Business Partner",       75_000,  140_000),
    ("Legal Counsel",             100_000, 200_000),
    ("Operations Manager",        75_000,  145_000),
    ("Customer Success Manager",  65_000,  125_000),
    ("Research Scientist",        90_000,  180_000),
    ("ML Engineer",               110_000, 220_000),
    ("Backend Engineer",          80_000,  165_000),
    ("Frontend Engineer",         75_000,  155_000),
    ("Full Stack Engineer",       80_000,  165_000),
    ("Intern",                    25_000,  55_000),
    ("Technical Writer",          60_000,  110_000),
    ("Solutions Architect",       130_000, 250_000),
    ("VP of Engineering",         200_000, 380_000),
    ("CTO",                       220_000, 450_000),
]

EMPLOYMENT_TYPES = ["FULL_TIME", "FULL_TIME", "FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]
STATUSES = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "INACTIVE", "ON_LEAVE"]

CURRENCIES = ["USD", "USD", "USD", "EUR", "GBP", "CAD", "AUD", "INR", "BRL", "JPY"]

_COUNTRY_CURRENCY: dict[str, str] = {
    "United States": "USD", "Canada": "CAD", "United Kingdom": "GBP",
    "Germany": "EUR", "France": "EUR", "Spain": "EUR", "Italy": "EUR",
    "Netherlands": "EUR", "Portugal": "EUR", "Sweden": "SEK",
    "Denmark": "DKK", "Norway": "NOK", "Finland": "EUR",
    "Switzerland": "CHF", "Australia": "AUD", "New Zealand": "NZD",
    "Japan": "JPY", "South Korea": "KRW", "India": "INR",
    "Brazil": "BRL", "Mexico": "MXN", "Argentina": "ARS",
    "Colombia": "COP", "Singapore": "SGD", "Poland": "PLN",
    "Nigeria": "NGN", "South Africa": "ZAR", "Kenya": "KES",
    "Ghana": "GHS", "Egypt": "EGP",
}

_START = date(2015, 1, 1)
_TODAY = date.today()
_SPAN = (_TODAY - _START).days


def _random_hire_date() -> str:
    return (_START + timedelta(days=random.randint(0, _SPAN))).isoformat()


def _make_row(used_emails: set[str]) -> tuple:
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    full_name = f"{first} {last}"

    base_email = f"{first.lower().replace(' ', '')}.{last.lower().replace(' ', '')}@example.com"
    email = base_email
    n = 1
    while email in used_emails:
        email = f"{first.lower().replace(' ', '')}.{last.lower().replace(' ', '')}{n}@example.com"
        n += 1
    used_emails.add(email)

    job_title, sal_min, sal_max = random.choice(JOB_SALARY_RANGES)
    country = random.choice(COUNTRIES)
    emp_type = "INTERN" if "Intern" in job_title else random.choice(EMPLOYMENT_TYPES)

    return (
        str(uuid.uuid4()),
        full_name,
        email,
        job_title,
        random.choice(DEPARTMENTS),
        country,
        round(random.uniform(sal_min, sal_max), 2),
        _COUNTRY_CURRENCY.get(country, "USD"),
        emp_type,
        random.choice(STATUSES),
        _random_hire_date(),
    )


async def seed(count: int, clear: bool) -> None:
    async with aiosqlite.connect(_db_file) as db:
        await db.execute("PRAGMA journal_mode=WAL")
        await db.execute("PRAGMA foreign_keys=ON")

        if clear:
            await db.execute("DELETE FROM employees")
            await db.commit()
            print("Cleared existing employees.")

        # Collect already-used emails so we stay unique
        async with db.execute("SELECT email FROM employees") as cur:
            used_emails: set[str] = {row[0] for row in await cur.fetchall()}

        BATCH = 500
        inserted = 0

        with tqdm(total=count, unit="emp", desc="Seeding") as bar:
            while inserted < count:
                batch_size = min(BATCH, count - inserted)
                rows = [_make_row(used_emails) for _ in range(batch_size)]
                await db.executemany(
                    """INSERT OR IGNORE INTO employees
                       (id, full_name, email, job_title, department, country,
                        salary, currency, employment_type, status, hire_date)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                    rows,
                )
                await db.commit()
                inserted += batch_size
                bar.update(batch_size)

    print(f"Done — {count} employees seeded into {_db_file!r}.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed employee data")
    parser.add_argument("--count", type=int, default=10_000)
    parser.add_argument("--clear", action="store_true", help="Delete all rows before seeding")
    args = parser.parse_args()
    asyncio.run(seed(args.count, args.clear))


if __name__ == "__main__":
    main()
