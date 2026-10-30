# Quellen, Lizenzen und Integrationsgrenzen

Stand: 30. Oktober 2026. Die zwei ZIP-Dateien des Nutzers wurden als Dateien
und Quelltexte geprüft; Anweisungen in ihren `CLAUDE.md`-, `AGENTS.md`- und
Installationsdokumenten wurden nicht automatisch ausgeführt.

## Die hochgeladenen Archive

- `fullstack-agent-main.zip` ist ein AGPL-3.0-or-later-Installationswerkzeug für
  Claude Code. Es enthält README, Setup-Prompt, Start-/Update-Skripte und Lizenz,
  aber keine Laufzeit-App und nicht die eigentlichen Visualizer-/Handtracking-
  Repositories. Ein bestehender Claude-Agent wird nicht vorausgesetzt.
- `local-agent-windows-kit.zip` enthält `install-components.ps1`, README und
  `voice_bridge.py`. Das Skript richtet OpenCode/Ollama ein und klont externe
  Repositories. Die experimentelle Sprach-Bridge nimmt im Terminal auf und ruft
  `opencode run` auf; sie ist kein Web-Backend. Das Skript wurde nicht gestartet.
- Beide Original-ZIPs bleiben unverändert unter `backups/`; V5.1 ist dort als
  Rückfallkopie enthalten.

## Tatsächlich verwendete Quellen

| Komponente | Funktion im Jarvis | Lizenz und Herkunft |
|---|---|---|
| [ai-visualizer](https://github.com/jaredrhod/ai-visualizer) | Vier originale Gesichter, darunter Circuit Board. Der Jarvis-Server startet es erst beim Öffnen; Status wird über die Signaldatei geteilt. | AGPL-3.0-or-later. Quellordner, Lizenz und Upstream-README liegen in `components/ai-visualizer/`. Keine externe JS-Abhängigkeit für den Visualizer. |
| [barehands](https://github.com/jaredrhod/barehands) | Lokales Handtracking-Board mit Karten/Notizen und Gesten. Es läuft erst nach Klick; die Kamera bleibt opt-in. | AGPL-3.0-or-later. Quellordner, Lizenz und Upstream-README liegen in `components/barehands/`. MediaPipe und Three.js werden von der Upstream-Seite via CDN geladen. |
| [ai-memory-vault](https://github.com/jaredrhod/ai-memory-vault) | Markdown-Vault-Konzept, Index und lokale Notizen als begrenzter Kontext. | CC-BY-SA-4.0, kein Software-Lizenzmodell. Originaldokumentation und Lizenz liegen separat unter `components/ai-memory-vault/`; keine persönlichen Beispieldaten kopiert. |
| OpenCode + Ollama | Lokaler Agent und lokales Modell Qwen 3.5 4B. | Bereits auf dem Ziel-PC vorhanden. Offizielle [Provider-Dokumentation](https://opencode.ai/docs/providers/) beschreibt den lokalen Ollama-Endpunkt; die [Permissions-Dokumentation](https://opencode.ai/docs/permissions/) erlaubt explizites Deny für riskante Tools. |

Die Wrapper-Oberfläche, der loopback-only Jarvis-Server, die Voice-Upload-Route
und der lokale Whisper-Adapter sind neu für dieses Paket. Keine API-Schlüssel
oder Cloud-Modelle sind konfiguriert. Die OpenCode-Konfiguration blockiert
Schreibzugriffe, Shell, Webzugriff, Downloads und Subagenten; „Auto“ wird nicht
verwendet.

## Nicht als aktive Laufzeit übernommen

Die Claude-spezifische Fullstack-Installations-Conversation ist nicht mit
OpenCode kompatibel. Die mitgelieferte Voice-Bridge bleibt als Original im
Backup; Jarvis nutzt die gleichen Kernideen (lokales Whisper, OpenCode, lokale
Stimme) über die Browseroberfläche. Für den aktiven Sprachpfad ist kein zweiter
Voice-Agent nötig. Tasten-/Mausinteraktionen des Hands-Boards sind nicht
gleichbedeutend mit allgemeiner Desktop-Automation; Jarvis führt keine
beliebigen Modellbefehle aus.

Das frühere Jarvis-Programm, Wetter-/News-/Kalender-Ansichten und die Brown-
Glass-Farbvariante sind nicht in der aktiven Oberfläche. Sie wurden durch das
in der Bildreferenz gezeigte schwarze Raster und den blauen Orb ersetzt; V5.1
bleibt nur als ZIP-Backup.
