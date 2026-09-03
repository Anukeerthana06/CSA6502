"""
ingest.py
---------
Builds the FAISS vector database from documents under data/manuals,
data/sops, and data/incidents.

Pipeline:
    Document -> Text Extraction -> Chunking -> Embedding -> FAISS Index
                                                           -> metadata.json

Supports .txt files natively and .pdf files if PyPDF2 (or pypdf) is
installed. Run this script whenever you add new documents to data/.

Usage:
    python ingest.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import List, Dict, Any

import config
from utils import chunk_text


def _extract_text_from_txt(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def _extract_text_from_pdf(path: Path) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        try:
            from PyPDF2 import PdfReader  # type: ignore
        except ImportError:
            print(
                f"[ingest] Skipping '{path.name}': PDF support requires 'pypdf' "
                f"(pip install pypdf). Falling back to skipping this file."
            )
            return ""

    text_parts = []
    try:
        reader = PdfReader(str(path))
        for page in reader.pages:
            text_parts.append(page.extract_text() or "")
    except Exception as e:
        print(f"[ingest] Failed to extract text from '{path.name}': {e}")
        return ""
    return "\n".join(text_parts)


def load_documents() -> List[Dict[str, str]]:
    """Returns a list of {'filename': ..., 'text': ...} for every supported file."""
    documents = []
    source_dirs = [config.MANUALS_DIR, config.SOPS_DIR, config.INCIDENTS_DIR]

    for directory in source_dirs:
        if not directory.exists():
            continue
        for path in sorted(directory.iterdir()):
            if not path.is_file():
                continue
            suffix = path.suffix.lower()
            if suffix == ".txt":
                text = _extract_text_from_txt(path)
            elif suffix == ".pdf":
                text = _extract_text_from_pdf(path)
            else:
                continue

            if text.strip():
                documents.append({"filename": path.name, "text": text})
            else:
                print(f"[ingest] Warning: '{path.name}' produced no extractable text.")

    return documents


def build_index() -> None:
    try:
        import numpy as np
        import faiss
        from sentence_transformers import SentenceTransformer
    except ImportError as e:
        print(
            "[ingest] ERROR: Missing dependency for index building: "
            f"{e}\nInstall requirements first: pip install -r requirements.txt"
        )
        sys.exit(1)

    documents = load_documents()
    if not documents:
        print(
            "[ingest] No documents found under data/manuals, data/sops, or "
            "data/incidents. Add .txt or .pdf files and re-run."
        )
        sys.exit(1)

    print(f"[ingest] Loaded {len(documents)} document(s). Chunking...")

    all_chunks: List[str] = []
    metadata: List[Dict[str, Any]] = []

    for doc in documents:
        chunks = chunk_text(doc["text"], config.CHUNK_SIZE, config.CHUNK_OVERLAP)
        for i, chunk in enumerate(chunks):
            all_chunks.append(chunk)
            metadata.append(
                {
                    "chunk_id": i,
                    "source": doc["filename"],
                    "text": chunk,
                }
            )
        print(f"  - {doc['filename']}: {len(chunks)} chunk(s)")

    if not all_chunks:
        print("[ingest] No chunks produced from documents. Aborting.")
        sys.exit(1)

    print(f"[ingest] Total chunks: {len(all_chunks)}")
    print(f"[ingest] Loading embedding model '{config.EMBEDDING_MODEL}'...")
    try:
        model = SentenceTransformer(config.EMBEDDING_MODEL)
    except Exception as e:
        print(
            f"[ingest] ERROR: Could not load embedding model '{config.EMBEDDING_MODEL}': {e}\n"
            f"[ingest] This usually means no internet connection is available to download "
            f"the model from Hugging Face on first use, or the model name is wrong.\n"
            f"[ingest] Check your connection and try again, or pre-download the model."
        )
        sys.exit(1)

    print("[ingest] Generating embeddings...")
    try:
        embeddings = model.encode(all_chunks, show_progress_bar=True, convert_to_numpy=True)
    except Exception as e:
        print(f"[ingest] ERROR: Failed to generate embeddings: {e}")
        sys.exit(1)
    embeddings = embeddings.astype("float32")

    # Normalize so inner-product search behaves like cosine similarity.
    faiss.normalize_L2(embeddings)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)

    config.VECTOR_DB_DIR.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(config.FAISS_INDEX_PATH))

    with open(config.METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(
            {"embedding_dim": dim, "embedding_model": config.EMBEDDING_MODEL, "chunks": metadata},
            f,
            ensure_ascii=False,
            indent=2,
        )

    print(f"[ingest] FAISS index written to: {config.FAISS_INDEX_PATH}")
    print(f"[ingest] Metadata written to: {config.METADATA_PATH}")
    print("[ingest] Done. You can now run: streamlit run app.py")


if __name__ == "__main__":
    build_index()
