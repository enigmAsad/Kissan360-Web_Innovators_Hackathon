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
        temperature: float = 0.6,
        model: Optional[str] = None,
    ) -> LLMResult:
        """Ask the GPT model to produce a concise, empathetic response."""

        target_model = model or self._llm_model

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
            temperature=temperature,
            max_output_tokens=300,
        )

        text = _extract_text(response)
        return LLMResult(text=text, model=target_model)

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
            format=target_format,
        )

        if hasattr(speech, "content") and isinstance(speech.content, (bytes, bytearray)):
            audio_bytes = bytes(speech.content)
        elif hasattr(speech, "data") and isinstance(speech.data, (bytes, bytearray)):
            audio_bytes = bytes(speech.data)
        elif hasattr(speech, "read"):
            audio_bytes = speech.read()
        else:  # pragma: no cover - safety net for future SDK changes
            audio_bytes = bytes(speech)  # type: ignore[arg-type]

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

    # Fallback to inspect the output blocks.
    output = getattr(response, "output", None)
    if output:
        chunks: list[str] = []
        for item in output:
            content = getattr(item, "content", None)
            if not content:
                continue
            for block in content:
                block_type = block.get("type") if isinstance(block, dict) else getattr(block, "type", None)
                if block_type == "text":
                    text_value = block.get("text") if isinstance(block, dict) else getattr(block, "text", None)
                    if text_value:
                        chunks.append(str(text_value))
        if chunks:
            return "\n".join(chunks).strip()

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


