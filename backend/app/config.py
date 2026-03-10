from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./studio.db"
    STORAGE_DIR: str = ""
    DEBUG: bool = True
    # Comma-separated list of allowed CORS origins; "*" means all origins (MVP default)
    CORS_ORIGINS: str = "*"

    @property
    def storage_path(self) -> Path:
        if self.STORAGE_DIR:
            return Path(self.STORAGE_DIR)
        # Default: backend/storage/ relative to this file's grandparent
        return Path(__file__).parent.parent / "storage"

    class Config:
        env_file = ".env"


settings = Settings()
