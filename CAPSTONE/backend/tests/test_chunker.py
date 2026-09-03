"""
Tests for LegalChunker and legal text metadata extraction.
"""

from backend.rag.chunker import LegalChunker
from backend.rag.loader import LoadedPage


def test_chunker_section_extraction():
    chunker = LegalChunker(chunk_size=500, chunk_overlap=50)

    sample_legal_text = """
    Section 35. Manner in which complaint shall be made.
    (1) A complaint, in relation to any goods sold or delivered or agreed to be sold or delivered or any service provided or agreed to be provided, may be filed with a District Commission by the consumer.
    
    Section 36. Proceedings before District Commission.
    (1) Every complaint filed before the District Commission shall be accompanied with such fee and in such manner as may be prescribed.
    """

    page = LoadedPage(
        text=sample_legal_text,
        page_number=1,
        document_name="Consumer Protection Act 2019",
        category="acts",
        file_path="/mock/path/cpa.txt",
        metadata={},
    )

    chunks = chunker.chunk_pages([page])
    assert len(chunks) >= 1
    assert any("Section 35" in c.section or "Section 35" in c.text for c in chunks)
    assert any("Consumer Protection Act 2019" == c.document_name for c in chunks)


def test_chunker_empty_page():
    chunker = LegalChunker()
    page = LoadedPage(
        text="",
        page_number=1,
        document_name="Empty Doc",
        category="acts",
        file_path="/mock/empty.txt",
        metadata={},
    )
    chunks = chunker.chunk_pages([page])
    assert len(chunks) == 0
