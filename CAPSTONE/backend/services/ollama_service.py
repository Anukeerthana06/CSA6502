"""
Local Ollama Service for NyayaMithra
Handles communication with local Ollama HTTP API (default: http://127.0.0.1:11434).
Zero external/cloud LLM dependency. Safe error handling that never crashes FastAPI.
"""

import logging
from typing import Dict, Any, List, Optional
import httpx

from backend.config import OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_TIMEOUT

logger = logging.getLogger("nyayamithra.ollama")


class OllamaService:
    def __init__(self, base_url: str = OLLAMA_BASE_URL, default_model: str = OLLAMA_MODEL):
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model
        self.timeout = OLLAMA_TIMEOUT

    async def check_health(self) -> Dict[str, Any]:
        """
        Check if Ollama server is alive and inspect installed models.
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    model_found = any(
                        self.default_model in m or m.startswith(self.default_model.split(":")[0])
                        for m in models
                    )
                    return {
                        "status": "ok" if model_found else "warning",
                        "ollama_running": true if model_found else True,
                        "model": self.default_model,
                        "model_present": model_found,
                        "available_models": models,
                        "message": "Ollama is running and ready."
                        if model_found
                        else f"Ollama is running, but model '{self.default_model}' is not pulled yet. Run: `ollama pull {self.default_model}`",
                    }
                else:
                    return {
                        "status": "error",
                        "ollama_running": False,
                        "model": self.default_model,
                        "available_models": [],
                        "message": f"Ollama responded with HTTP status {resp.status_code}.",
                    }
        except httpx.ConnectError:
            return {
                "status": "error",
                "ollama_running": False,
                "model": self.default_model,
                "available_models": [],
                "message": "Ollama is not running. Start Ollama with `ollama serve` and try again.",
            }
        except httpx.TimeoutException:
            return {
                "status": "error",
                "ollama_running": False,
                "model": self.default_model,
                "available_models": [],
                "message": "Ollama health check timed out. Verify your local Ollama instance.",
            }
        except Exception as e:
            logger.warning(f"Unexpected error during Ollama health check: {e}")
            return {
                "status": "error",
                "ollama_running": False,
                "model": self.default_model,
                "available_models": [],
                "message": f"Could not connect to Ollama: {str(e)}",
            }

    async def generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_retries: int = 1,
    ) -> Dict[str, Any]:
        """
        Send a generation request to the local Ollama API.
        Returns:
            {"text": "...", "error": False} on success
            {"error": True, "message": "..."} on failure
        """
        target_model = model or self.default_model
        payload = {
            "model": target_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
            },
        }
        if system:
            payload["system"] = system

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                )

                if resp.status_code == 404:
                    return {
                        "error": True,
                        "message": f"Model '{target_model}' not found in Ollama. Please run `ollama pull {target_model}` in your terminal.",
                    }
                elif resp.status_code != 200:
                    return {
                        "error": True,
                        "message": f"Ollama returned HTTP error {resp.status_code}.",
                    }

                data = resp.json()
                response_text = data.get("response", "").strip()

                if not response_text:
                    return {
                        "error": True,
                        "message": "Ollama returned an empty response. Please verify the prompt and model status.",
                    }

                return {
                    "error": False,
                    "text": response_text,
                    "model": target_model,
                    "total_duration": data.get("total_duration", 0),
                }

        except httpx.ConnectError:
            return {
                "error": True,
                "message": "Ollama is not running. Start Ollama and try again. (Default URL: http://127.0.0.1:11434)",
            }
        except httpx.TimeoutException:
            return {
                "error": True,
                "message": f"Ollama generation timed out after {self.timeout}s. The local model may be busy or processing a heavy task.",
            }
        except Exception as e:
            logger.error(f"Error during Ollama generation: {e}")
            return {
                "error": True,
                "message": f"Failed to communicate with local Ollama service: {str(e)}",
            }


_ollama_service_instance: Optional[OllamaService] = None


def get_ollama_service() -> OllamaService:
    """Safe singleton getter for OllamaService."""
    global _ollama_service_instance
    if _ollama_service_instance is None:
        _ollama_service_instance = OllamaService()
    return _ollama_service_instance
