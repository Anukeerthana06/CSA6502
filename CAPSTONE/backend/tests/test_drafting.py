"""
Tests for DraftingService, fact extraction, and document templates.
"""

import pytest
from backend.services.drafting_service import DraftingService
from backend.models.schemas import DraftRequest, ComplaintDraftRequest


def test_complaint_fact_extraction():
    service = DraftingService()
    sample_complaint = (
        "I purchased a refrigerator for ₹45,000 from XYZ Electronics on 10 June 2026. "
        "The refrigerator stopped working after 12 days. The seller refused to repair or replace it. "
        "I want a full refund and compensation."
    )
    facts = service.extract_complaint_facts_heuristic(sample_complaint)
    assert facts.amount == "₹45,000"
    assert "XYZ Electronics" in facts.opposite_party
    assert "10 June 2026" in facts.incident_date or "10" in facts.incident_date
    assert "Refrigerator" in facts.product_service or "refrigerator" in facts.product_service.lower()


@pytest.mark.asyncio
async def test_deterministic_draft_generation():
    service = DraftingService()
    req = DraftRequest(
        draft_type="Consumer Complaint",
        name="Ramesh Sharma",
        address="Flat 402, Green Avenue, Bengaluru",
        phone="9876543210",
        email="ramesh@example.com",
        opposite_party="XYZ Electronics Pvt Ltd",
        incident_date="10 June 2026",
        incident_location="Bengaluru",
        facts="Purchased defective refrigerator which malfunctioned within 12 days. Seller refused replacement.",
        relief_requested="Refund of ₹45,000 along with ₹15,000 compensation for mental harassment.",
    )
    draft = await service.generate_draft(req)
    assert "CONSUMER COMPLAINT" in draft.title
    assert "Ramesh Sharma" in draft.parties
    assert "XYZ Electronics" in draft.parties
    assert "PRAYER" in draft.relief_prayer or "RELIEF" in draft.relief_prayer
    assert "VERIFICATION" in draft.declaration or "DECLARATION" in draft.declaration
    assert "NyayaMithra" in draft.disclaimer
