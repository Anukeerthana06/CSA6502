# 🏭 IndustroSense AI

**A Multimodal Responsible Generative AI Assistant for Industrial Equipment
Diagnostics and Documentation.**

A college Generative AI laboratory / capstone project demonstrating a full
local RAG + multimodal + agentic pipeline: document ingestion → embeddings
→ FAISS vector search → a simple rule-based agent (RETRIEVE / TOOL /
CLARIFY) → multimodal fusion (text + speech + image) → local LLM
generation via Ollama → Responsible-AI validation → audit logging.

> ⚠️ **This is a lab/capstone prototype using entirely simulated sample
> documentation.** It is not connected to any real equipment and must not
> be used for actual industrial maintenance decisions.

---

## 1. Features

- **RAG pipeline**: PDF/TXT ingestion → chunking with overlap → embeddings
  (Sentence-Transformers) → FAISS vector database → Top-K retrieval with
  source, chunk id, and similarity score displayed in the UI.
- **Simple AI agent**: transparent rule-based decision between
  `RETRIEVE`, `TOOL`, and `CLARIFY`, with a visible decision trace.
- **Tool use**: a maintenance-schedule calculator (remaining hours until
  next service).
- **Multimodal input**: text, image (captioned via BLIP), and voice
  (transcribed via Whisper) — any combination works, none are mandatory.
- **Local LLM generation** via **Ollama** (`llama3.2` by default) with a
  structured output format (Possible Fault / Evidence / Recommended
  Action / Safety Warning / Confidence / Sources).
- **Responsible AI**: grounding checks, unsafe-instruction detection,
  evidence-strength indicator (explicitly *not* a calibrated probability),
  and a "Human Review Recommended" flag.
- **Security basics**: environment-variable authentication, input
  validation, session-based rate limiting, no hard-coded secrets.
- **Audit logging**: every request logged to `logs/audit_log.jsonl`
  (metadata only — not raw media).
- **Evaluation**: Precision@1/3/5, retrieval latency, and other metrics
  computed from an actual run — never fabricated.
- **Model Card** (`docs/MODEL_CARD.md`) documenting capabilities and limitations.

---

## 2. Architecture

```
Documents (data/manuals, data/sops, data/incidents)
        │
        ▼
Document Processing (ingest.py) → Chunking → Embeddings (all-MiniLM-L6-v2)
        │
        ▼
FAISS Vector Database (vector_db/)
        │
User Query (text / image / voice) ─────► Input Validation (utils.py)
        │
        ▼
Speech-to-Text (Whisper) / Image Analysis (BLIP)   [multimodal.py]
        │
        ▼
AI Agent (agent.py) → RETRIEVE / TOOL / CLARIFY
        │
        ▼
Top-K Retrieval (rag.py)
        │
        ▼
Multimodal Fusion (multimodal.py)
        │
        ▼
Ollama LLM (llama3.2)  [app.py: call_ollama()]
        │
        ▼
Safety & Grounding Validation (safety.py)
        │
        ▼
Diagnosis + Recommended Action + Sources + Evidence Strength (Streamlit UI)
        │
        ▼
Audit Log (audit_logger.py → logs/audit_log.jsonl)
```

---

## 3. Folder Structure

