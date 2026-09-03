"""
app.py
------
IndustroSense AI — Streamlit entry point.

Wires together every module:
    authentication -> rate_limiter -> utils(validation) -> multimodal
    -> agent -> rag -> (Ollama LLM) -> safety -> audit_logger

Run with:
    streamlit run app.py
"""

from __future__ import annotations

import json
import time
from typing import Any, Dict, List, Optional

import streamlit as st

import agent
import audit_logger
import authentication
import config
import multimodal
import rate_limiter
import safety
import utils
from rag import get_rag_system

# ----------------------------------------------------------------------
# Page config
# ----------------------------------------------------------------------
st.set_page_config(page_title=config.APP_TITLE, page_icon="🏭", layout="wide")


# ----------------------------------------------------------------------
# Ollama LLM generation
# ----------------------------------------------------------------------
SYSTEM_INSTRUCTIONS = """You are IndustroSense AI, an assistant for industrial equipment \
diagnostics and documentation. You must follow these rules strictly:

- Do not invent technical specifications or maintenance intervals that are not present \
in the provided evidence.
- Do not claim certainty when the retrieved evidence is insufficient or weak.
- Use the retrieved technical evidence as your primary source; explicitly mention when \
evidence is unavailable or weak.
- Never recommend bypassing safety systems, interlocks, or emergency protection.
- Never recommend disabling thermal, electrical, or pressure safety devices.
- For any potentially dangerous situation, recommend qualified human inspection.
- Structure your answer using exactly these markdown headings, in this order:
## Possible Fault
## Evidence
## Recommended Action
## Safety Warning
## Confidence / Uncertainty
## Sources

Under "## Sources", list the source filenames and chunk ids you relied on. If no \
evidence was retrieved, say so plainly under both "## Evidence" and "## Sources".
"""


