"""
Legal Document Loader for NyayaMithra
Supports .pdf, .docx, .txt, and .md files with metadata preservation.
"""

import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger("nyayamithra.loader")


@dataclass
class LoadedPage:
    text: str
    page_number: int
    document_name: str
    category: str
    file_path: str
    metadata: Dict[str, Any]


class LegalDocumentLoader:
    def __init__(self, base_dirs: Optional[List[Path]] = None):
        self.supported_extensions = {".pdf", ".docx", ".txt", ".md"}
        self.base_dirs = base_dirs or []

    def load_file(self, file_path: Path, category: str = "general") -> List[LoadedPage]:
        """
        Load an individual legal document and extract pages/sections.
        """
        if not file_path.exists() or not file_path.is_file():
            logger.warning(f"File not found: {file_path}")
            return []

        suffix = file_path.suffix.lower()
        doc_name = file_path.stem.replace("_", " ").title()

        if suffix == ".pdf":
            return self._load_pdf(file_path, doc_name, category)
        elif suffix == ".docx":
            return self._load_docx(file_path, doc_name, category)
        elif suffix in {".txt", ".md"}:
            return self._load_text(file_path, doc_name, category)
        else:
            logger.info(f"Skipping unsupported file extension: {file_path}")
            return []

    def _load_pdf(self, file_path: Path, doc_name: str, category: str) -> List[LoadedPage]:
        pages = []
        try:
            from pypdf import PdfReader
            reader = PdfReader(str(file_path))
            for i, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                clean_text = text.strip()
                if clean_text:
                    pages.append(
                        LoadedPage(
                            text=clean_text,
                            page_number=i + 1,
                            document_name=doc_name,
                            category=category,
                            file_path=str(file_path),
                            metadata={"total_pages": len(reader.pages)},
                        )
                    )
        except ImportError:
            logger.warning("pypdf not installed. Reading PDF as raw binary text fallback if possible.")
            try:
                content = file_path.read_bytes().decode("utf-8", errors="ignore")
                pages.append(
                    LoadedPage(
                        text=content[:50000],
                        page_number=1,
                        document_name=doc_name,
                        category=category,
                        file_path=str(file_path),
                        metadata={"fallback": True},
                    )
                )
            except Exception as e:
                logger.error(f"Failed to read PDF fallback {file_path}: {e}")
        except Exception as e:
            logger.error(f"Error loading PDF {file_path}: {e}")

        return pages

    def _load_docx(self, file_path: Path, doc_name: str, category: str) -> List[LoadedPage]:
        pages = []
        try:
            import docx
            doc = docx.Document(str(file_path))
            full_text = []
            for para in doc.paragraphs:
                if para.text.strip():
                    full_text.append(para.text.strip())

            combined = "\n\n".join(full_text)
            if combined:
                pages.append(
                    LoadedPage(
                        text=combined,
                        page_number=1,
                        document_name=doc_name,
                        category=category,
                        file_path=str(file_path),
                        metadata={"paragraphs_count": len(full_text)},
                    )
                )
        except ImportError:
            logger.warning("python-docx not installed. Skipping DOCX file.")
        except Exception as e:
            logger.error(f"Error reading DOCX {file_path}: {e}")

        return pages

    def _load_text(self, file_path: Path, doc_name: str, category: str) -> List[LoadedPage]:
        pages = []
        try:
            content = file_path.read_text(encoding="utf-8", errors="replace").strip()
            if content:
                # Split large text files into virtual pages of ~3000 characters if very long
                lines = content.split("\n")
                current_batch = []
                current_len = 0
                page_num = 1

                for line in lines:
                    current_batch.append(line)
                    current_len += len(line)
                    if current_len > 3500:
                        page_text = "\n".join(current_batch).strip()
                        if page_text:
                            pages.append(
                                LoadedPage(
                                    text=page_text,
                                    page_number=page_num,
                                    document_name=doc_name,
                                    category=category,
                                    file_path=str(file_path),
                                    metadata={},
                                )
                            )
                            page_num += 1
                        current_batch = []
                        current_len = 0

                if current_batch:
                    remaining_text = "\n".join(current_batch).strip()
                    if remaining_text:
                        pages.append(
                            LoadedPage(
                                text=remaining_text,
                                page_number=page_num,
                                document_name=doc_name,
                                category=category,
                                file_path=str(file_path),
                                metadata={},
                            )
                        )
        except Exception as e:
            logger.error(f"Error reading text file {file_path}: {e}")

        return pages

    def discover_legal_files(self, legal_dir: Path) -> List[Dict[str, Any]]:
        """
        Discover all legal documents across category folders.
        """
        discovered = []
        categories = ["acts", "rules", "regulations", "notifications", "other"]

        for cat in categories:
            cat_dir = legal_dir / cat
            if cat_dir.exists() and cat_dir.is_dir():
                for p in cat_dir.rglob("*"):
                    if p.is_file() and p.suffix.lower() in self.supported_extensions:
                        discovered.append({
                            "path": p,
                            "category": cat,
                            "filename": p.name,
                            "size": p.stat().st_size,
                        })

        # Also discover user-uploaded documents in data/documents
        user_doc_dir = legal_dir.parent / "data" / "documents"
        if user_doc_dir.exists() and user_doc_dir.is_dir():
            for p in user_doc_dir.rglob("*"):
                if p.is_file() and p.suffix.lower() in self.supported_extensions:
                    discovered.append({
                        "path": p,
                        "category": "user_uploads",
                        "filename": p.name,
                        "size": p.stat().st_size,
                    })

        return discovered
