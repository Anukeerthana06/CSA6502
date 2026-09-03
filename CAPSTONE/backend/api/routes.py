"""
FastAPI Routes for NyayaMithra
Implements Health, Chat, Drafting, Ingestion, and Document management endpoints.
"""

import os
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, status

from backend.config import (
    LEGAL_DIR,
    DOCUMENTS_DIR,
    DOC_STORE_FILE,
    OLLAMA_MODEL,
    LEGAL_DISCLAIMER,
)
from backend.models.schemas import (
    ChatRequest,
    ChatResponse,
    DraftRequest,
    DraftResponse,
    ComplaintDraftRequest,
    ComplaintDraftResponse,
    HealthResponse,
    OllamaHealthResponse,
    ChromaHealthResponse,
    DocumentListResponse,
    DocumentItem,
    IngestResponse,
    SourceItem,
)
from backend.services.ollama_service import get_ollama_service
from backend.services.drafting_service import get_drafting_service
from backend.rag.retriever import get_retriever
from backend.rag.ingest import ingest_documents
from backend.rag.loader import LegalDocumentLoader

logger = logging.getLogger("nyayamithra.api")
router = APIRouter(prefix="/api", tags=["NyayaMithra"])


@router.get("/health", response_model=HealthResponse)
async def get_overall_health():
    """
    Check NyayaMithra system health: backend, local Ollama, and ChromaDB vector store.
    """
    ollama = get_ollama_service()
    retriever = get_retriever()

    ollama_status = await ollama.check_health()
    chroma_status = retriever.check_health()

    # Document count
    loader = LegalDocumentLoader()
    discovered_files = loader.discover_legal_files(LEGAL_DIR)

    all_ok = ollama_status.get("ollama_running", False) and chroma_status.get("chroma_ready", False)

    return HealthResponse(
        status="ok" if all_ok else "warning",
        backend_running=True,
        ollama_running=ollama_status.get("ollama_running", False),
        model=OLLAMA_MODEL,
        chroma_status=chroma_status.get("status", "unknown"),
        documents_count=len(discovered_files),
        indexed_chunks=chroma_status.get("total_chunks", 0),
        message="System operational." if all_ok else "Some components need attention (see status breakdown).",
    )


@router.get("/health/ollama", response_model=OllamaHealthResponse)
async def get_ollama_health():
    """
    Inspect status of local Ollama instance and pulled models.
    """
    ollama = get_ollama_service()
    res = await ollama.check_health()
    return OllamaHealthResponse(
        status=res.get("status", "error"),
        ollama_running=res.get("ollama_running", False),
        model=res.get("model", OLLAMA_MODEL),
        available_models=res.get("available_models", []),
        message=res.get("message"),
    )


@router.get("/health/chroma", response_model=ChromaHealthResponse)
async def get_chroma_health():
    """
    Inspect status of ChromaDB vector store.
    """
    retriever = get_retriever()
    res = retriever.check_health()
    return ChromaHealthResponse(
        status=res.get("status", "error"),
        chroma_ready=res.get("chroma_ready", False),
        collection_name=res.get("collection_name", "nyayamithra_legal_docs"),
        total_chunks=res.get("total_chunks", 0),
        error=res.get("error"),
        message=res.get("message"),
    )


@router.post("/chat", response_model=ChatResponse)
async def handle_legal_chat(req: ChatRequest):
    """
    Grounded Legal Chat API.
    Retrieves statutory documents from ChromaDB and generates citation-grounded responses using local Ollama.
    """
    clean_msg = req.message.strip()
    if not clean_msg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": True, "message": "Message cannot be empty."},
        )

    retriever = get_retriever()
    ollama = get_ollama_service()

    # 1. Retrieve statutory grounding
    sources: List[SourceItem] = retriever.retrieve(clean_msg, top_k=5)
    provisions = [s.section for s in sources if s.section and s.section != "General Provisions"]

    grounded = len(sources) > 0 and (sources[0].relevance >= 0.35)

    # 2. Build Context String
    if sources:
        context_parts = []
        for idx, s in enumerate(sources):
            context_parts.append(
                f"[Source {idx+1}] Document: {s.document} | Section/Article: {s.section} | Page: {s.page or 'N/A'}\n"
                f"Excerpt: {s.excerpt}"
            )
        context_str = "\n\n".join(context_parts)
    else:
        context_str = "No specific statutory excerpts found in the uploaded documents for this query."

    # 3. System & User Prompt Construction
    system_prompt = (
        "You are NyayaMithra, a precise Indian legal information assistant. "
        "Your task is to answer legal queries regarding Indian Law accurately and responsibly. "
        "RULES FOR LEGAL SAFETY:\n"
        "1. Prioritize information from the provided RETRIEVED STATUTORY EXCERPTS.\n"
        "2. If the retrieved documents do not contain sufficient information to answer the question, state: "
        "'The available legal documents do not contain sufficient information to answer this question.' and provide general legal awareness clearly marked as general information.\n"
        "3. NEVER fabricate or invent section numbers, statutes, or judgments.\n"
        "4. Distinguish clearly between retrieved legal citations and general guidance.\n"
        f"5. Answer in the requested language: {req.language}."
    )

    user_prompt = f"""
USER LEGAL QUERY:
"{clean_msg}"

TARGET LANGUAGE:
{req.language}

RETRIEVED STATUTORY EXCERPTS:
{context_str}

Please provide:
1. A detailed legal explanation referencing the specific Sections, Acts, or Articles.
2. A simplified 'Plain Language Summary' suitable for common citizens.
"""

    gen_res = await ollama.generate(
        prompt=user_prompt,
        system=system_prompt,
        temperature=0.1,
    )

    if gen_res.get("error"):
        # Graceful fallback explanation when Ollama is unavailable
        err_msg = gen_res.get("message", "Ollama is not running.")
        if sources:
            fallback_answer = (
                f"**Legal Grounding Found ({len(sources)} sources):**\n\n"
                + "\n\n".join([f"• **{s.document}** ({s.section}):\n_{s.excerpt}_" for s in sources])
                + f"\n\n*(Note: Local Ollama LLM is currently offline ({err_msg}). Displaying direct statutory grounding from indexed ChromaDB database.)*"
            )
            return ChatResponse(
                answer=fallback_answer,
                plain_language_summary="Direct statutory citations retrieved from local database.",
                sources=sources,
                relevant_provisions=provisions,
                grounded_in_documents=True,
                disclaimer=LEGAL_DISCLAIMER,
            )
        else:
            return ChatResponse(
                answer=f"The available legal documents do not contain sufficient information to answer this question. Additionally, {err_msg}",
                plain_language_summary="Please ensure legal documents are indexed and Ollama is running.",
                sources=[],
                relevant_provisions=[],
                grounded_in_documents=False,
                disclaimer=LEGAL_DISCLAIMER,
            )

    full_output = gen_res.get("text", "")

    # Extract plain language summary if separated
    summary = ""
    if "plain language summary" in full_output.lower():
        parts = full_output.split("Plain Language Summary")
        if len(parts) > 1:
            summary = parts[1].replace(":", "").strip()

    if not summary:
        # Create a brief leading summary
        lines = [l.strip() for l in full_output.split("\n") if l.strip()]
        summary = lines[0] if lines else "Legal query addressed under applicable Indian statutory provisions."

    return ChatResponse(
        answer=full_output,
        plain_language_summary=summary,
        sources=sources,
        relevant_provisions=provisions,
        grounded_in_documents=grounded,
        disclaimer=LEGAL_DISCLAIMER,
    )


