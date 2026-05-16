import time
from collections.abc import Callable
from typing import Any


class TTLCache:
    def __init__(self, ttl_seconds: int = 60):
        self._store: dict[str, tuple[Any, float]] = {}
        self._ttl = ttl_seconds

    def get(self, key: str) -> Any | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        value, expires_at = entry
        if time.monotonic() > expires_at:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: Any) -> None:
        self._store[key] = (value, time.monotonic() + self._ttl)

    def invalidate(self) -> None:
        self._store.clear()


insights_cache = TTLCache(ttl_seconds=60)
