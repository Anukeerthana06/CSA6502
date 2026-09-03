"""
Local Embedding Provider for NyayaMithra
Provides 100% local, deterministic embeddings for vectorization without external API calls.
"""

import math
import re
import hashlib
from typing import List, Union
import logging

logger = logging.getLogger("nyayamithra.embeddings")


class EmbeddingProvider:
    """
    Local embedding provider compatible with ChromaDB embedding function interface.
    Can utilize sentence-transformers if present, or an efficient local deterministic
    semantic hashing/TF-IDF projection embedding that is fast and never requires downloading files.
    """

    def __init__(self, provider_type: str = "local_minilm", dimension: int = 384):
        self.provider_type = provider_type
        self.dimension = dimension
        self._st_model = None

        if provider_type == "sentence_transformers":
            try:
                from sentence_transformers import SentenceTransformer
                self._st_model = SentenceTransformer("all-MiniLM-L6-v2")
                logger.info("Loaded sentence-transformers model 'all-MiniLM-L6-v2' locally.")
            except Exception as e:
                logger.warning(f"Could not load sentence-transformers ({e}). Using local lightweight vectorizer.")
                self._st_model = None

    def __call__(self, input: Union[str, List[str]]) -> List[List[float]]:
        """
        ChromaDB EmbeddingFunction protocol: callable taking str or list of str, returning list of vectors.
        """
        if isinstance(input, str):
            input = [input]
        return self.embed_documents(input)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embedding vectors for a list of document strings.
        """
        if self._st_model is not None:
            try:
                embeddings = self._st_model.encode(texts, convert_to_numpy=True)
                return embeddings.tolist()
            except Exception as e:
                logger.warning(f"SentenceTransformer encoding error: {e}. Falling back to local vectorizer.")

        # Local deterministic semantic feature vectorizer
        return [self._embed_single_text(text) for text in texts]

    def embed_query(self, text: str) -> List[float]:
        """
        Generate embedding vector for a single query string.
        """
        return self.embed_documents([text])[0]

    def _embed_single_text(self, text: str) -> List[float]:
        """
        Generate a normalized, dense feature vector (dimension 384) from text tokens and n-grams.
        Uses character and subword hashed projections + legal keyword weighting.
        """
        vector = [0.0] * self.dimension
        if not text:
            return vector

        # Clean text
        clean = text.lower()
        words = re.findall(r"\b[a-z0-9_]+\b", clean)

        # High-signal legal terminology booster
        legal_keywords = {
            "section": 3.0, "act": 2.5, "court": 2.0, "complaint": 3.0, "consumer": 3.5,
            "theft": 3.5, "punishment": 3.0, "ipc": 3.0, "bns": 3.0, "notice": 2.5,
            "rti": 3.5, "compensation": 3.0, "refund": 3.0, "defect": 3.0, "police": 2.5,
            "fir": 3.5, "fraud": 3.0, "cyber": 3.5, "tenant": 3.0, "rent": 3.0,
            "accident": 3.0, "motor": 2.5, "vehicle": 2.5, "damages": 2.5, "penalty": 2.5,
            "article": 3.0, "constitution": 3.5, "rights": 2.5, "jurisdiction": 2.5,
        }

        # 1. Unigram & Bigram hashing
        for i, word in enumerate(words):
            weight = legal_keywords.get(word, 1.0)
            
            # Hash to index
            h1 = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16) % self.dimension
            sign1 = 1.0 if (h1 % 2 == 0) else -1.0
            vector[h1] += sign1 * weight

            # Bigrams
            if i < len(words) - 1:
                bigram = f"{word}_{words[i+1]}"
                h2 = int(hashlib.sha256(bigram.encode("utf-8")).hexdigest(), 16) % self.dimension
                sign2 = 1.0 if (h2 % 2 == 0) else -1.0
                vector[h2] += sign2 * (weight * 1.2)

        # 2. Substring / character trigrams for typo resilience
        for i in range(len(clean) - 2):
            trigram = clean[i : i + 3]
            h3 = int(hashlib.sha1(trigram.encode("utf-8")).hexdigest(), 16) % self.dimension
            vector[h3] += 0.2

        # 3. L2 Normalization
        norm = math.sqrt(sum(v * v for v in vector))
        if norm > 0:
            vector = [v / norm for v in vector]

        return vector
