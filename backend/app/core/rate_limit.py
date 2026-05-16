"""
Sliding-window rate limiter middleware.

Tracks request timestamps per client IP in a deque. Requests older
than the window are dropped on each check, keeping memory bounded.
"""
from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, *, requests_per_minute: int | None = None, window_seconds: int = 60) -> None:
        super().__init__(app)
        self._limit = requests_per_minute or settings.rate_limit_per_minute
        self._window = window_seconds
        self._store: dict[str, deque[float]] = defaultdict(deque)

    def _client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def dispatch(self, request: Request, call_next) -> Response:
        ip = self._client_ip(request)
        now = time.monotonic()
        window_start = now - self._window
        bucket = self._store[ip]

        # Drop timestamps outside the window
        while bucket and bucket[0] < window_start:
            bucket.popleft()

        if len(bucket) >= self._limit:
            return JSONResponse(
                status_code=429,
                content={
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": f"Too many requests — limit is {self._limit} per minute.",
                        "details": {},
                    }
                },
                headers={"Retry-After": str(self._window)},
            )

        bucket.append(now)
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self._limit)
        response.headers["X-RateLimit-Remaining"] = str(self._limit - len(bucket))
        return response
