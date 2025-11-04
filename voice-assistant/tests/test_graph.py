"""Lightweight unit tests for the voice graph pipeline."""

from __future__ import annotations

import asyncio

import pytest

from app.graph.voice_graph import invoke_voice_graph
from app.services.openai_client import LLMResult, SpeechResult, TranscriptionResult


class _DummyOpenAIService:
    def transcribe_audio(self, **_: object) -> TranscriptionResult:
        return TranscriptionResult(
            text="آج ٹماٹر کا ریٹ کیا ہے؟",
            model="whisper-1",
            language="ur",
            confidence=0.91,
        )

    def generate_response(self, **_: object) -> LLMResult:
        return LLMResult(
            text="آج لاہور میں ٹماٹر تقریباً 220 روپے فی کلو ہے۔",
            model="gpt-5-mini",
        )

    def synthesize_speech(self, **_: object) -> SpeechResult:
        return SpeechResult(
            audio_bytes=b"fake-binary",
            model="gpt-4o-mini-tts",
            voice="alloy",
            format="mp3",
        )


@pytest.mark.asyncio
async def test_invoke_voice_graph(monkeypatch: pytest.MonkeyPatch) -> None:
    """The pipeline should surface transcript, response, and audio metadata."""

    monkeypatch.setattr("app.graph.voice_graph.get_openai_service", lambda: _DummyOpenAIService())

    initial_state = {
        "audio_bytes": b"binary-data",
        "audio_filename": "query.wav",
        "audio_mime_type": "audio/wav",
        "language": "ur",
    }

    # `invoke_voice_graph` is synchronous so call it in a thread to mimic API usage.
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, invoke_voice_graph, initial_state)

    assert result["transcript"].startswith("آج")
    assert "ٹماٹر" in result["response_text"]
    assert result["tts_audio"] == b"fake-binary"
    assert result["tts_model"] == "gpt-4o-mini-tts"
    assert result["llm_model"] == "gpt-5-mini"
    assert result["tts_format"] == "mp3"

