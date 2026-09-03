"""
Legal Drafting Service for NyayaMithra
Produces structured, citation-grounded Indian legal documents and complaint extraction.
"""

import re
import json
import logging
from typing import Dict, Any, List, Optional

from backend.config import LEGAL_DISCLAIMER
from backend.models.schemas import (
    DraftRequest,
    DraftResponse,
    ComplaintDraftRequest,
    ComplaintDraftResponse,
    ExtractedComplaintFacts,
    SourceItem,
)
from backend.services.ollama_service import get_ollama_service
from backend.rag.retriever import get_retriever

logger = logging.getLogger("nyayamithra.drafting")


class DraftingService:
    def __init__(self):
        self.ollama = get_ollama_service()
        self.retriever = get_retriever()

    def _get_relevant_statutes_for_type(self, draft_type: str) -> List[str]:
        """Map common legal document types to relevant Indian statutes."""
        mapping = {
            "Consumer Complaint": ["Consumer Protection Act, 2019 (Section 35 / Section 2(7) / Section 84)"],
            "Legal Complaint": ["Code of Civil Procedure, 1908", "Specific Relief Act, 1963"],
            "Police Complaint": ["Bharatiya Nagarik Suraksha Sanhita, 2023 (Section 173 / Section 175)", "Indian Penal Code / BNS, 2023"],
            "Legal Notice": ["Section 80 of Code of Civil Procedure, 1908 / Section 138 NI Act"],
            "RTI Application": ["Right to Information Act, 2005 (Section 6(1))"],
            "Rental Dispute Complaint": ["Rent Control Act / Model Tenancy Act, 2021", "Transfer of Property Act, 1882"],
            "Employment Complaint": ["Industrial Disputes Act, 1947", "Payment of Wages Act, 1936", "Equal Remuneration Act"],
            "Cyber Crime Complaint": ["Information Technology Act, 2000 (Section 43, 66, 66C, 66D)", "Bharatiya Nyaya Sanhita, 2023"],
            "Motor Vehicle Accident Complaint": ["Motor Vehicles Act, 1988 (Section 166)", "Motor Vehicles (Amendment) Act, 2019"],
            "General Petition": ["Article 226/32 of Constitution of India", "Civil/Administrative Representation Guidelines"],
        }
        return mapping.get(draft_type, ["Relevant Indian Statutory Laws"])

    async def generate_draft(self, req: DraftRequest) -> DraftResponse:
        """
        Generate a comprehensive, structured legal draft using RAG context and Ollama.
        """
        # 1. Retrieve statutory grounding
        retrieval_query = f"{req.draft_type} {req.facts} {req.relief_requested}"
        sources = self.retriever.retrieve(retrieval_query, top_k=3)
        statutory_hints = self._get_relevant_statutes_for_type(req.draft_type)

        sources_context = "\n".join([f"- {s.document} ({s.section}): {s.excerpt}" for s in sources])

        # 2. Construct Prompt for Ollama
        system_prompt = (
            "You are NyayaMithra, an expert Indian legal drafting assistant. "
            "Draft formal, professionally structured Indian legal documents in accordance with Indian procedural law. "
            "Do NOT hallucinate facts, dates, or party details not provided. "
            "Use standard legal uppercase headings: TITLE, PARTIES, FACTS, LEGAL GROUNDS, RELEVANT PROVISIONS, RELIEF/PRAYER, LIST OF DOCUMENTS, DECLARATION. "
            "If any critical detail is missing, write [INSERT <DETAIL>]."
        )

        user_prompt = f"""
Draft a formal Indian legal document of type: {req.draft_type}

APPLICANT/COMPLAINANT DETAILS:
Name: {req.name}
Address: {req.address}
Phone: {req.phone}
Email: {req.email}

OPPOSITE PARTY / RESPONDENT:
{req.opposite_party}

INCIDENT PARTICULARS:
Date of Cause of Action: {req.incident_date}
Location / Jurisdiction: {req.incident_location}

FACTS OF THE MATTER:
{req.facts}

PRAYER / RELIEF SOUGHT:
{req.relief_requested}

SUPPORTING DOCUMENTS:
{req.supporting_documents or 'Purchase invoices, correspondence, proof of transaction'}

TARGET LANGUAGE:
{req.language}

STATUTORY REFERENCES FROM REPOSITORY:
{sources_context or ', '.join(statutory_hints)}

Generate a complete, professionally formatted legal draft.
"""

        # Generate from Ollama
        gen_result = await self.ollama.generate(
            prompt=user_prompt,
            system=system_prompt,
            temperature=0.15,
        )

        if gen_result.get("error"):
            # Safe rule-based template generation when Ollama is offline/starting
            logger.info("Ollama unavailable for draft generation. Using structured fallback generator.")
            return self._build_deterministic_draft(req, sources, statutory_hints)

        raw_text = gen_result.get("text", "")
        return self._parse_draft_text(raw_text, req, sources, statutory_hints)

    def extract_complaint_facts_heuristic(self, text: str) -> ExtractedComplaintFacts:
        """
        Rule-based NLP entity extractor from unstructured complaint text.
        """
        # Complainant
        name_match = re.search(r"(?:i\s+am|my\s+name\s+is|myself)\s+([A-Za-z\s]+?)(?:,|\.|\bwho\b|\band\b)", text, re.IGNORECASE)
        complainant = name_match.group(1).strip().title() if name_match else "[INSERT COMPLAINANT NAME]"

        # Opposite party
        opp_match = re.search(r"(?:from|against|to|seller|dealer|company)\s+([A-Za-z0-9\s&]+?)(?:on|dated|for|in|at|\.|\,)", text, re.IGNORECASE)
        opposite_party = opp_match.group(1).strip() if opp_match else "[INSERT OPPOSITE PARTY]"

        # Amount
        amount_match = re.search(r"(?:₹|rs\.?|inr|rupees)\s*([0-9,]+(?:\.[0-9]{2})?)", text, re.IGNORECASE)
        amount = f"₹{amount_match.group(1)}" if amount_match else "[INSERT AMOUNT]"

        # Date
        date_match = re.search(r"\b([0-9]{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+[0-9]{4})\b", text, re.IGNORECASE)
        if not date_match:
            date_match = re.search(r"\b([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})\b", text)
        incident_date = date_match.group(1) if date_match else "[INSERT DATE]"

        # Product / Service
        prod_match = re.search(r"(?:purchased|bought|ordered|availed|service of|hired)\s+(?:a|an|the)?\s*([A-Za-z0-9\s]+?)(?:for|on|from|worth|\.|\,)", text, re.IGNORECASE)
        product_service = prod_match.group(1).strip().title() if prod_match else "[INSERT PRODUCT / SERVICE]"

        # Relief
        relief_match = re.search(r"(?:i\s+want|seeking|request|praying\s+for|demand)\s+([^\.]+)", text, re.IGNORECASE)
        requested_relief = relief_match.group(1).strip() if relief_match else "Full refund along with appropriate statutory compensation and litigation costs."

        return ExtractedComplaintFacts(
            complainant=complainant,
            opposite_party=opposite_party,
            product_service=product_service,
            incident_date=incident_date,
            amount=amount,
            incident_summary=text[:300].strip(),
            grievance=text.strip(),
            requested_relief=requested_relief,
        )

    async def complaint_to_draft(self, req: ComplaintDraftRequest) -> ComplaintDraftResponse:
        """
        Process natural language complaint, extract structured entities, retrieve Indian legal provisions, and build legal draft.
        """
        facts = self.extract_complaint_facts_heuristic(req.complaint_text)

        # Build Draft Request
        draft_req = DraftRequest(
            draft_type="Consumer Complaint" if ("consumer" in req.complaint_text.lower() or "purchased" in req.complaint_text.lower() or "product" in req.complaint_text.lower()) else "Legal Complaint",
            name=facts.complainant,
            address="[INSERT ADDRESS]",
            phone="[INSERT PHONE]",
            email="[INSERT EMAIL]",
            opposite_party=facts.opposite_party,
            incident_date=facts.incident_date,
            incident_location="[INSERT DISTRICT / JURISDICTION]",
            facts=(
                f"1. That the Complainant purchased/availed {facts.product_service} from the Opposite Party on {facts.incident_date} for a consideration of {facts.amount}.\n"
                f"2. That the Opposite Party failed to deliver satisfactory service/goods, leading to: {facts.grievance}\n"
                f"3. That despite repeated requests and notice, the Opposite Party has refused or neglected to rectify the defect or provide restitution."
            ),
            relief_requested=facts.requested_relief,
            supporting_documents="Proof of payment / invoice, photographs/records of defect, communication records with opposite party",
            language=req.language,
        )

        draft_response = await self.generate_draft(draft_req)

        return ComplaintDraftResponse(
            extracted_facts=facts,
            draft=draft_response,
            sources=draft_response.sources,
        )

    def _build_deterministic_draft(
        self, req: DraftRequest, sources: List[SourceItem], statutory_hints: List[str]
    ) -> DraftResponse:
        """
        Fallback structured legal draft generator adhering to Indian court petition layouts.
        """
        title = f"BEFORE THE COMPETENT LEGAL FORUM / JURISDICTIONAL AUTHORITY\n\nFORMAL {req.draft_type.upper()}"
        parties = (
            f"IN THE MATTER OF:\n"
            f"{req.name}\n"
            f"Residing at: {req.address}\n"
            f"Contact: {req.phone} | Email: {req.email}\n"
            f"... COMPLAINANT / PETITIONER\n\n"
            f"VERSUS\n\n"
            f"{req.opposite_party}\n"
            f"... OPPOSITE PARTY / RESPONDENT"
        )
        facts = (
            f"MOST RESPECTFULLY SHOWETH:\n"
            f"1. That the Complainant is a law-abiding citizen residing at the address stated above.\n"
            f"2. That the cause of action arose on or about {req.incident_date} within the territorial jurisdiction of {req.incident_location}.\n"
            f"3. {req.facts}\n"
            f"4. That the acts and omissions of the Opposite Party have caused severe hardship, financial loss, and mental agony to the Complainant."
        )
        provisions = [s.section for s in sources if s.section] or statutory_hints
        legal_grounds = (
            f"LEGAL GROUNDS:\n"
            f"A. That the actions of the Opposite Party constitute a direct violation of statutory obligations under {', '.join(provisions)}.\n"
            f"B. That the Complainant has established a prima facie case with clear evidence of deficiency/breach.\n"
            f"C. That the Opposite Party is legally liable to make good the losses suffered by the Complainant."
        )
        relief = (
            f"PRAYER / RELIEF SOUGHT:\n"
            f"In the light of the facts and grounds stated hereinabove, the Complainant most respectfully prays that this Hon'ble Forum/Court may be pleased to:\n"
            f"a) Direct the Opposite Party to: {req.relief_requested};\n"
            f"b) Award appropriate compensation towards mental agony, harassment, and incidental losses;\n"
            f"c) Award litigation costs to the Complainant; and\n"
            f"d) Pass any other or further order(s) as deemed fit and proper in the interest of justice."
        )
        docs = [
            "1. Copy of Identity & Address Proof of Complainant",
            f"2. Copy of Transaction/Invoice/Receipt ({req.supporting_documents or 'Relevant Invoices'})",
            "3. Copies of written correspondence and grievance notices sent to Opposite Party",
            "4. Photographic/Digital records substantiating the grievance",
        ]
        declaration = (
            f"VERIFICATION & DECLARATION:\n"
            f"I, {req.name}, do hereby solemnly declare and verify that the contents of paragraphs 1 to 4 are true and correct "
            f"to the best of my knowledge, information, and belief. No part thereof is false and nothing material has been concealed therefrom.\n\n"
            f"Verified at {req.incident_location} on this {req.incident_date}.\n\n"
            f"________________________\n"
            f"DEPONENT / COMPLAINANT"
        )

        full_draft = f"""{title}

{parties}

{facts}

{legal_grounds}

RELEVANT STATUTORY PROVISIONS:
{chr(10).join(f"- {p}" for p in provisions)}

{relief}

LIST OF SUPPORTING DOCUMENTS:
{chr(10).join(docs)}

{declaration}

DISCLAIMER:
{LEGAL_DISCLAIMER}
"""

        return DraftResponse(
            title=title,
            parties=parties,
            facts=facts,
            legal_grounds=legal_grounds,
            relevant_provisions=provisions,
            relief_prayer=relief,
            list_of_documents=docs,
            declaration=declaration,
            full_draft=full_draft,
            sources=sources,
            disclaimer=LEGAL_DISCLAIMER,
        )

    def _parse_draft_text(
        self, text: str, req: DraftRequest, sources: List[SourceItem], statutory_hints: List[str]
    ) -> DraftResponse:
        """
        Parses LLM output or packages text into structured sections.
        """
        provisions = [s.section for s in sources if s.section] or statutory_hints

        return DraftResponse(
            title=f"FORMAL {req.draft_type.upper()}",
            parties=f"Complainant: {req.name}\nOpposite Party: {req.opposite_party}",
            facts=req.facts,
            legal_grounds=f"Statutory grounds under {', '.join(provisions)}",
            relevant_provisions=provisions,
            relief_prayer=req.relief_requested,
            list_of_documents=[
                req.supporting_documents or "Transaction receipts and written communications"
            ],
            declaration=f"I, {req.name}, solemnly verify that the facts stated herein are true to the best of my knowledge.",
            full_draft=text + f"\n\nDISCLAIMER:\n{LEGAL_DISCLAIMER}",
            sources=sources,
            disclaimer=LEGAL_DISCLAIMER,
        )


_drafting_service_instance: Optional[DraftingService] = None


def get_drafting_service() -> DraftingService:
    global _drafting_service_instance
    if _drafting_service_instance is None:
        _drafting_service_instance = DraftingService()
    return _drafting_service_instance