```
IndustroSenseAI/
├── app.py                  Streamlit application (UI + pipeline orchestration + Ollama call)
├── config.py                Central configuration (paths, model names, thresholds)
├── requirements.txt
├── README.md
├── .env.example
├── .gitignore
│
├── ingest.py                 Builds the FAISS vector DB from data/
├── rag.py                    RAG retrieval (embed query, FAISS search, Top-K)
├── agent.py                  Rule-based agent + maintenance calculator tool
├── multimodal.py              Whisper transcription, BLIP captioning, fusion
├── safety.py                  Responsible-AI checks (grounding, unsafe content, human review)
├── authentication.py          Demonstration login check
├── rate_limiter.py            Session-based sliding-window rate limiter
├── audit_logger.py            JSONL audit logging
├── evaluation.py               Precision@K / latency evaluation script
├── utils.py                    Validation + chunking helpers
├── eval_dataset.json           Small manually-labelled retrieval eval set
│
├── data/
│   ├── manuals/                motor_manual.txt, pump_manual.txt (SAMPLE)
│   ├── sops/                   maintenance_sop.txt (SAMPLE)
│   └── incidents/               incident_logs.txt (SAMPLE, fictional)
│
├── vector_db/                   FAISS index + metadata.json (created by ingest.py)
├── logs/                        audit_log.jsonl (created at runtime)
├── outputs/                     evaluation_results.csv, *.png (created by evaluation.py)
│
├── tests/
│   ├── test_rag.py
│   ├── test_agent.py
│   ├── test_safety.py
│   └── test_app.py
│
└── docs/
    ├── MODEL_CARD.md
    └── TEST_CASES.md
```

---

## 4. Installation

