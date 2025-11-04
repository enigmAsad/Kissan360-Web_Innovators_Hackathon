"""CLI helper to record from the microphone and talk to the voice assistant."""

from __future__ import annotations

import argparse
import base64
import io
import json
import os
import wave
from pathlib import Path
from typing import Optional

import numpy as np
import requests
import simpleaudio as sa
import sounddevice as sd
from scipy.io import wavfile


DEFAULT_SAMPLE_RATE = 16_000
DEFAULT_DURATION = 8.0


def record_audio(seconds: float, sample_rate: int) -> np.ndarray:
    """Capture audio from the default microphone."""

    if seconds <= 0:
        raise ValueError("Recording duration must be positive.")

    print(f"Recording for {seconds:.1f}s...")
    recording = sd.rec(
        int(sample_rate * seconds),
        samplerate=sample_rate,
        channels=1,
        dtype="int16",
    )
    sd.wait()
    print("Recording complete.")
    return recording


def build_wav_bytes(data: np.ndarray, sample_rate: int) -> bytes:
    """Serialise the numpy audio buffer into a WAV byte stream."""

    buffer = io.BytesIO()
    wavfile.write(buffer, sample_rate, data)
    buffer.seek(0)
    return buffer.getvalue()


def call_assistant(
    *,
    audio_bytes: bytes,
    url: str,
    language: str,
    timeout: float,
) -> dict:
    """Send the recorded clip to the FastAPI service."""

    files = {"audio": ("question.wav", audio_bytes, "audio/wav")}
    response = requests.post(
        f"{url.rstrip('/')}/v1/voice-interact",
        params={"language": language},
        files=files,
        timeout=timeout,
    )
    response.raise_for_status()
    return response.json()


def _play_wav_bytes(wav_bytes: bytes) -> None:
    """Play raw WAV bytes via simpleaudio."""

    with wave.open(io.BytesIO(wav_bytes), "rb") as wf:
        audio_data = wf.readframes(wf.getnframes())
        play_obj = sa.play_buffer(
            audio_data,
            wf.getnchannels(),
            wf.getsampwidth(),
            wf.getframerate(),
        )
        play_obj.wait_done()


def _save_audio_file(audio_bytes: bytes, path: Path) -> None:
    """Persist the assistant audio to disk."""

    path.write_bytes(audio_bytes)
    print(f"Saved assistant audio to {path}")
    if os.name == "nt":  # Windows convenience: open the file in default player
        os.startfile(path)


def play_response(audio_b64: Optional[str], metadata: Optional[dict], save_dir: Optional[Path] = None) -> None:
    """Decode and play or store the assistant's audio reply."""

    if not audio_b64:
        print("No audio was returned by the assistant.")
        return

    audio_bytes = base64.b64decode(audio_b64)
    metadata = metadata or {}
    fmt = metadata.get("tts_format") or metadata.get("format") or "mp3"

    if fmt.lower() == "wav":
        try:
            _play_wav_bytes(audio_bytes)
            return
        except Exception as exc:  # pragma: no cover - playback errors
            print(f"Unable to play audio directly ({exc}); saving to disk instead.")

    # For non-WAV formats (mp3/ogg, etc.) save to disk so the user can play with their preferred player.
    if save_dir is None:
        save_dir = Path.cwd() / "assistant_replies"
        save_dir.mkdir(exist_ok=True)

    filename = f"assistant_reply.{fmt.lower()}"
    full_path = save_dir / filename
    _save_audio_file(audio_bytes, full_path)


def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Talk to the voice assistant from your terminal.")
    parser.add_argument("--url", default="http://localhost:8001", help="Base URL of the voice assistant service.")
    parser.add_argument("--language", default="ur", help="Language code to send along with the request.")
    parser.add_argument("--seconds", type=float, default=DEFAULT_DURATION, help="How long to record from the mic.")
    parser.add_argument(
        "--sample-rate",
        type=int,
        default=DEFAULT_SAMPLE_RATE,
        help="Sample rate for the recording.",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=120.0,
        help="HTTP timeout for the assistant request.",
    )
    parser.add_argument(
        "--save-dir",
        type=Path,
        help="Optional directory to save assistant audio responses when direct playback is not possible.",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> int:
    args = parse_args(argv)

    print("Press Enter, speak your question, and wait for the reply...")
    input("Ready? ")

    try:
        audio_data = record_audio(args.seconds, args.sample_rate)
    except Exception as exc:
        print(f"Failed to record audio: {exc}")
        return 1

    try:
        wav_bytes = build_wav_bytes(audio_data, args.sample_rate)
        payload = call_assistant(
            audio_bytes=wav_bytes,
            url=args.url,
            language=args.language,
            timeout=args.timeout,
        )
    except requests.HTTPError as exc:
        print(f"Assistant returned an HTTP error: {exc.response.status_code} {exc.response.text}")
        return 1
    except Exception as exc:
        print(f"Failed to reach assistant service: {exc}")
        return 1

    transcript = payload.get("transcript", "").strip()
    response_text = payload.get("response_text", "").strip()
    metadata = payload.get("metadata", {})

    print("\n---- Assistant Reply ----")
    print("Transcript:", transcript or "<empty>")
    print("Assistant:", response_text or "<empty>")
    print("Metadata:", json.dumps(metadata, ensure_ascii=False, indent=2))
    print("-------------------------\n")

    play_response(payload.get("audio_base64"), metadata, args.save_dir)
    return 0


if __name__ == "__main__":  # pragma: no cover - CLI entry point
    raise SystemExit(main())


