from pydantic_settings import BaseSettings
from typing import Optional
import os
from functools import lru_cache

# Load .env file before initializing settings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or .env file
    """

    # Core
    PROJECT_NAME: str = "LegalDocs AI API"
    API_V1_STR: str = "/api/v1"

    # Database - Primary connection string
    DATABASE_URL: Optional[str] = None

    # Database - Component parts (used if DATABASE_URL is not provided)
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[str] = None
    DB_NAME: Optional[str] = None

    # Clerk Authentication
    CLERK_JWT_ISSUER: Optional[str] = None
    CLERK_AUDIENCE: Optional[str] = None
    CLERK_SECRET_KEY: Optional[str] = None

    # LLM Configuration
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_TEMPERATURE: float = 0.1
    MAX_TOKENS: int = 4000

    # File Upload Configuration
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_FILE_TYPES: list = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
        "text/html",
        "text/markdown",
    ]

    # Vector Storage Configuration
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200

    # Processing Configuration
    ENABLE_ASYNC_PROCESSING: bool = True
    MAX_CONCURRENT_JOBS: int = 5
    JOB_TIMEOUT_SECONDS: int = 300

    # Security
    SECRET_KEY: Optional[str] = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
    ]

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "ignore",
    }

    def get_database_url(self) -> str:
        """
        Construct database URL from individual components if provided,
        otherwise return the DATABASE_URL
        """
        # If all individual DB components are present, construct the URL
        if all(
            [self.DB_USER, self.DB_PASSWORD, self.DB_HOST, self.DB_PORT, self.DB_NAME]
        ):
            return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

        # Otherwise return the configured DATABASE_URL
        return self.DATABASE_URL

    def validate_llm_config(self) -> bool:
        """Validate that LLM configuration is properly set"""
        return bool(self.OPENAI_API_KEY or self.ANTHROPIC_API_KEY)

    def get_upload_path(self) -> str:
        """Get the absolute path for file uploads"""
        upload_path = os.path.abspath(self.UPLOAD_DIR)
        os.makedirs(upload_path, exist_ok=True)
        return upload_path

    def get_chroma_path(self) -> str:
        """Get the absolute path for ChromaDB storage"""
        chroma_path = os.path.abspath(self.CHROMA_PERSIST_DIR)
        os.makedirs(chroma_path, exist_ok=True)
        return chroma_path


@lru_cache
def get_settings() -> Settings:
    """
    Get application settings as a cached singleton to avoid reloading for every request
    """
    return Settings()


# Create and export a singleton instance
settings = get_settings()
