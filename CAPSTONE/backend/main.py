"""
Main FastAPI Application Entry Point for NyayaMithra
Indian Legal AI & Document Drafting System (Local First).
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import ALLOWED_ORIGINS, BACKEND_HOST, BACKEND_PORT
from backend.api.routes import router as api_router
from backend.rag.retriever import get_retriever
from backend.services.ollama_service import get_ollama_service

# Configure clean logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("nyayamithra.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Safe application lifecycle management.
    Performs non-blocking warmup checks for ChromaDB and Ollama without crashing if offline.
    """
    logger.info("Initializing NyayaMithra Legal AI System (Local-First)...")

    # Safe lazy probe of ChromaDB
    try:
        retriever = get_retriever()
        health = retriever.check_health()
        logger.info(f"Vector Store Status: {health.get('status')} ({health.get('total_chunks')} chunks indexed)")
    except Exception as e:
        logger.warning(f"ChromaDB non-fatal warmup notice: {e}")

    # Safe probe of Ollama
    try:
        ollama = get_ollama_service()
        ollama_health = await ollama.check_health()
        if ollama_health.get("ollama_running"):
            logger.info(f"Ollama connected successfully. Active Model: {ollama_health.get('model')}")
        else:
            logger.info(f"Ollama is offline or unreachable ({ollama_health.get('message')}). System is ready in fallback mode.")
    except Exception as e:
        logger.warning(f"Ollama non-fatal probe notice: {e}")

    logger.info(f"NyayaMithra API ready at http://{BACKEND_HOST}:{BACKEND_PORT}")
    yield
    logger.info("NyayaMithra shutting down.")


app = FastAPI(
    title="NyayaMithra API",
    description="Local-First Indian Legal Information & Legal-Document Drafting Assistant",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration for local frontend environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler ensuring clean JSON errors without leaking internal stack traces.
    """
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "An internal server error occurred while processing your legal request. Please verify system status.",
        },
    )


# Mount API router
app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "name": "NyayaMithra API",
        "description": "AI-powered Indian Legal Information & Legal-Document Drafting Assistant",
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=BACKEND_HOST,
        port=BACKEND_PORT,
        reload=True,
    )
