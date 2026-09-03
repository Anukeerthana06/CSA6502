"""
NyayaMithra Configuration Module
Loads settings from environment variables or .env with safe local fallbacks.
"""

import os
from pathlib import Path

# Base Paths (resolve dynamically from project root)
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

LEGAL_DIR = PROJECT_ROOT / "legal"
DATA_DIR = PROJECT_ROOT / "data"
CHROMA_DIR = DATA_DIR / "chroma_db"
DOCUMENTS_DIR = DATA_DIR / "documents"
DOC_STORE_FILE = DATA_DIR / "document_store.json"

# Ensure data directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
CHROMA_DIR.mkdir(parents=True, exist_ok=True)
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)

# Load .env if present
try:
    from dotenv import load_dotenv
    env_path = PROJECT_ROOT / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        load_dotenv()
except ImportError:
    pass

# Ollama Local Settings
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "45.0"))

# RAG & Embedding Settings
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1200"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))
TOP_K_RETRIEVAL = int(os.getenv("TOP_K_RETRIEVAL", "5"))
EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "local_minilm")

# Server Settings
BACKEND_HOST = os.getenv("BACKEND_HOST", "127.0.0.1")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))

# Allowed CORS Origins
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Legal Disclaimer standard text
LEGAL_DISCLAIMER = (
    "NyayaMithra provides general legal information and AI-assisted preliminary drafting. "
    "It is not a substitute for advice from a qualified advocate or legal professional."
)
