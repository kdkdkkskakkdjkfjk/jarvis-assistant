"""Lazy, on-device speech recognition for Jarvis' explicit microphone action."""
from pathlib import Path

_model = None


def transcribe_audio(path: Path) -> str:
    global _model
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise RuntimeError("Lokale Sprachpakete fehlen. Führe einmalig SETUP-VOICE.ps1 aus.") from exc
    if _model is None:
        # CPU int8 avoids competing with the GTX 1060's limited 3 GB VRAM.
        _model = WhisperModel("base", device="cpu", compute_type="int8")
    segments, _info = _model.transcribe(str(path), language="de", vad_filter=True,
                                        beam_size=3, condition_on_previous_text=False)
    return " ".join(segment.text.strip() for segment in segments).strip()
