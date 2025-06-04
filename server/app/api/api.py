from fastapi import APIRouter

from app.api.routes.user import router as user_router
from app.api.routes.documents import router as documents_router

api_router = APIRouter()

# Include all routes here
api_router.include_router(user_router, prefix="/users", tags=["users"])
api_router.include_router(documents_router, prefix="/documents", tags=["documents"])

# Add more routers as needed