@router.post("/draft", response_model=DraftResponse)
async def handle_legal_draft(req: DraftRequest):
    """
    Generate a formal, citation-grounded Indian legal draft for 10 document types.
    """
    drafting = get_drafting_service()
    return await drafting.generate_draft(req)


@router.post("/complaint-to-draft", response_model=ComplaintDraftResponse)
async def handle_complaint_to_draft(req: ComplaintDraftRequest):
    """
    Convert unstructured natural language grievance into a structured legal complaint with facts and statutory grounds.
    """
    if not req.complaint_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": True, "message": "Complaint text cannot be empty."},
        )

    drafting = get_drafting_service()
    return await drafting.complaint_to_draft(req)


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents():
    """
    List all legal documents in repository categories and user uploads.
    """
    loader = LegalDocumentLoader()
    files = loader.discover_legal_files(LEGAL_DIR)

    retriever = get_retriever()
    is_indexed = retriever.is_ready and (retriever.collection is not None and retriever.collection.count() > 0)

    doc_items = [
        DocumentItem(
            filename=f["filename"],
            category=f["category"],
            size_bytes=f["size"],
            path=str(f["path"]),
            is_indexed=is_indexed,
        )
        for f in files
    ]

    return DocumentListResponse(
        total_documents=len(doc_items),
        documents=doc_items,
    )


@router.get("/documents/count")
async def get_documents_count():
    """
    Get rapid document count and chunk stats.
    """
    loader = LegalDocumentLoader()
    files = loader.discover_legal_files(LEGAL_DIR)
    retriever = get_retriever()
    health = retriever.check_health()

    return {
        "documents_count": len(files),
        "indexed_chunks": health.get("total_chunks", 0),
        "chroma_ready": health.get("chroma_ready", False),
    }


@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("acts"),
):
    """
    Upload a legal document (.pdf, .txt, .md, .docx) and store in legal/ or data/documents/.
    """
    allowed_exts = {".pdf", ".docx", ".txt", ".md"}
    filename = Path(file.filename).name
    ext = Path(filename).suffix.lower()

    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": True, "message": f"Unsupported file type '{ext}'. Allowed: .pdf, .docx, .txt, .md"},
        )

    # Place in appropriate legal category folder
    valid_categories = {"acts", "rules", "regulations", "notifications", "other"}
    target_category = category if category in valid_categories else "other"
    target_dir = LEGAL_DIR / target_category
    target_dir.mkdir(parents=True, exist_ok=True)

    dest_path = target_dir / filename
    try:
        content = await file.read()
        with open(dest_path, "wb") as f:
            f.write(content)

        return {
            "success": True,
            "filename": filename,
            "category": target_category,
            "size_bytes": len(content),
            "path": str(dest_path),
            "message": f"Successfully uploaded '{filename}' to legal/{target_category}/. Trigger /api/ingest to index.",
        }
    except Exception as e:
        logger.error(f"Error saving uploaded document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": True, "message": f"Failed to save document: {str(e)}"},
        )


@router.post("/ingest", response_model=IngestResponse)
async def trigger_ingest(rebuild: bool = Query(default=False)):
    """
    Trigger RAG ingestion pipeline to index all legal documents into ChromaDB.
    """
    try:
        res = ingest_documents(rebuild=rebuild)
        return IngestResponse(
            status=res["status"],
            files_found=res["files_found"],
            files_processed=res["files_processed"],
            files_skipped=res["files_skipped"],
            chunks_created=res["chunks_created"],
            errors=res["errors"],
            message=res["message"],
        )
    except Exception as e:
        logger.error(f"Ingestion trigger failed: {e}")
        return IngestResponse(
            status="error",
            files_found=0,
            files_processed=0,
            files_skipped=0,
            chunks_created=0,
            errors=[str(e)],
            message=f"Ingestion failed: {str(e)}",
        )
