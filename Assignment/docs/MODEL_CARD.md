# Model Card — IndustroSense AI

## System Name
IndustroSense AI — Multimodal Responsible Generative AI Assistant for
Industrial Equipment Diagnostics and Documentation.

## Purpose
A college laboratory / capstone prototype demonstrating a multimodal
Retrieval-Augmented Generation (RAG) assistant for industrial equipment
fault triage. **IndustroSense AI is an assistance tool and does not
replace qualified industrial engineers or safety procedures.**

## Capabilities
- Retrieves relevant passages from a local technical knowledge base
  (sample motor/pump manuals, a maintenance SOP, and sample incident logs).
- Accepts text, image, and voice input and fuses them into one context.
- Performs a simple maintenance-interval calculation via a rule-based tool.
- Generates a structured diagnostic response with explicit sections for
  possible fault, evidence, recommended action, safety warning,
  confidence/uncertainty, and sources.
- Applies prototype Responsible-AI checks (grounding, unsafe-content
  detection, human-review flagging) before presenting a result.
- Logs every request to an append-only audit log for traceability.

## Supported Inputs
- **Text:** free-form description of the equipment problem (max length
  configurable, default 2000 characters).
- **Image:** PNG / JPG / JPEG, up to a configurable size limit (default 8 MB).
- **Audio:** WAV / MP3 / M4A, up to a configurable size limit (default 20 MB).
- **Documents (for the knowledge base):** TXT and PDF files placed under
  `data/manuals`, `data/sops`, `data/incidents`.

## Models Used
| Component        | Model                                         | Notes |
|-------------------|-----------------------------------------------|-------|
| LLM (generation)  | `llama3.2` via Ollama (local)                  | Configurable via `OLLAMA_MODEL` |
| Embeddings        | `all-MiniLM-L6-v2` (Sentence-Transformers)     | 384-dimensional, CPU-friendly |
| Speech-to-text    | OpenAI Whisper, `base` size                    | Configurable via `WHISPER_MODEL` |
| Vision / captioning | `Salesforce/blip-image-captioning-base`      | Configurable via `VISION_MODEL` |
| Vector search     | FAISS `IndexFlatIP` (cosine via normalization) | Exact search, suitable for small corpora |

All models are open-source and run locally; no paid API key is required
for the core demonstration.

## Training / Source Information
This project does not fine-tune any model. It uses pretrained
open-source models as-is, combined with a small, hand-authored sample
knowledge base created specifically for this demonstration (clearly
labelled as simulated/sample documentation in each file).

## Limitations
- The knowledge base is intentionally small and synthetic; retrieval
  quality will not generalize to real industrial documentation without
  ingesting real manuals.
- The rule-based agent (RETRIEVE / TOOL / CLARIFY) uses simple keyword
  and pattern heuristics, not a learned classifier — it can misroute
  unusual phrasings.
- The "Evidence Strength" indicator is derived from embedding
  similarity scores, **not** a statistically calibrated probability of
  diagnostic correctness.
- The Responsible-AI checks (`safety.py`) are heuristic pattern
  matchers. They will miss unsafe requests phrased in unexpected ways
  and may occasionally flag safe requests — they are prototype
  safeguards, not a certified safety system.

## Known Failure Modes
- If Ollama is not running or the model is not pulled, generation
  fails gracefully with an explanatory message rather than a fabricated
  diagnosis.
- If the vector database has not been built (`python ingest.py` not
  yet run), retrieval returns no results and the UI states this clearly.
- Whisper/BLIP may produce inaccurate transcriptions/captions on noisy
  audio or ambiguous images; these are surfaced as "Speech
  Transcription" / "Image Observation" and are never treated as ground
  truth diagnoses.

## Hallucination Risks
Local LLMs can still generate plausible-sounding but incorrect
technical claims, especially when retrieved evidence is weak or
absent. The system prompt instructs the model not to invent
specifications or intervals and to state when evidence is
insufficient, and the grounding check flags responses with weak or
missing evidence for human review — but this does not eliminate
hallucination risk.

## Image-Analysis Limitations
The vision model produces a general image caption, not a certified
defect-detection output. It cannot reliably identify specific
mechanical failures (e.g. a particular bearing fault) from a photo.
The application always labels this output "Observed from image" and
keeps it separate from the "Technical diagnosis" section.

## Speech-Recognition Limitations
Whisper's `base` model favors speed over accuracy; background noise,
strong accents, or poor audio quality can degrade transcription
quality. Users should verify the displayed transcription before
relying on it.

## Privacy Considerations
- Login credentials are read from environment variables, never
  hard-coded.
- Uploaded images and audio are processed via temporary files/in-memory
  buffers and are not persisted to disk by the application by default.
- The audit log stores derived metadata (query text, transcription
  text, image caption text, retrieved sources, similarity scores) —
  not raw image or audio bytes.

## Data Handling
See `logs/audit_log.jsonl` for the audit trail format. Operators
deploying this prototype beyond a lab setting should apply their own
data-retention and access-control policies to this log, since it
contains user-submitted query text.

## Security Considerations
- Authentication is a simple demonstration login and is not suitable
  for production use as-is.
- Rate limiting is in-memory and per-process; it does not protect a
  multi-instance production deployment.
- The application never executes uploaded files; only validated
  image/audio/document types are processed by their respective
  libraries.

## Human Oversight
The system displays an explicit "Human Review Recommended" warning
whenever evidence is weak/absent, unsafe-instruction patterns are
detected, or the agent could not confidently retrieve information.
Users are expected to apply their own engineering judgment and
facility procedures at all times.

## Intended Users
Engineering students and instructors, for a Generative AI / RAG /
Responsible AI laboratory demonstration.

## Out-of-Scope Uses
- Real industrial safety-critical decision-making.
- Replacing qualified maintenance/engineering personnel.
- Any deployment without a proper security, privacy, and safety review.
