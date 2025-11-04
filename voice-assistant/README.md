# Voice Assistant Microservice

Language-first assistant for Pakistani farmers that accepts spoken questions, reasons with OpenAI GPT-5 models, and replies with synthesized speech. Built with FastAPI, LangGraph, and the OpenAI Python SDK.

## Features
- Urdu-first voice loop: Whisper speech-to-text, GPT-5 reasoning, and OpenAI TTS.
- Stateless FastAPI endpoint (`/v1/voice-interact`) returning transcript, text reply, and base64 audio.
- Modular LangGraph workflow so additional tools (market prices, weather) can be slotted in later.
- Typed configuration via Pydantic settings with sensible defaults.

## Quickstart
```bash
cd @voice-assistant
\.venv\Scripts\activate   # Windows PowerShell
uv sync  # or: pip install -e .[dev]

uvicorn app.main:app --reload --port 8001
```

### Environment variables
Create `.env` (or configure your secrets manager):

```
OPENAI_API_KEY=sk-...
DEFAULT_LANGUAGE=ur
LLM_MODEL=gpt-5-mini
STT_MODEL=whisper-1
TTS_MODEL=gpt-4o-mini-tts
TTS_VOICE=alloy
TTS_FORMAT=wav
MAX_AUDIO_SECONDS=90
ALLOWED_AUDIO_MIME_TYPES=["audio/wav","audio/webm","audio/mpeg","audio/mp3","audio/ogg","audio/flac"]
```

## Example Request
```bash
curl -X POST "http://localhost:8001/v1/voice-interact?language=ur" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "audio=@sample.wav;type=audio/wav"
```

Response:
```json
{
  "language": "ur",
  "transcript": "آج ٹماٹر کا ریٹ کیا ہے؟",
  "response_text": "آج لاہور کی منڈی میں ٹماٹر تقریباً 220 روپے فی کلو فروخت ہو رہا ہے...",
  "audio_base64": "<base64-encoded-mp3>",
  "metadata": {
    "stt_model": "whisper-1",
    "tts_model": "gpt-4o-mini-tts",
    "tts_voice": "alloy",
    "tts_format": "wav",
    "confidence": 0.89
  }
}
```

## Project Layout
```
app/
  main.py              # FastAPI entry and router wiring
  routes.py            # API endpoints
  config.py            # Pydantic settings
  schemas.py           # Pydantic request/response models
  services/
    openai_client.py   # Thin OpenAI client wrapper
  graph/
    voice_graph.py     # LangGraph workflow definition
scripts/
  live_client.py      # Mic-to-assistant CLI helper
tests/
  test_graph.py        # Mocked pipeline sanity checks
```

## Real-time Testing

1. Install the extra audio/testing deps inside your venv:
   ```bash
   pip install .[client]
   ```
2. Ensure `TTS_FORMAT=wav` in `.env` for easiest playback.
3. Start the service: `uvicorn app.main:app --reload --port 8001`.
4. Run the helper: `python scripts/live_client.py --language ur`.
   - Press Enter, speak your question, wait for the assistant reply.
   - The script prints the transcript/text response and plays the synthesized audio. If a non-wav format is returned, it saves the file in `assistant_replies/`.

## Next Steps
- Integrate with core backend via internal HTTP call.
- Add caching for frequent price questions.
- Persist opt-in farmer profiles for personalization.


