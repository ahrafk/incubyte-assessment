from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Salary Management API"
    app_version: str = "0.1.0"
    debug: bool = False
    database_url: str = "sqlite+aiosqlite:///./salary_management.db"
    cors_origins: list[str] = ["http://localhost:3000"]
    rate_limit_per_minute: int = 100


settings = Settings()
