# Salary Management System

A production-grade salary management system built for the Incubyte technical assessment.

## Tech Stack

- **Backend**: Python 3.12 + FastAPI + SQLAlchemy 2.0 (async) + SQLite
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- **Testing**: pytest + pytest-asyncio + httpx | Jest + React Testing Library

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- Node.js 20+
- npm

## Getting Started

### Backend

```bash
cd backend
uv sync --extra dev
uv run uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Seed the database

```bash
cd backend
uv run python scripts/seed.py
```

### Run backend tests

```bash
cd backend
uv run pytest
```

### Run frontend tests

```bash
cd frontend
npm test
```

## One-command setup (Docker)

```bash
docker compose up
```

Then visit http://localhost:3000

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions and trade-offs.
