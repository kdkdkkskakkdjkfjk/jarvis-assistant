# JARVIS · Local Intelligence

Ein lokaler Windows-Assistent mit dem Startbildschirm aus der Bildreferenz:
mattschwarzes Raster, ein leuchtend blauer Jarvis-Ring und eine kleine Leiste
für Chat, Stimme, Visualizer, Hände und Gedächtnis. Die vorherige Jarvis-V5.1
liegt nur unter `backups/` und ist nicht mehr die aktive Oberfläche.

## Start

Voraussetzungen: Windows, Python 3.10+, OpenCode und Ollama. In der mitgelieferten
`opencode.json` ist `qwen3.5:4b` an die lokale Ollama-Adresse gebunden. Jarvis
startet keine Downloads. Falls das Modell fehlt, lade es selbst über Ollama.

1. ZIP in einen beschreibbaren Ordner entpacken.
2. `Start-Jarvis.bat` doppelklicken.
3. In der Mitte den Jarvis-Kern anklicken und eine Frage eingeben.

Der lokale Webserver bindet ausschließlich an `127.0.0.1:8765`. Alternativ im
Projektordner `python jarvis_server.py` ausführen. Jarvis und OpenCode beenden
mit `Strg+C` im Startfenster.

## Funktionen

- **Lokaler Chat:** OpenCode ruft Qwen über Ollama auf. Die Konfiguration erlaubt
  dem Agenten nur Lesezugriff innerhalb des Projekts. Shell, Dateischreiben,
  Subagenten, Websuche, Downloads und externe Aktionen sind gesperrt.
- **Stimme:** Mikrofon und Kamera starten nie automatisch. Voice anklicken,
  Browser-Mikrofon erlauben und die Taste zum Beenden der Aufnahme erneut
  drücken. Whisper transkribiert lokal auf der CPU; die Antwort kann mit der
  lokalen Windows-Stimme vorgelesen werden.
- **Face:** öffnet den mitgelieferten ai-visualizer. Jarvis sendet den echten
  Zustand idle/listening/thinking/speaking an dessen Signaldatei.
- **Hands:** öffnet das mitgelieferte Barehands-Board erst nach einer
  Bestätigung. Die Kamera wird von der geöffneten Seite erst angefragt, wenn du
  sie dort aktivierst. Handbewegungen und lokale Vault-Notizen bleiben im Browser
  bzw. auf diesem PC.
- **Memory:** liest ausgewählte Vault-Markdown-Dateien als Kontext. Eine Notiz
  wird nur nach Anzeige des genauen Textes und deiner Bestätigung gespeichert.

## Stimme einmalig einrichten

PowerShell im Projektordner öffnen und ausführen:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\SETUP-VOICE.ps1
```

Der Setup-Schritt installiert `faster-whisper` in `.venv`. Die Whisper-
Sprachdateien werden erst beim ersten Voice-Einsatz lokal geladen. Ohne Setup
bleiben Chat, Visualizer und Handtracking verfügbar.

## Gedächtnis

`vault/VAULT-INDEX.md`, `PROFILE.md` und `PREFERENCES.md` enthalten leere
Vorlagen; persönliche Angaben werden nicht vorbefüllt. Notizen können über die
Memory-Ansicht gesichert werden. OpenCode liest Inhalte nur als Referenzdaten.

## Tests

```powershell
python -m unittest discover -s tests -v
python -m py_compile jarvis_server.py voice_local.py
node --check web/app.js
```

## Archivierte Eingaben und Herkunft

`backups/fullstack-agent-main.zip` und
`backups/local-agent-windows-kit.zip` sind die zwei unveränderten Uploads.
`backups/previous-JARVIS-v5.1.zip` bewahrt die alte Jarvis-Ausgabe auf.
`fullstack-agent-main` ist im Wesentlichen ein Claude-Code-Installationsleitfaden,
keine fertige Desktop-Anwendung. Das Windows-Kit ist ein OpenCode/Ollama-
Einrichtungsskript mit einer experimentellen CLI-Voice-Bridge. Die Installer
und eingebetteten Promptdateien werden nicht automatisch ausgeführt.

Die aktiven Komponenten befinden sich unter `components/` und behalten ihre
eigenen Lizenzdateien. Vergleiche, Grenzen und Urheberangaben stehen in
[`docs/QUELLEN_UND_LIZENZEN.md`](docs/QUELLEN_UND_LIZENZEN.md). Das kombinierte
Projekt steht unter AGPL-3.0-or-later; die vollständige Lizenz liegt in `LICENSE`.
