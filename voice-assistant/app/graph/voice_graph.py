"""LangGraph workflow wiring the full voice loop."""

from __future__ import annotations

import asyncio
import logging
from typing import Optional, TypedDict

from langgraph.graph import END, StateGraph

from ..config import get_settings
from ..services.openai_client import (
    LLMResult,
    SpeechResult,
    TranscriptionResult,
    get_openai_service,
)


logger = logging.getLogger(__name__)


class VoiceGraphState(TypedDict, total=False):
    """Mutable state carried through the LangGraph workflow."""

    audio_bytes: bytes
    audio_filename: str
    audio_mime_type: str
    language: str
    transcript: str
    response_text: str
    tts_audio: bytes
    confidence: float
    stt_model: str
    llm_model: str
    tts_model: str
    tts_voice: str
    tts_format: str


def _transcribe(state: VoiceGraphState) -> VoiceGraphState:
    """Convert raw audio into text using Whisper."""

    settings = get_settings()
    language = state.get("language") or settings.default_language

    service = get_openai_service()
    transcription: TranscriptionResult = service.transcribe_audio(
        audio_bytes=state["audio_bytes"],
        filename=state.get("audio_filename", "farmer-query.wav"),
        language=language,
        mime_type=state.get("audio_mime_type"),
    )

    transcript = transcription.text or ""
    logger.debug("Transcribed farmer audio to '%s'", transcript)

    return {
        "transcript": transcript,
        "language": transcription.language or language,
        "confidence": transcription.confidence if transcription.confidence is not None else 0.0,
        "stt_model": transcription.model,
    }


def _generate_response(state: VoiceGraphState) -> VoiceGraphState:
    """Ask GPT to craft a contextual reply."""

    settings = get_settings()
    service = get_openai_service()

    transcript = state.get("transcript", "").strip()
    language = state.get("language", settings.default_language)

    if not transcript:
        logger.warning("Transcript is empty; returning apology message.")
        fallback = "معذرت، مجھے آپ کی آواز واضح طور پر سنائی نہیں دی۔ براہ کرم دوبارہ بولیں۔"
        return {
            "response_text": fallback,
            "llm_model": settings.llm_model,
        }

    llm_result: LLMResult = service.generate_response(
        transcript=transcript,
        language=language,
        model=settings.llm_model,
    )

    response_text = llm_result.text or ""
    logger.debug("LLM response produced text of length %s", len(response_text))

    return {
        "response_text": response_text,
        "llm_model": llm_result.model,
        "language": language,
    }


def _synthesize(state: VoiceGraphState) -> VoiceGraphState:
    """Generate TTS audio from the assistant's reply."""

    settings = get_settings()
    service = get_openai_service()

    response_text = state.get("response_text", "").strip()
    language = state.get("language", settings.default_language)

    if not response_text:
        logger.warning("Response text empty; sending fallback audio message.")
        response_text = "معذرت، اس وقت جواب تیار نہیں ہو سکا۔" if language.startswith("ur") else "Sorry, I could not prepare a reply."

    speech: SpeechResult = service.synthesize_speech(
        text=response_text,
        language=language,
        voice=settings.tts_voice,
        audio_format=settings.tts_format,
        model=settings.tts_model,
    )

    return {
        "tts_audio": speech.audio_bytes,
        "tts_model": speech.model,
        "tts_voice": speech.voice,
        "tts_format": speech.format,
        "language": language,
    }


# Build the LangGraph workflow once at import time.
_graph = StateGraph(VoiceGraphState)
_graph.add_node("transcribe", _transcribe)
_graph.add_node("generate_response", _generate_response)
_graph.add_node("synthesize", _synthesize)

_graph.set_entry_point("transcribe")
_graph.add_edge("transcribe", "generate_response")
_graph.add_edge("generate_response", "synthesize")
_graph.add_edge("synthesize", END)

_VOICE_WORKFLOW = _graph.compile()


def invoke_voice_graph(initial_state: VoiceGraphState) -> VoiceGraphState:
    """Run the workflow synchronously."""

    result = _VOICE_WORKFLOW.invoke(initial_state)
    merged: VoiceGraphState = {**initial_state, **result}
    return merged


async def run_voice_graph(initial_state: VoiceGraphState) -> VoiceGraphState:
    """Run the workflow without blocking the event loop."""

    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, invoke_voice_graph, initial_state)


__all__ = ["VoiceGraphState", "invoke_voice_graph", "run_voice_graph"]


