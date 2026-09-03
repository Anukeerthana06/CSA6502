"""
config.py
---------
Central configuration for IndustroSense AI.

All tunables live here so the rest of the codebase never hard-codes
paths, model names, or secrets. Values are read from environment
variables (see .env.example) with safe local defaults.
"""

import os
from pathlib import Path

# ----------------------------------------------------------------------
# Optional: load a local .env file if python-dotenv is installed.
# The app must still work if .env is absent -- nothing here is mandatory.
# ----------------------------------------------------------------------
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ----------------------------------------------------------------------
# Paths
# ----------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent

DATA_DIR = BASE_DIR / "data"
MANUALS_DIR = DATA_DIR / "manuals"
SOPS_DIR = DATA_DIR / "sops"
INCIDENTS_DIR = DATA_DIR / "incidents"

VECTOR_DB_DIR = BASE_DIR / "vector_db"
FAISS_INDEX_PATH = VECTOR_DB_DIR / "faiss_index.bin"
METADATA_PATH = VECTOR_DB_DIR / "metadata.json"

LOGS_DIR = BASE_DIR / "logs"
AUDIT_LOG_PATH = LOGS_DIR / "audit_log.jsonl"

OUTPUTS_DIR = BASE_DIR / "outputs"
EVAL_CSV_PATH = OUTPUTS_DIR / "evaluation_results.csv"
EVAL_PRECISION_PLOT = OUTPUTS_DIR / "retrieval_precision.png"
EVAL_LATENCY_PLOT = OUTPUTS_DIR / "response_time.png"

EVAL_DATASET_PATH = BASE_DIR / "eval_dataset.json"

# ----------------------------------------------------------------------
# Models
# ----------------------------------------------------------------------
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "base")  # openai/whisper-base
VISION_MODEL = os.getenv("VISION_MODEL", "Salesforce/blip-image-captioning-base")

# ----------------------------------------------------------------------
# RAG / Chunking
# ----------------------------------------------------------------------
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "500"))       # characters per chunk
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "80"))  # character overlap
EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 output dimension

# ----------------------------------------------------------------------
# Authentication
# ----------------------------------------------------------------------
APP_USERNAME = os.getenv("INDUSTROSENSE_USERNAME", "engineer")
APP_PASSWORD = os.getenv("INDUSTROSENSE_PASSWORD", "change_me")

# ----------------------------------------------------------------------
# Rate limiting
# ----------------------------------------------------------------------
RATE_LIMIT_MAX_REQUESTS = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "10"))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "600"))  # 10 minutes

# ----------------------------------------------------------------------
# Input validation
# ----------------------------------------------------------------------
MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", "2000"))
MIN_TEXT_LENGTH_FOR_CONFIDENT_QUERY = 15  # below this, agent leans CLARIFY

MAX_IMAGE_SIZE_MB = int(os.getenv("MAX_IMAGE_SIZE_MB", "8"))
ALLOWED_IMAGE_TYPES = {"png", "jpg", "jpeg"}

MAX_AUDIO_SIZE_MB = int(os.getenv("MAX_AUDIO_SIZE_MB", "20"))
ALLOWED_AUDIO_TYPES = {"wav", "mp3", "m4a"}

ALLOWED_DOCUMENT_TYPES = {"pdf", "txt"}

# ----------------------------------------------------------------------
# Retrieval / evidence thresholds
# (FAISS with normalized embeddings + inner product => cosine similarity
#  roughly in [-1, 1]; higher is more similar)
# ----------------------------------------------------------------------
EVIDENCE_STRONG_THRESHOLD = 0.55
EVIDENCE_WEAK_THRESHOLD = 0.35

# ----------------------------------------------------------------------
# Misc
# ----------------------------------------------------------------------
APP_TITLE = "IndustroSense AI"
APP_SUBTITLE = "Multimodal Responsible AI Assistant for Industrial Equipment Diagnostics"

for _d in (DATA_DIR, MANUALS_DIR, SOPS_DIR, INCIDENTS_DIR, VECTOR_DB_DIR, LOGS_DIR, OUTPUTS_DIR):
    _d.mkdir(parents=True, exist_ok=True)
