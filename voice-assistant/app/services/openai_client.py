"""Thin wrapper around the OpenAI SDK used by the voice assistant."""

from __future__ import annotations

import logging
import math
from dataclasses import dataclass
from functools import lru_cache
from typing import Any, Iterable, Optional

from openai import OpenAI
from openai import OpenAIError

from ..config import get_settings


logger = logging.getLogger(__name__)


@dataclass
class TranscriptionResult:
    """Result returned by Whisper transcription."""

    text: str
    model: str
    language: Optional[str] = None
    confidence: Optional[float] = None


@dataclass
class LLMResult:
    """Result returned by GPT text reasoning."""

    text: str
    model: str


@dataclass
class SpeechResult:
    """Result returned by TTS synthesis."""

    audio_bytes: bytes
    model: str
    voice: str
    format: str


class OpenAIService:
    """Convenience service that aggregates the OpenAI workflows we need."""

    def __init__(
        self,
        api_key: str,
        stt_model: str,
        llm_model: str,
        tts_model: str,
        tts_voice: str,
        tts_format: str = "mp3",
    ) -> None:
        self._client = OpenAI(api_key=api_key)
        self._stt_model = stt_model
        self._llm_model = llm_model
        self._tts_model = tts_model
        self._tts_voice = tts_voice
        self._tts_format = tts_format

    @property
    def client(self) -> OpenAI:
        return self._client

    def transcribe_audio(
        self,
        *,
        audio_bytes: bytes,
        filename: str,
        language: Optional[str] = None,
        mime_type: Optional[str] = None,
    ) -> TranscriptionResult:
        """Send audio bytes to Whisper for transcription."""

        logger.debug(
            "Requesting transcription | filename=%s bytes=%s language=%s mime=%s",
            filename,
            len(audio_bytes),
            language,
            mime_type,
        )

        response = self._client.audio.transcriptions.create(
            model=self._stt_model,
            file=(filename, audio_bytes),
            language=language,
            response_format="verbose_json",
        )

        text = getattr(response, "text", "").strip()
        response_language = getattr(response, "language", None)
        segments = getattr(response, "segments", None)
        confidence = _estimate_confidence(segments)

        return TranscriptionResult(
            text=text,
            model=self._stt_model,
            language=response_language or language,
            confidence=confidence,
        )

    def generate_response(
        self,
        *,
        transcript: str,
        language: str,
        context: Optional[str] = None,
        model: Optional[str] = None,
    ) -> LLMResult:
        """Ask the GPT model to produce a concise, empathetic response."""

        target_model = model or self._llm_model

        logger.debug(
            "Generating response | model=%s language=%s transcript_snippet=%s",
            target_model,
            language,
            transcript[:80].replace("\n", " ") if transcript else "",
        )

        system_prompt = (
            "You are Zarai Dost, a caring agricultural expert helping Pakistani farmers. "
            "Respond with empathy, concise actionable steps, and mention relevant local context when known. "
            f"Always reply using language code '{language}'."
        )

        user_prompt = transcript if context is None else f"{context}\n\nFarmer: {transcript}"

        response = self._client.responses.create(
            model=target_model,
            input=[
                {
                    "role": "system",
                    "content": [
                        {"type": "input_text", "text": system_prompt},
                    ],
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": user_prompt},
                    ],
                },
            ],
        )

        text = _extract_text(response)
        if text.strip():
            return LLMResult(text=text, model=target_model)

        logger.warning("Responses API returned empty text; falling back to chat.completions")

        chat_response = self._client.chat.completions.create(
            model=target_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

        fallback_text = ""
        choices = getattr(chat_response, "choices", None)
        if choices:
            first_choice = choices[0]
            message = getattr(first_choice, "message", None)
            if message is None and hasattr(first_choice, "delta"):
                message = getattr(first_choice, "delta")
            if message is not None:
                fallback_text = getattr(message, "content", "") or ""

        if not fallback_text:
            logger.warning("Chat completions fallback also returned no content")

        return LLMResult(text=fallback_text.strip(), model=target_model)

    def synthesize_speech(
        self,
        *,
        text: str,
        language: str,
        voice: Optional[str] = None,
        audio_format: Optional[str] = None,
        model: Optional[str] = None,
    ) -> SpeechResult:
        """Convert assistant text into audio using the OpenAI TTS API."""

        target_voice = voice or self._tts_voice
        target_format = audio_format or self._tts_format
        target_model = model or self._tts_model

        logger.debug("Synthesising speech using model=%s voice=%s language=%s", target_model, target_voice, language)

        speech = self._client.audio.speech.create(
            model=target_model,
            voice=target_voice,
            input=text,
            response_format=target_format,
        )

        if hasattr(speech, "content") and isinstance(speech.content, (bytes, bytearray)):
            audio_bytes = bytes(speech.content)
        elif hasattr(speech, "data") and isinstance(speech.data, (bytes, bytearray)):
            audio_bytes = bytes(speech.data)
        elif hasattr(speech, "read"):
            audio_bytes = speech.read()
        else:  # pragma: no cover - fallback for SDK changes
            audio_bytes = bytes(speech)  # type: ignore[arg-type]

        logger.debug(
            "Synthesised speech bytes | model=%s voice=%s format=%s bytes=%s",
            target_model,
            target_voice,
            target_format,
            len(audio_bytes),
        )

        return SpeechResult(
            audio_bytes=audio_bytes,
            model=target_model,
            voice=target_voice,
            format=target_format,
        )


def _estimate_confidence(segments: Optional[Iterable[Any]]) -> Optional[float]:
    """Estimate transcription confidence from Whisper segments."""

    if not segments:
        return None

    confidences = []
    for segment in segments:
        avg_logprob = None
        if isinstance(segment, dict):
            avg_logprob = segment.get("avg_logprob")
        else:
            avg_logprob = getattr(segment, "avg_logprob", None)

        if avg_logprob is None:
            continue
        confidences.append(math.exp(avg_logprob))

    if not confidences:
        return None

    avg_confidence = sum(confidences) / len(confidences)
    return min(1.0, max(0.0, avg_confidence))


def _extract_text(response: Any) -> str:
    """Extract textual content from the Responses API output."""

    if response is None:
        return ""

    # v1.0+ exposes a convenience property.
    text = getattr(response, "output_text", None)
    if isinstance(text, str) and text.strip():
        return text.strip()

    # Fallback to inspect the output blocks or recursively walk the response.
    chunks: list[str] = []

    def _collect_text(value: object, *, _visited: set[int]) -> None:
        if value is None:
            return

        value_id = id(value)
        if value_id in _visited:
            return
        _visited.add(value_id)

        if isinstance(value, str):
            stripped = value.strip()
            if stripped:
                chunks.append(stripped)
            return

        if isinstance(value, dict):
            for key, nested in value.items():
                if key in {"text", "output_text", "value"}:
                    _collect_text(nested, _visited=_visited)
                else:
                    _collect_text(nested, _visited=_visited)
            return

        if isinstance(value, (list, tuple, set)):
            for item in value:
                _collect_text(item, _visited=_visited)
            return

        # Handle SDK-specific objects where attributes expose nested content.
        for attr in ("output", "content", "text", "output_text", "value", "data"):
            if hasattr(value, attr):
                try:
                    nested_value = getattr(value, attr)
                except Exception:  # pragma: no cover - defensive
                    continue
                _collect_text(nested_value, _visited=_visited)

    # Prefer the direct output list if available.
    output = getattr(response, "output", None)
    if output:
        _collect_text(output, _visited=set())
    else:
        # Fall back to model_dump / dict serialisations.
        serialisers = (
            "model_dump",
            "model_dump_json",
            "dict",
            "to_dict",
            "model_dump_recursive",
        )
        for name in serialisers:
            serializer = getattr(response, name, None)
            if callable(serializer):
                try:
                    dumped = serializer()
                    if isinstance(dumped, str):
                        try:
                            import json

                            dumped = json.loads(dumped)
                        except Exception:  # pragma: no cover - defensive
                            chunks.append(dumped.strip())
                            break
                    _collect_text(dumped, _visited=set())
                    break
                except Exception:  # pragma: no cover - defensive
                    continue

        if not chunks:
            _collect_text(response, _visited=set())

    if chunks:
        return "\n".join(chunk for chunk in chunks if chunk).strip()

    return ""


@lru_cache(maxsize=1)
def get_openai_service() -> OpenAIService:
    """Return a cached OpenAIService configured from settings."""

    settings = get_settings()
    return OpenAIService(
        api_key=settings.openai_api_key,
        stt_model=settings.stt_model,
        llm_model=settings.llm_model,
        tts_model=settings.tts_model,
        tts_voice=settings.tts_voice,
        tts_format=settings.tts_format,
    )


__all__ = [
    "OpenAIService",
    "TranscriptionResult",
    "LLMResult",
    "SpeechResult",
    "get_openai_service",
    "OpenAIError",
]


