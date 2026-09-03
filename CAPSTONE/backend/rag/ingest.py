"""
Legal Document Ingestion Pipeline for NyayaMithra
Reads legal texts from legal/ category folders and indexes into ChromaDB.
CLI: python -m backend.rag.ingest [--rebuild]
"""

import sys
import json
import argparse
import logging
from pathlib import Path
from typing import Dict, Any, List

from backend.config import LEGAL_DIR, DOCUMENTS_DIR, DOC_STORE_FILE, CHROMA_DIR
from backend.rag.loader import LegalDocumentLoader
from backend.rag.chunker import LegalChunker
from backend.rag.retriever import get_retriever, LegalRetriever

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("nyayamithra.ingest")


def ingest_documents(rebuild: bool = False) -> Dict[str, Any]:
    """
    Core ingestion routine. Scans legal directories, chunks text, and inserts into ChromaDB.
    """
    logger.info("Starting NyayaMithra Legal Ingestion Pipeline...")
    retriever = get_retriever()

    if rebuild:
        logger.info("Rebuild requested: Re-initializing ChromaDB collection...")
        retriever._initialize_db(force_reset=True)

    if not retriever.is_ready or retriever.collection is None:
        return {
            "status": "error",
            "files_found": 0,
            "files_processed": 0,
            "files_skipped": 0,
            "chunks_created": 0,
            "errors": [f"ChromaDB is not ready: {retriever.last_error}"],
            "message": "ChromaDB connection failed. Please run with --rebuild.",
        }

    loader = LegalDocumentLoader()
    chunker = LegalChunker()

    files = loader.discover_legal_files(LEGAL_DIR)
    logger.info(f"Discovered {len(files)} legal documents across categories.")

    files_processed = 0
    files_skipped = 0
    total_chunks_created = 0
    errors: List[str] = []
    doc_store: List[Dict[str, Any]] = []

    all_ids: List[str] = []
    all_texts: List[str] = []
    all_metadatas: List[Dict[str, Any]] = []

    for item in files:
        file_path: Path = item["path"]
        category = item["category"]
        filename = item["filename"]

        try:
            pages = loader.load_file(file_path, category=category)
            if not pages:
                files_skipped += 1
                logger.info(f"Skipping empty or unreadable file: {filename}")
                continue

            chunks = chunker.chunk_pages(pages)
            if not chunks:
                files_skipped += 1
                continue

            for idx, c in enumerate(chunks):
                # Ensure unique id
                chunk_id = f"{filename}_{c.chunk_id}_{idx}"
                all_ids.append(chunk_id)
                all_texts.append(c.text)
                all_metadatas.append({
                    "document_name": c.document_name,
                    "act": c.act,
                    "section": c.section,
                    "chapter": c.chapter,
                    "page": c.page_number,
                    "category": c.category,
                    "filename": filename,
                })

            files_processed += 1
            total_chunks_created += len(chunks)
            doc_store.append({
                "filename": filename,
                "category": category,
                "size_bytes": item["size"],
                "path": str(file_path),
                "chunks_count": len(chunks),
                "is_indexed": True,
            })
            logger.info(f"Processed '{filename}': generated {len(chunks)} chunks.")

        except Exception as e:
            err_msg = f"Failed to ingest {filename}: {str(e)}"
            errors.append(err_msg)
            logger.error(err_msg)
            files_skipped += 1

    # Batch upsert into ChromaDB
    if all_ids:
        try:
            # Insert in batches of 100
            batch_size = 100
            for i in range(0, len(all_ids), batch_size):
                b_ids = all_ids[i : i + batch_size]
                b_texts = all_texts[i : i + batch_size]
                b_meta = all_metadatas[i : i + batch_size]

                retriever.collection.upsert(
                    ids=b_ids,
                    documents=b_texts,
                    metadatas=b_meta,
                )
            logger.info(f"Successfully upserted {len(all_ids)} vectors into ChromaDB.")
        except Exception as e:
            err_msg = f"ChromaDB batch insertion failed: {str(e)}"
            errors.append(err_msg)
            logger.error(err_msg)

    # Save metadata catalog to data/document_store.json
    try:
        DOC_STORE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(DOC_STORE_FILE, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "total_documents": len(doc_store),
                    "total_chunks": total_chunks_created,
                    "documents": doc_store,
                },
                f,
                indent=2,
            )
    except Exception as e:
        logger.warning(f"Could not write document_store.json: {e}")

    result = {
        "status": "success" if not errors else "partial_success",
        "files_found": len(files),
        "files_processed": files_processed,
        "files_skipped": files_skipped,
        "chunks_created": total_chunks_created,
        "errors": errors,
        "message": f"Ingestion completed. Processed {files_processed} files, created {total_chunks_created} indexed chunks.",
    }
    return result


def main():
    parser = argparse.ArgumentParser(description="NyayaMithra Legal Ingestion CLI")
    parser.add_argument(
        "--rebuild",
        action="store_true",
        help="Rebuild ChromaDB from scratch (fixes corrupted databases).",
    )
    args = parser.parse_args()

    result = ingest_documents(rebuild=args.rebuild)
    print("\n================ NYAYAMITHRA INGESTION SUMMARY ================")
    print(f"Status:          {result['status']}")
    print(f"Files Found:     {result['files_found']}")
    print(f"Files Processed: {result['files_processed']}")
    print(f"Files Skipped:   {result['files_skipped']}")
    print(f"Chunks Created:  {result['chunks_created']}")
    if result["errors"]:
        print(f"Errors ({len(result['errors'])}):")
        for err in result["errors"]:
            print(f"  - {err}")
    print("===============================================================\n")


if __name__ == "__main__":
    main()
