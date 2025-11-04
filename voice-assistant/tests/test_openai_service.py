"""Tests for OpenAIService high-level behaviours."""

from __future__ import annotations

from app.services.openai_client import LLMResult, OpenAIService


class _EmptyResponsesOutput:
    output_text = ""

    def model_dump(self) -> dict[str, object]:
        return {}


class _ChatMessage:
    def __init__(self, content: str) -> None:
        self.content = content


class _ChatChoice:
    def __init__(self, content: str) -> None:
        self.message = _ChatMessage(content)


class _ChatResponse:
    def __init__(self, content: str) -> None:
        self.choices = [_ChatChoice(content)]


class _StubResponses:
    def __init__(self, response: object) -> None:
        self._response = response
        self.last_kwargs: dict[str, object] | None = None

    def create(self, **kwargs: object) -> object:
        self.last_kwargs = kwargs
        return self._response


class _StubChatCompletions:
    def __init__(self, response: object) -> None:
        self._response = response
        self.last_kwargs: dict[str, object] | None = None

    def create(self, **kwargs: object) -> object:
        self.last_kwargs = kwargs
        return self._response


class _StubClient:
    def __init__(self, responses_payload: object, chat_payload: object) -> None:
        self.responses = _StubResponses(responses_payload)
        self.chat = type("Chat", (), {"completions": _StubChatCompletions(chat_payload)})()


def _build_service(stub_client: object) -> OpenAIService:
    service = OpenAIService.__new__(OpenAIService)
    service._client = stub_client  # type: ignore[attr-defined]
    service._stt_model = "whisper-1"  # type: ignore[attr-defined]
    service._llm_model = "gpt-5-mini"  # type: ignore[attr-defined]
    service._tts_model = "gpt-4o-mini-tts"  # type: ignore[attr-defined]
    service._tts_voice = "alloy"  # type: ignore[attr-defined]
    service._tts_format = "mp3"  # type: ignore[attr-defined]
    return service


def test_generate_response_falls_back_to_chat_completion() -> None:
    stub_client = _StubClient(_EmptyResponsesOutput(), _ChatResponse("فصل کی نکاسی آب پر توجہ دیں۔"))
    service = _build_service(stub_client)

    result: LLMResult = service.generate_response(transcript="فصل پر کیڑا ہے", language="ur")

    assert result.text == "فصل کی نکاسی آب پر توجہ دیں۔"
    assert stub_client.responses.last_kwargs is not None
    assert "max_output_tokens" not in stub_client.responses.last_kwargs
    assert stub_client.chat.completions.last_kwargs is not None
    assert "max_tokens" not in stub_client.chat.completions.last_kwargs