### 4.1 Prerequisites
- Python 3.10 or 3.11 recommended.
- [Ollama](https://ollama.com) installed for local LLM generation.
- `ffmpeg` installed at the OS level (required by Whisper).

### 4.2 Windows (PowerShell)
```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 4.3 Linux / macOS
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4.4 Install ffmpeg (required for Whisper)
```bash
# Ubuntu / Debian
sudo apt-get install ffmpeg

# macOS (Homebrew)
brew install ffmpeg

# Windows: download from https://ffmpeg.org/download.html and add to PATH
```

### 4.5 Install and start Ollama, then pull the model
```bash
ollama pull llama3.2
ollama serve
```
(On some platforms `ollama serve` runs automatically after installation —
check with `ollama list` first.)

### 4.6 Configure environment variables
```bash
cp .env.example .env    # Windows: copy .env.example .env
# then edit .env if you want to change the default login or model names
```

---

## 5. Build the Knowledge Base (Vector Database)

```bash
python ingest.py
```
This reads every `.txt`/`.pdf` file under `data/manuals`, `data/sops`, and
`data/incidents`, chunks it, embeds it with `all-MiniLM-L6-v2`, and writes
`vector_db/faiss_index.bin` + `vector_db/metadata.json`. Re-run this any
time you add or change documents in `data/`.

To add your own documents: drop `.txt` or `.pdf` files into any of the
three `data/` subfolders and re-run `python ingest.py`.

---

## 6. Run the Application

```bash
streamlit run app.py
```

Log in with the credentials from your `.env` file (defaults:
`engineer` / `change_me` — **change these**). Then use the **Diagnose**
tab to submit a text description, optionally with an image and/or a
voice note, choose Top-K, and click **Generate Diagnosis**.

---

## 7. Running Tests

```bash
pytest tests/ -v
```
Tests for `agent.py`, `safety.py`, and `utils.py`/`rate_limiter.py` run
without any external model downloads. Tests in `test_rag.py` that need
the vector DB will **skip** (not fail) if you haven't run `ingest.py` yet.

---

## 8. Running the Evaluation

```bash
python evaluation.py
```
Computes Precision@1/3/5 and retrieval latency against
`eval_dataset.json`, and writes:
- `outputs/evaluation_results.csv`
- `outputs/retrieval_precision.png`
- `outputs/response_time.png`

The RAG Explorer tab in the app reads this CSV. If it doesn't exist yet,
the app clearly states **"Not evaluated yet."** — no fabricated numbers
are ever shown.

---

## 9. Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| "Vector database not found" | `ingest.py` not run yet | `python ingest.py` |
| "Could not reach Ollama" | Ollama not running / model not pulled | `ollama serve` and `ollama pull llama3.2` |
| Whisper transcription fails | `ffmpeg` not installed | Install ffmpeg (see §4.4) |
| Image analysis fails / slow | `torch`/`transformers` not installed, or first-run model download | `pip install -r requirements.txt`; first run downloads BLIP weights |
| "Rate limit reached" | More than 10 requests in 10 minutes in one session | Wait for the window to reset, or adjust `RATE_LIMIT_MAX_REQUESTS`/`RATE_LIMIT_WINDOW_SECONDS` in `.env` |
| Login fails | Wrong `.env` credentials | Check `INDUSTROSENSE_USERNAME` / `INDUSTROSENSE_PASSWORD` |
| PDF ingestion skipped | `pypdf` not installed | `pip install pypdf` (already in requirements.txt) |

---

## 10. Security

- No API keys are required for the core local pipeline.
- Credentials are never hard-coded; they come from environment variables.
- Uploaded files are validated for type and size before processing;
  uploaded files are never executed.
- Rate limiting and audit logging are prototype-grade — see
  `docs/MODEL_CARD.md` → "Security Considerations" for what a production
  deployment would need in addition.

---

## 11. Responsible AI

See `docs/MODEL_CARD.md` for the full model card. In short:
`safety.py` implements heuristic (not certified) checks for grounding,
unsafe-instruction language, and evidence strength, and flags responses
for **Human Review** when evidence is weak/absent or unsafe patterns are
detected. The system prompt sent to the LLM explicitly forbids
recommending bypassing safety systems.

---

## 12. Limitations

- Small, synthetic sample knowledge base — not real manufacturer data.
- Rule-based agent, not a trained classifier — simple heuristics can misroute unusual phrasing.
- Vision/speech models are general-purpose, not domain-fine-tuned for industrial equipment.
- Evidence Strength ≠ calibrated diagnostic confidence.
- In-memory rate limiting and audit logging are single-process only.

## 13. Future Improvements

- Fine-tune or few-shot calibrate the agent's routing with real labelled queries.
- Add an NLI-based grounding/entailment check instead of similarity-only heuristics.
- Move audit logs and rate limiting to a proper database/Redis for multi-user deployment.
- Add real OAuth2/SSO authentication.
- Expand the sample knowledge base with more equipment types.

---

## 14. Requirement → Implementation Mapping

| Requirement | Implementation |
|---|---|
| RAG pipeline | `ingest.py`, `rag.py` |
| Vector database | `rag.py`, `vector_db/` |
| Top-K retrieval + evaluation | `rag.py` (`retrieve`), `evaluation.py`, RAG Explorer tab in `app.py` |
| Simple AI agent (RETRIEVE/TOOL/CLARIFY) | `agent.py` |
| Tool / calculator | `agent.py` (`calculate_maintenance_schedule`) |
| Clarification | `agent.py` (`SimpleAgent.decide`, CLARIFY branch) |
| Text input | `app.py` (Diagnose tab) |
| Image input + vision model | `multimodal.py` (`analyze_image`), `app.py` |
| Speech input + Whisper | `multimodal.py` (`transcribe_audio`), `app.py` |
| Multimodal fusion | `multimodal.py` (`fuse_context`) |
| LLM generation (Ollama) | `app.py` (`call_ollama`) |
| Source citations | `rag.py` metadata, `app.py` RAG Explorer tab, LLM prompt "## Sources" |
| Responsible AI / safety checks | `safety.py` |
| Confidence / uncertainty (Evidence Strength) | `safety.py` (`evidence_strength_label`) |
| Human review flag | `safety.py` (`requires_human_review`), `app.py` Responsible AI tab |
| Authentication | `authentication.py`, `app.py` login screen |
| Input validation | `utils.py` |
| Rate limiting | `rate_limiter.py` |
| Secure API-key handling | `config.py`, `.env.example` (no hard-coded secrets) |
| Audit logging | `audit_logger.py`, `logs/audit_log.jsonl` |
| Model card | `docs/MODEL_CARD.md` |
| Evaluation | `evaluation.py`, `eval_dataset.json`, `outputs/` |
| Streamlit web deployment | `app.py` |

---

## 15. Disclaimer

IndustroSense AI is an assistance tool built for educational purposes. It
does not replace qualified industrial engineers, certified technicians,
or established facility safety procedures. All sample documentation in
`data/` is simulated and fictional.
