"""
Pydantic Schemas for NyayaMithra Request/Response Payloads
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class SourceItem(BaseModel):
    document: str = Field(..., description="Document or Act title")
    act: str = Field(default="", description="Act name")
    section: str = Field(default="", description="Relevant Section or Article")
    chapter: Optional[str] = Field(default=None, description="Chapter if available")
    page: Optional[int] = Field(default=None, description="Page number if available")
    relevance: float = Field(default=0.0, description="Relevance similarity score (0.0 to 1.0)")
    excerpt: str = Field(default="", description="Grounding text excerpt from the document")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Legal question or query")
    language: str = Field(default="English", description="Target response language (e.g. English, Hindi, Telugu, etc.)")


class ChatResponse(BaseModel):
    answer: str = Field(..., description="Legal answer text")
    plain_language_summary: str = Field(default="", description="Citizen-friendly simplified summary")
    sources: List[SourceItem] = Field(default_factory=list, description="Grounding source references")
    relevant_provisions: List[str] = Field(default_factory=list, description="List of relevant sections/acts")
    grounded_in_documents: bool = Field(default=True, description="Whether the answer is grounded in retrieved documents")
    disclaimer: str = Field(..., description="Standard legal disclaimer")


class DraftRequest(BaseModel):
    draft_type: str = Field(..., description="Type of legal document to draft")
    name: str = Field(..., description="Name of the applicant / complainant")
    address: str = Field(default="[INSERT ADDRESS]", description="Address of applicant")
    phone: str = Field(default="[INSERT PHONE]", description="Phone number")
    email: str = Field(default="[INSERT EMAIL]", description="Email address")
    opposite_party: str = Field(..., description="Opposite party / respondent details")
    incident_date: str = Field(default="[INSERT DATE]", description="Date of incident/cause of action")
    incident_location: str = Field(default="[INSERT LOCATION]", description="Location/Jurisdiction")
    facts: str = Field(..., description="Detailed facts of the dispute or grievance")
    relief_requested: str = Field(..., description="Specific relief, compensation, or prayer sought")
    supporting_documents: Optional[str] = Field(default="", description="Comma-separated or bulleted supporting documents")
    language: str = Field(default="English", description="Target drafting language")


class DraftResponse(BaseModel):
    title: str = Field(..., description="Formal legal document title")
    parties: str = Field(..., description="Description of Complainant and Opposite Party")
    facts: str = Field(..., description="Numbered facts of the case")
    legal_grounds: str = Field(..., description="Applicable statutory grounds and provisions")
    relevant_provisions: List[str] = Field(default_factory=list, description="Statutory sections cited")
    relief_prayer: str = Field(..., description="Prayer / Relief sought from court or authority")
    list_of_documents: List[str] = Field(default_factory=list, description="Index of supporting documents")
    declaration: str = Field(..., description="Formal legal verification/declaration statement")
    full_draft: str = Field(..., description="Complete ready-to-copy structured legal draft")
    sources: List[SourceItem] = Field(default_factory=list, description="Grounding legal documents used")
    disclaimer: str = Field(..., description="Legal disclaimer")


class ExtractedComplaintFacts(BaseModel):
    complainant: str = Field(default="[INSERT COMPLAINANT NAME]")
    opposite_party: str = Field(default="[INSERT OPPOSITE PARTY]")
    product_service: str = Field(default="[INSERT PRODUCT/SERVICE]")
    incident_date: str = Field(default="[INSERT DATE]")
    amount: str = Field(default="[INSERT AMOUNT]")
    incident_summary: str = Field(default="")
    grievance: str = Field(default="")
    requested_relief: str = Field(default="[INSERT RELIEF / REFUND]")


class ComplaintDraftRequest(BaseModel):
    complaint_text: str = Field(..., min_length=5, description="Natural language complaint text")
    language: str = Field(default="English", description="Language for resulting legal draft")


class ComplaintDraftResponse(BaseModel):
    extracted_facts: ExtractedComplaintFacts
    draft: DraftResponse
    sources: List[SourceItem] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str
    backend_running: bool
    ollama_running: bool
    model: str
    chroma_status: str
    documents_count: int
    indexed_chunks: int
    message: Optional[str] = None


class OllamaHealthResponse(BaseModel):
    status: str
    ollama_running: bool
    model: str
    available_models: List[str] = Field(default_factory=list)
    message: Optional[str] = None


class ChromaHealthResponse(BaseModel):
    status: str
    chroma_ready: bool
    collection_name: str
    total_chunks: int
    error: Optional[str] = None
    message: Optional[str] = None


class DocumentItem(BaseModel):
    filename: str
    category: str
    size_bytes: int
    path: str
    is_indexed: bool


class DocumentListResponse(BaseModel):
    total_documents: int
    documents: List[DocumentItem]


class IngestResponse(BaseModel):
    status: str
    files_found: int
    files_processed: int
    files_skipped: int
    chunks_created: int
    errors: List[str] = Field(default_factory=list)
    message: Optional[str] = None
