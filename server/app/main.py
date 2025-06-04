from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

from app.api.api import api_router
from app.core.config import settings
from app.db.session import SessionLocal
from app.db.init_data import init_db_data

# Import models to ensure they are registered with SQLAlchemy
from app.models import models

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL), format=settings.LOG_FORMAT
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="LegalDocs AI API",
    description="AI-powered legal document management and analysis platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


# Example model
class Message(BaseModel):
    message: str


@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    logger.info("Starting LegalDocs AI API...")

    # Validate LLM configuration
    if not settings.validate_llm_config():
        logger.warning(
            "LLM configuration not found. Some features may not work properly."
        )

    # Initialize database with default data
    try:
        db = SessionLocal()
        init_db_data(db)
        db.close()
        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")

    # Create upload directories
    try:
        settings.get_upload_path()
        settings.get_chroma_path()
        logger.info("File storage directories initialized")
    except Exception as e:
        logger.error(f"Failed to create storage directories: {str(e)}")

    logger.info("LegalDocs AI API startup completed")


@app.get("/")
async def root():
    """Root endpoint returning API info"""
    return {
        "message": "Welcome to LegalDocs AI API",
        "description": "AI-powered legal document management and analysis",
        "version": "1.0.0",
        "docs_url": "/docs",
        "features": [
            "Document upload and processing",
            "AI-powered document classification",
            "Natural language document querying",
            "Intelligent document organization",
        ],
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "LegalDocs AI API",
        "version": "1.0.0",
        "llm_configured": settings.validate_llm_config(),
    }


@app.get("/api/info")
async def get_info():
    """Information about the backend stack"""
    return {
        "name": "LegalDocs AI Backend",
        "version": "1.0.0",
        "description": "AI-powered legal document management platform",
        "stack": {
            "framework": "FastAPI",
            "database": "PostgreSQL with SQLAlchemy",
            "ai": "OpenAI GPT-4 & LangChain",
            "vector_store": "ChromaDB",
            "deployment": "Docker",
        },
        "features": {
            "document_processing": "PDF, DOCX, TXT support",
            "ai_classification": "Legal document categorization",
            "natural_language_queries": "Document Q&A with AI",
            "real_time_processing": "Background document analysis",
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.LOG_LEVEL.lower(),
    )