def call_ollama(context: str, query: str) -> Dict[str, Any]:
    """
    Calls a local Ollama server to generate the diagnostic response.
    Returns {'ok': bool, 'text': str, 'error': Optional[str]}.
    """
    try:
        import ollama
    except ImportError:
        return {
            "ok": False,
            "text": "",
            "error": (
                "The 'ollama' Python package is not installed. "
                "Run: pip install ollama, then: ollama pull " + config.OLLAMA_MODEL
            ),
        }

    prompt = (
        f"{SYSTEM_INSTRUCTIONS}\n\n"
        f"USER QUERY:\n{query}\n\n"
        f"MULTIMODAL CONTEXT:\n{context}\n\n"
        f"Now produce the structured diagnostic response."
    )

    try:
        response = ollama.chat(
            model=config.OLLAMA_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.get("message", {}).get("content", "").strip()
        if not text:
            return {"ok": False, "text": "", "error": "Ollama returned an empty response."}
        return {"ok": True, "text": text, "error": None}
    except Exception as e:
        return {
            "ok": False,
            "text": "",
            "error": (
                f"Could not reach Ollama ({e}). Ensure Ollama is running: 'ollama serve', "
                f"and that the model is pulled: 'ollama pull {config.OLLAMA_MODEL}'."
            ),
        }


# ----------------------------------------------------------------------
# Session state initialization
# ----------------------------------------------------------------------
def init_session_state() -> None:
    defaults = {
        "authenticated": False,
        "session_id": utils.new_session_id(),
        "last_result": None,
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


init_session_state()


# ----------------------------------------------------------------------
# Login screen
# ----------------------------------------------------------------------
def login_screen() -> None:
    st.title("🏭 " + config.APP_TITLE)
    st.caption(config.APP_SUBTITLE)
    st.subheader("Sign in")

    if authentication.is_using_default_password():
        st.warning(
            "The application is using the default demonstration password. "
            "Set INDUSTROSENSE_USERNAME / INDUSTROSENSE_PASSWORD in your .env file."
        )

    with st.form("login_form"):
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Login")

    if submitted:
        if authentication.check_credentials(username, password):
            st.session_state.authenticated = True
            st.rerun()
        else:
            st.error("Invalid username or password.")


if not st.session_state.authenticated:
    login_screen()
    st.stop()


# ----------------------------------------------------------------------
# Cached resources
# ----------------------------------------------------------------------
@st.cache_resource(show_spinner=False)
def load_rag():
    return get_rag_system()


rag_system = load_rag()
agent_instance = agent.SimpleAgent()


# ----------------------------------------------------------------------
# Sidebar: system status
# ----------------------------------------------------------------------
def sidebar_status() -> None:
    st.sidebar.title("🏭 " + config.APP_TITLE)
    st.sidebar.caption(config.APP_SUBTITLE)
    st.sidebar.markdown("### System Status")

    if st.session_state.authenticated:
        st.sidebar.success("Authentication: Logged in")
    else:
        st.sidebar.error("Authentication: Not logged in")

    if rag_system.is_ready():
        st.sidebar.success(
            f"RAG / Vector DB: Ready ({rag_system.num_chunks()} chunks, "
            f"{rag_system.num_sources()} sources)"
        )
    else:
        st.sidebar.error(f"RAG / Vector DB: Not ready — {rag_system.load_error()}")

    try:
        import ollama  # noqa: F401
        st.sidebar.info("LLM (Ollama): Package installed — connection checked on request")
    except ImportError:
        st.sidebar.error("LLM (Ollama): Python package not installed")

    try:
        import whisper  # noqa: F401
        st.sidebar.info("Speech model (Whisper): Package installed")
    except ImportError:
        st.sidebar.warning("Speech model (Whisper): Not installed (optional)")

    try:
        import transformers  # noqa: F401
        st.sidebar.info("Vision model (BLIP): Package installed")
    except ImportError:
        st.sidebar.warning("Vision model (BLIP): Not installed (optional)")

    st.sidebar.success("Safety module: Active (prototype heuristics)")

    remaining = rate_limiter.remaining_requests(st.session_state.session_id)
    st.sidebar.markdown("### Rate Limit")
    st.sidebar.metric("Requests remaining", f"{remaining} / {config.RATE_LIMIT_MAX_REQUESTS}")

    if st.sidebar.button("Log out"):
        st.session_state.authenticated = False
        st.rerun()


sidebar_status()


# ----------------------------------------------------------------------
# Core pipeline
# ----------------------------------------------------------------------
def run_diagnosis_pipeline(
    text_input: str,
    audio_file,
    image_file,
    top_k: int,
) -> Dict[str, Any]:
    start = time.perf_counter()

    session_id = st.session_state.session_id

    # Rate limiting
    if not rate_limiter.check_and_record(session_id):
        wait = rate_limiter.seconds_until_reset(session_id)
        return {"error": f"Rate limit reached. Please try again in {wait} seconds."}

    # --- Multimodal inputs ---
    speech_transcription = None
    image_observation = None

    if audio_file is not None:
        v = utils.validate_audio_file(audio_file)
        if not v.ok:
            return {"error": v.message}
        with st.spinner("Transcribing audio with Whisper..."):
            result = multimodal.transcribe_audio(audio_file)
        if result["ok"]:
            speech_transcription = result["text"]
        else:
            st.warning(result["error"])

    if image_file is not None:
        v = utils.validate_image_file(image_file)
        if not v.ok:
            return {"error": v.message}
        with st.spinner("Analyzing image..."):
            result = multimodal.analyze_image(image_file)
        if result["ok"]:
            image_observation = result["observation"]
        else:
            st.warning(result["error"])

    # --- Build effective query text for the agent/RAG step ---
    effective_query_parts = [p for p in [text_input, speech_transcription] if p and p.strip()]
    effective_query = " ".join(effective_query_parts).strip()

    if not effective_query and not image_observation:
        return {"error": "Please provide at least text, an image, or a voice note."}

    if text_input:
        v = utils.validate_text_input(text_input)
        if not v.ok:
            return {"error": v.message}

    # --- Agent decision ---
    decision = agent_instance.decide(effective_query or (image_observation or ""))

    retrieved_chunks: List[Dict[str, Any]] = []
    tool_result = None

    if decision.action == "RETRIEVE":
        if rag_system.is_ready():
            retrieved_chunks = rag_system.retrieve(effective_query, top_k=top_k)
        else:
            st.warning(f"RAG system unavailable: {rag_system.load_error()}")

    elif decision.action == "TOOL":
        nums = decision.extracted_numbers
        if len(nums) >= 2:
            tool_result = agent.calculate_maintenance_schedule(nums[0], nums[1])
        else:
            tool_result = {
                "ok": False,
                "message": "Could not automatically extract two numbers (current hours, "
                           "interval hours) from the query. Use the Maintenance Calculator "
                           "in the sidebar tool below.",
            }
        # Even for TOOL queries, also try light retrieval for extra context if available.
        if rag_system.is_ready():
            retrieved_chunks = rag_system.retrieve(effective_query, top_k=top_k)

    # decision.action == "CLARIFY" -> no retrieval, no tool

    # --- Multimodal fusion ---
    fused_context = multimodal.fuse_context(
        user_text=text_input,
        speech_transcription=speech_transcription,
        image_observation=image_observation,
        retrieved_chunks=retrieved_chunks,
    )

    if tool_result is not None:
        fused_context += f"\n\nMAINTENANCE CALCULATOR RESULT:\n{tool_result.get('message', '')}"

    # --- LLM generation ---
    generated_response = ""
    llm_error = None

    if decision.action == "CLARIFY":
        generated_response = (
            "## Clarification Needed\n" + decision.clarification_question
        )
    else:
        with st.spinner(f"Generating response with Ollama ({config.OLLAMA_MODEL})..."):
            llm_result = call_ollama(fused_context, effective_query or "See image observation.")
        if llm_result["ok"]:
            generated_response = llm_result["text"]
        else:
            llm_error = llm_result["error"]
            generated_response = (
                "## Possible Fault\nUnable to generate a response because the local LLM "
                "(Ollama) could not be reached.\n\n## Evidence\n"
                + ("Retrieved evidence is shown in the RAG Explorer tab." if retrieved_chunks
                   else "No evidence retrieved.")
                + "\n\n## Recommended Action\nStart Ollama and ensure the model is pulled, "
                  "then retry.\n\n## Safety Warning\nNone generated — LLM unavailable.\n\n"
                  "## Confidence / Uncertainty\nNot applicable — response not generated.\n\n"
                  "## Sources\nNone."
            )

    # --- Responsible AI validation ---
    safety_result = safety.safety_check(
        user_query=effective_query,
        response_text=generated_response,
        retrieved_chunks=retrieved_chunks,
        agent_decision=decision.action,
    )

    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)

    # --- Audit log ---
    audit_logger.log_event(
        session_id=session_id,
        user_query=effective_query,
        speech_transcription=speech_transcription,
        image_observation=image_observation,
        agent_decision=decision.action,
        agent_reason=decision.reason,
        retrieved_sources=retrieved_chunks,
        generated_response=generated_response,
        safety_result=safety_result,
        grounding_result=safety_result["grounding"],
        human_review_required=safety_result["human_review_required"],
        processing_time_ms=elapsed_ms,
    )

    return {
        "error": None,
        "effective_query": effective_query,
        "speech_transcription": speech_transcription,
        "image_observation": image_observation,
        "decision": decision,
        "retrieved_chunks": retrieved_chunks,
        "tool_result": tool_result,
        "fused_context": fused_context,
        "generated_response": generated_response,
        "llm_error": llm_error,
        "safety_result": safety_result,
        "elapsed_ms": elapsed_ms,
    }


# ----------------------------------------------------------------------
# UI: Tabs
# ----------------------------------------------------------------------
st.title("🏭 " + config.APP_TITLE)
st.caption(config.APP_SUBTITLE)

tab_diagnose, tab_rag, tab_agent, tab_responsible, tab_model_card, tab_audit = st.tabs(
    ["🩺 Diagnose", "🔍 RAG Explorer", "🤖 Agent Trace", "🛡️ Responsible AI", "📋 Model Card", "🗂️ Audit Log"]
)

# ------------------------------------------------------------------
# Tab 1: Diagnose
# ------------------------------------------------------------------
with tab_diagnose:
    st.subheader("1. Fault Report")
    col_left, col_right = st.columns([2, 1])

    with col_left:
        text_input = st.text_area(
            "Describe the equipment problem",
            placeholder="e.g. The industrial motor becomes very hot after running for "
                        "approximately 30 minutes and starts vibrating.",
            height=120,
        )

        st.markdown("**Image Upload** (PNG, JPG, JPEG)")
        image_file = st.file_uploader("Upload equipment photo", type=["png", "jpg", "jpeg"], key="image_upl")
        if image_file is not None:
            st.image(image_file, caption="Uploaded image", width=300)

        st.markdown("**Voice Upload** (WAV, MP3, M4A)")
        audio_file = st.file_uploader("Upload voice note", type=["wav", "mp3", "m4a"], key="audio_upl")
        if audio_file is not None:
            st.audio(audio_file)

    with col_right:
        top_k = st.selectbox("Top-K retrieval", options=[1, 3, 5], index=1)
        st.markdown("---")
        st.markdown("**Maintenance Calculator (Tool)**")
        with st.form("calc_form"):
            cur_hours = st.number_input("Current operating hours", min_value=0.0, value=0.0, step=1.0)
            interval_hours = st.number_input("Maintenance interval (hours)", min_value=0.0, value=500.0, step=1.0)
            calc_submit = st.form_submit_button("Calculate")
        if calc_submit:
            result = agent.calculate_maintenance_schedule(cur_hours, interval_hours)
            if result["ok"]:
                st.success(result["message"])
            else:
                st.error(result["message"])

    run_clicked = st.button("🚀 Generate Diagnosis", type="primary")

    if run_clicked:
        pipeline_result = run_diagnosis_pipeline(text_input, audio_file, image_file, top_k)
        st.session_state.last_result = pipeline_result

    result = st.session_state.last_result

    if result:
        if result.get("error"):
            st.error(result["error"])
        else:
            st.markdown("---")

            if result["speech_transcription"]:
                st.markdown("**Speech Transcription**")
                st.info(result["speech_transcription"])

            if result["image_observation"]:
                st.markdown("**Image Observation**")
                st.info(result["image_observation"])

            st.subheader("Diagnostic Result")
            if result.get("llm_error"):
                st.warning(result["llm_error"])
            st.markdown(result["generated_response"])

            sr = result["safety_result"]
            st.markdown("---")
            col_a, col_b, col_c = st.columns(3)
            col_a.metric("Evidence Strength", sr["evidence_strength"])
            col_b.metric("Grounded?", "Yes" if sr["grounding"]["grounded"] else "No")
            col_c.metric("Processing Time", f"{result['elapsed_ms']} ms")

            if sr["human_review_required"]:
                st.warning("⚠️ Human Review Recommended — see the Responsible AI tab for details.")

# ------------------------------------------------------------------
# Tab 2: RAG Explorer
# ------------------------------------------------------------------
with tab_rag:
    st.subheader("RAG Explorer")
    result = st.session_state.last_result

    if not result or result.get("error"):
        st.info("Run a diagnosis in the Diagnose tab to see retrieval results here.")
    else:
        st.write(f"**Query used for retrieval:** {result['effective_query'] or '(image-only query)'}")
        chunks = result["retrieved_chunks"]
        if not chunks:
            st.info("No chunks were retrieved for this query (agent action was "
                     f"{result['decision'].action}, or the knowledge base returned no matches).")
        else:
            for i, c in enumerate(chunks, start=1):
                with st.expander(f"Retrieved Source {i}: {c['source']} — similarity {c['similarity']:.3f}"):
                    st.write(f"**Chunk ID:** {c['chunk_id']}")
                    st.write(f"**Similarity score:** {c['similarity']:.4f}")
                    st.write("**Text:**")
                    st.write(c["text"])

    st.markdown("---")
    st.subheader("Retrieval Evaluation (Precision@K)")
    if config.EVAL_CSV_PATH.exists():
        import pandas as pd
        df = pd.read_csv(config.EVAL_CSV_PATH)
        st.dataframe(df)
    else:
        st.info(
            "Not evaluated yet. Run 'python evaluation.py' to compute Precision@1/3/5 "
            "against the labelled evaluation dataset."
        )

# ------------------------------------------------------------------
# Tab 3: Agent Trace
# ------------------------------------------------------------------
with tab_agent:
    st.subheader("Agent Decision Trace")
    result = st.session_state.last_result

    if not result or result.get("error"):
        st.info("Run a diagnosis in the Diagnose tab to see the agent's decision trace here.")
    else:
        decision = result["decision"]
        st.metric("Agent Decision", decision.action)
        st.write(f"**Reason:** {decision.reason}")
        st.write(f"**Decision Trace:** {decision.trace}")

        if decision.action == "TOOL":
            st.markdown("**Tool Invocation: Maintenance Schedule Calculator**")
            tr = result.get("tool_result")
            if tr:
                st.json(tr)

        if decision.action == "CLARIFY":
            st.markdown("**Clarification Question Presented to User**")
            st.info(decision.clarification_question)

        st.markdown("---")
        st.markdown("**Fused Multimodal Context Sent to LLM**")
        with st.expander("Show fused context"):
            st.text(result["fused_context"])

# ------------------------------------------------------------------
# Tab 4: Responsible AI
# ------------------------------------------------------------------
with tab_responsible:
    st.subheader("Responsible AI Validation")
    result = st.session_state.last_result

    if not result or result.get("error"):
        st.info("Run a diagnosis in the Diagnose tab to see Responsible AI validation results here.")
    else:
        sr = result["safety_result"]

        col1, col2 = st.columns(2)
        with col1:
            st.markdown("**Grounding Check**")
            st.json(sr["grounding"])
        with col2:
            st.markdown("**Unsafe Content Check**")
            st.json(sr["unsafe"])

        st.markdown(f"**Evidence Strength:** {sr['evidence_strength']}")

        if sr["human_review_required"]:
            st.error("🚫 Human Review Recommended before acting on this response.")
        else:
            st.success("✅ No mandatory human-review flag triggered by prototype checks.")

        st.caption(sr["disclaimer"])

    st.markdown("---")
    st.markdown("**Data Handling Information**")
    st.write(
        "- Uploaded images and audio are processed in memory / temporary files and are "
        "not permanently stored by default.\n"
        "- Audit logs store metadata (query text, transcription, image caption, sources, "
        "scores) rather than raw media files.\n"
        "- Authentication credentials are read from environment variables, never hard-coded."
    )

# ------------------------------------------------------------------
# Tab 5: Model Card
# ------------------------------------------------------------------
with tab_model_card:
    st.subheader("Model Card")
    try:
        with open("docs/MODEL_CARD.md", "r", encoding="utf-8") as f:
            st.markdown(f.read())
    except FileNotFoundError:
        st.error("docs/MODEL_CARD.md not found.")

# ------------------------------------------------------------------
# Tab 6: Audit Log
# ------------------------------------------------------------------
with tab_audit:
    st.subheader("Audit Log")
    st.write(f"Total logged events: {audit_logger.count_events()}")

    limit = st.slider("Number of recent events to show", min_value=5, max_value=100, value=20, step=5)
    events = audit_logger.read_recent_events(limit=limit)

    if not events:
        st.info("No audit log entries yet. Run a diagnosis to create one.")
    else:
        for e in events:
            title = f"{e.get('timestamp', '')} — {e.get('agent_decision', '')} — " \
                    f"{'⚠️ Human Review' if e.get('human_review_required') else 'OK'}"
            with st.expander(title):
                st.json(e)
