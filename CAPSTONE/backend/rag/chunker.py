"""
Legal Chunking Module for NyayaMithra
Performs structure-aware chunking of Indian statutory texts, preserving Section, Article, Chapter, and Act metadata.
"""

import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from backend.config import CHUNK_SIZE, CHUNK_OVERLAP
from backend.rag.loader import LoadedPage


@dataclass
class LegalChunk:
    chunk_id: str
    text: str
    document_name: str
    category: str
    page_number: int
    act: str
    section: str = ""
    chapter: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)


class LegalChunker:
    def __init__(self, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        # Regex patterns for Indian statutory text headings
        self.section_pattern = re.compile(
            r"(?:^|\n)(?:Section|Sec\.|Section\s+No\.)\s*([0-9A-Za-z]+[\w\-]*)\s*[:.\-—]?\s*(.*?)(?=\n|$)",
            re.IGNORECASE,
        )
        self.article_pattern = re.compile(
            r"(?:^|\n)(?:Article|Art\.)\s*([0-9A-Za-z]+[\w\-]*)\s*[:.\-—]?\s*(.*?)(?=\n|$)",
            re.IGNORECASE,
        )
        self.chapter_pattern = re.compile(
            r"(?:^|\n)(?:CHAPTER|PART)\s+([IVXLCDM0-9]+)\s*[:.\-—]?\s*(.*?)(?=\n|$)",
            re.IGNORECASE,
        )

    def extract_legal_metadata(self, text: str, fallback_doc_name: str) -> Dict[str, str]:
        """
        Extract active Act name, Chapter, and Section headers from text chunk.
        """
        section = ""
        chapter = ""
        act = fallback_doc_name

        # Search for Section
        sec_match = self.section_pattern.search(text)
        if sec_match:
            sec_num = sec_match.group(1).strip()
            sec_title = sec_match.group(2).strip()
            section = f"Section {sec_num}" + (f" - {sec_title}" if sec_title else "")
        else:
            art_match = self.article_pattern.search(text)
            if art_match:
                art_num = art_match.group(1).strip()
                art_title = art_match.group(2).strip()
                section = f"Article {art_num}" + (f" - {art_title}" if art_title else "")

        chap_match = self.chapter_pattern.search(text)
        if chap_match:
            chap_num = chap_match.group(1).strip()
            chap_title = chap_match.group(2).strip()
            chapter = f"Chapter {chap_num}" + (f" - {chap_title}" if chap_title else "")

        return {
            "act": act,
            "section": section,
            "chapter": chapter,
        }

    def chunk_pages(self, pages: List[LoadedPage]) -> List[LegalChunk]:
        """
        Chunk loaded pages with sliding window and statutory boundary awareness.
        """
        chunks: List[LegalChunk] = []
        chunk_counter = 0

        for page in pages:
            text = page.text
            if not text:
                continue

            # Identify if text contains multiple distinct sections
            splits = self._split_text_semantically(text)

            current_chapter = ""
            current_section = ""

            for part in splits:
                clean_part = part.strip()
                if not clean_part:
                    continue

                meta = self.extract_legal_metadata(clean_part, page.document_name)
                if meta["chapter"]:
                    current_chapter = meta["chapter"]
                if meta["section"]:
                    current_section = meta["section"]

                chunk_counter += 1
                chunk_id = f"{page.document_name.lower().replace(' ', '_')}_p{page.page_number}_c{chunk_counter}"

                chunks.append(
                    LegalChunk(
                        chunk_id=chunk_id,
                        text=clean_part,
                        document_name=page.document_name,
                        category=page.category,
                        page_number=page.page_number,
                        act=meta["act"],
                        section=meta["section"] or current_section or "General Provisions",
                        chapter=meta["chapter"] or current_chapter or "",
                        metadata={
                            "source_file": page.file_path,
                            "page": page.page_number,
                            "category": page.category,
                        },
                    )
                )

        return chunks

    def _split_text_semantically(self, text: str) -> List[str]:
        """
        Split a page's text into manageable overlapping chunks, respecting paragraphs.
        """
        if len(text) <= self.chunk_size:
            return [text]

        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = []
        current_len = 0

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            para_len = len(para)

            if current_len + para_len > self.chunk_size and current_chunk:
                combined = "\n\n".join(current_chunk)
                chunks.append(combined)

                # Keep overlap from the end of current chunk
                overlap_text = combined[-self.chunk_overlap:] if len(combined) > self.chunk_overlap else ""
                current_chunk = [overlap_text, para] if overlap_text else [para]
                current_len = sum(len(p) for p in current_chunk)
            else:
                current_chunk.append(para)
                current_len += para_len

        if current_chunk:
            final_text = "\n\n".join(current_chunk).strip()
            if final_text:
                chunks.append(final_text)

        return chunks
