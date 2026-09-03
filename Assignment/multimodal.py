"""
multimodal.py
-------------
Handles the non-text modalities:
    - Speech-to-text via OpenAI Whisper (local, open-source)
    - Image captioning via BLIP (local, open-source)
    - Multimodal fusion: combines text + transcription + image
      observation + retrieved evidence into one context block for the LLM

Every model is lazy-loaded on first use and cached, so importing this
module has no cost if the corresponding modality is never used. Each
function fails soft: if a dependency or model is missing, it returns a
clear error message instead of raising, so the Streamlit app can keep
running with the remaining modalities.
"""

from __future__ import annotations

import tempfile
from pathlib import Path
from typing import Any, Dict, Optional

import config

_whisper_model = None
_blip_processor = None
_blip_model = None


# ----------------------------------------------------------------------
# Speech-to-text
# ----------------------------------------------------------------------
def _load_whisper():
    global _whisper_model
    if _whisper_model is not None:
        return _whisper_model
    import whisper  # openai-whisper package
    _whisper_model = whisper.load_model(config.WHISPER_MODEL)
    return _whisper_model


def transcribe_audio(uploaded_file) -> Dict[str, Any]:
    """
    Transcribes an uploaded audio file (Streamlit UploadedFile-like object)
    using Whisper. Returns {'ok': bool, 'text': str, 'error': Optional[str]}.
    """
    try:
        model = _load_whisper()
    except ImportError:
        return {
            "ok": False,
            "text": "",
            "error": (
                "Whisper is not installed. Run: pip install openai-whisper "
                "(and ensure ffmpeg is installed on your system)."
            ),
        }
    except Exception as e:
        return {"ok": False, "text": "", "error": f"Failed to load Whisper model: {e}"}

    try:
        suffix = Path(uploaded_file.name).suffix or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(uploaded_file.getbuffer())
            tmp_path = tmp.name

        result = model.transcribe(tmp_path)
        text = (result.get("text") or "").strip()
        return {"ok": True, "text": text, "error": None}
    except Exception as e:
        return {
            "ok": False,
            "text": "",
            "error": f"Transcription failed: {e}. Ensure ffmpeg is installed and the "
                     f"audio file is a valid WAV/MP3/M4A.",
        }
    finally:
        try:
            Path(tmp_path).unlink(missing_ok=True)
        except Exception:
            pass


# ----------------------------------------------------------------------
# Image captioning / observation
# ----------------------------------------------------------------------
def _load_blip():
    global _blip_processor, _blip_model
    if _blip_model is not None:
        return _blip_processor, _blip_model
    from transformers import BlipProcessor, BlipForConditionalGeneration
    _blip_processor = BlipProcessor.from_pretrained(config.VISION_MODEL)
    _blip_model = BlipForConditionalGeneration.from_pretrained(config.VISION_MODEL)
    return _blip_processor, _blip_model


def analyze_image(uploaded_file) -> Dict[str, Any]:
    """
    Generates a plain-language "observed from image" caption using BLIP.
    Returns {'ok': bool, 'observation': str, 'error': Optional[str]}.

    IMPORTANT: This is an image caption, not a diagnostic judgment. The
    caller must clearly label it as "Observed from image" and must not
    present it as a confirmed technical diagnosis.
    """
    try:
        processor, model = _load_blip()
    except ImportError:
        return {
            "ok": False,
            "observation": "",
            "error": (
                "Image captioning requires 'transformers' and 'torch'. "
                "Install requirements: pip install -r requirements.txt"
            ),
        }
    except Exception as e:
        return {"ok": False, "observation": "", "error": f"Failed to load vision model: {e}"}

    try:
        from PIL import Image
        image = Image.open(uploaded_file).convert("RGB")
        inputs = processor(image, return_tensors="pt")
        output_ids = model.generate(**inputs, max_new_tokens=40)
        caption = processor.decode(output_ids[0], skip_special_tokens=True).strip()

        observation = (
            f"Observed from image: {caption}." if caption else "Observed from image: no clear caption generated."
        )
        return {"ok": True, "observation": observation, "error": None}
    except Exception as e:
        return {"ok": False, "observation": "", "error": f"Image analysis failed: {e}"}


# ----------------------------------------------------------------------
# Multimodal fusion
# ----------------------------------------------------------------------
def fuse_context(
    user_text: Optional[str],
    speech_transcription: Optional[str],
    image_observation: Optional[str],
    retrieved_chunks: list,
) -> str:
    """
    Combines every available modality into one structured context block
    for the LLM prompt. Any modality may be missing -- the function still
    produces a usable context with whatever is present.
    """
    sections = []

    if user_text and user_text.strip():
        sections.append(f"USER TEXT DESCRIPTION:\n{user_text.strip()}")

    if speech_transcription and speech_transcription.strip():
        sections.append(f"SPEECH TRANSCRIPTION:\n{speech_transcription.strip()}")

    if image_observation and image_observation.strip():
        sections.append(f"IMAGE OBSERVATION (visual caption, not a diagnosis):\n{image_observation.strip()}")

    if retrieved_chunks:
        evidence_lines = []
        for i, chunk in enumerate(retrieved_chunks, start=1):
            evidence_lines.append(
                f"[Evidence {i}] Source: {chunk['source']} (chunk {chunk['chunk_id']}, "
                f"similarity {chunk['similarity']:.2f})\n{chunk['text']}"
            )
        sections.append("RETRIEVED TECHNICAL EVIDENCE:\n" + "\n\n".join(evidence_lines))
    else:
        sections.append("RETRIEVED TECHNICAL EVIDENCE:\nNone retrieved.")

    if not sections:
        return "No input was provided by the user."

    return "\n\n".join(sections)
