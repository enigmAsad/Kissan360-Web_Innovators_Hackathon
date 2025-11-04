"""Pydantic models shared across the voice assistant API."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Simple health check payload."""

    status: Literal["ok"] = "ok"


class VoiceInteractionMetadata(BaseModel):
    """Metadata returned alongside the assistant's voice response."""

    llm_model: str = Field(..., description="Model used for text reasoning.")
    stt_model: str = Field(..., description="Model used for transcription.")
    tts_model: str = Field(..., description="Model used for speech synthesis.")
    tts_voice: str = Field(..., description="Voice preset used for speech synthesis.")
    tts_format: str = Field(..., description="Audio container/codec returned for speech synthesis.")
    confidence: Optional[float] = Field(
        None,
        ge=0,
        le=1,
        description="Approximate transcription confidence expressed from 0-1.",
    )
    processing_ms: Optional[float] = Field(
        None,
        description="Total processing time in milliseconds.",
    )


class VoiceInteractionResponse(BaseModel):
    """Response returned when the assistant processes voice input."""

    language: str = Field(..., description="Language code used for the interaction.")
    transcript: str = Field(..., description="Recognised farmer utterance.")
    response_text: str = Field(..., description="Assistant reply as plain text.")
    audio_base64: Optional[str] = Field(
        None,
        description="Synthesised speech returned as base64-encoded audio.",
    )
    metadata: VoiceInteractionMetadata


class VoiceInteractionError(BaseModel):
    """Standardised error payload."""

    detail: str


