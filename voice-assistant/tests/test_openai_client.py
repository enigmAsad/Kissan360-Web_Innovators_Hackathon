"""Tests for the OpenAI client helpers."""

from __future__ import annotations

from app.services.openai_client import _extract_text


class _ResponseWithOutputText:
    def __init__(self, text: str) -> None:
        self.output_text = text


class _ResponseWithOutputBlocks:
    def __init__(self, text: str) -> None:
        self.output = [
            {
                "type": "message",
                "content": [
                    {
                        "type": "output_text",
                        "text": text,
                    }
                ],
            }
        ]


class _ResponseWithModelDump:
    def __init__(self, text: str) -> None:
        self._text = text

    def model_dump(self) -> dict[str, object]:
        return {
            "output": [
                {
                    "type": "message",
                    "content": [
                        {
                            "type": "output_text",
                            "text": {
                                "value": self._text,
                            },
                        }
                    ],
                }
            ]
        }


def test_extract_text_prefers_output_text() -> None:
    response = _ResponseWithOutputText("  سلام!  ")

    assert _extract_text(response) == "سلام!"


def test_extract_text_handles_output_blocks() -> None:
    response = _ResponseWithOutputBlocks("موسم آج خشک رہے گا۔")

    assert _extract_text(response) == "موسم آج خشک رہے گا۔"


def test_extract_text_uses_model_dump_when_needed() -> None:
    response = _ResponseWithModelDump("بارش کا امکان کم ہے۔")

    assert _extract_text(response) == "بارش کا امکان کم ہے۔"

