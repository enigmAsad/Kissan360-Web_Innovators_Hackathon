"""FastAPI routes exposed by the voice assistant service."""

from __future__ import annotations

import base64
import logging
import time
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from .config import Settings, get_settings
from .graph.voice_graph import run_voice_graph
from .schemas import HealthResponse, VoiceInteractionError, VoiceInteractionMetadata, VoiceInteractionResponse
from .services.openai_client import OpenAIError


logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["voice-assistant"])


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Simple heartbeat endpoint."""

    return HealthResponse()


@router.post(
    "/v1/voice-interact",
    response_model=VoiceInteractionResponse,
    responses={
        status.HTTP_415_UNSUPPORTED_MEDIA_TYPE: {"model": VoiceInteractionError},
        status.HTTP_422_UNPROCESSABLE_ENTITY: {"model": VoiceInteractionError},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": VoiceInteractionError},
    },
)
async def voice_interact(
    audio: UploadFile = File(..., description="Farmer audio utterance."),
    language: Optional[str] = None,
    settings: Settings = Depends(get_settings),
) -> VoiceInteractionResponse:
    """Run the full voice assistant loop for the provided audio clip."""

    if audio.content_type not in settings.allowed_audio_mime_types:
        logger.debug("Rejected audio with MIME type %s", audio.content_type)
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported audio type. Please upload WAV, WEBM, MP3, OGG, or FLAC.",
        )

    raw_audio = await audio.read()
    if not raw_audio:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Audio clip is empty.")

    selected_language = (language or settings.default_language).lower()

    start_time = time.perf_counter()

    try:
        graph_result = await run_voice_graph(
            {
                "audio_bytes": raw_audio,
                "audio_filename": audio.filename or "farmer-query.wav",
                "audio_mime_type": audio.content_type or "audio/wav",
                "language": selected_language,
            }
        )
    except OpenAIError as exc:  # pragma: no cover - network path only
        logger.exception("OpenAI error while processing voice request: %s", exc)
        raise HTTPException(status_code=500, detail="OpenAI request failed. Please try again shortly.") from exc
    finally:
        await audio.close()

    processing_ms = (time.perf_counter() - start_time) * 1000

    transcript = graph_result.get("transcript", "").strip()
    response_text = graph_result.get("response_text", "").strip()
    tts_audio = graph_result.get("tts_audio")

    logger.info(
        "Voice interaction complete | transcript_chars=%s response_chars=%s processing_ms=%.2f",
        len(transcript),
        len(response_text),
        processing_ms,
    )

    audio_base64 = base64.b64encode(tts_audio).decode("utf-8") if tts_audio else None

    metadata = VoiceInteractionMetadata(
        confidence=graph_result.get("confidence"),
        llm_model=graph_result.get("llm_model", settings.llm_model),
        stt_model=graph_result.get("stt_model", settings.stt_model),
        tts_model=graph_result.get("tts_model", settings.tts_model),
        tts_voice=graph_result.get("tts_voice", settings.tts_voice),
        tts_format=graph_result.get("tts_format", settings.tts_format),
        processing_ms=processing_ms,
    )

    return VoiceInteractionResponse(
        language=graph_result.get("language", selected_language),
        transcript=transcript,
        response_text=response_text,
        audio_base64=audio_base64,
        metadata=metadata,
    )


