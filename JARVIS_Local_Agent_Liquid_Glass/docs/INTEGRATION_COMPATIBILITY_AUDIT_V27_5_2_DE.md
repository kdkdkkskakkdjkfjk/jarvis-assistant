# JARVIS V27.5.2 ↔ Mission Control – Integrations- und Verifikationsaudit

Stand: 22.11.2026  
Bezug: hochgeladenes Archiv `JARVIS_V27_5_2_INDEPENDENT_600_EXPANSION.zip` und Lovable-Projekt `JARVIS Mission Control` (Commit `63f77e470840742966121671a11fef882126759b`).

## 1. Tatsächliche Desktop-Core-Schnittstelle aus dem Archiv

Die bestehende Electron-App stellt über `electron/preload.js` eng begrenzte APIs bereit:
- `window.jarvisCore.getSnapshot()`
- `window.jarvisCore.runReadOnly(capability, arguments)`
- `window.jarvisCore.chat(message, context, image)`
- `window.jarvisCore.getDiagnostics()`
- `window.jarvisCore.listBackups()`
- `window.jarvisCore.createBackup()`

Das Preload gibt weder `ipcRenderer` noch beliebige Dateisystem-/Shell-Funktionen weiter. Der Core-API-Bearer-Token wird nicht an den Renderer gegeben.

In `electron/main.js` wird die private Core-API standardmäßig auf `127.0.0.1:8766` gestartet (überschreibbar mit `JARVIS_CORE_API_PORT`). Der Main-Prozess generiert pro Start einen zufälligen 32-Byte-Token, hält ihn nur im Main-Prozess und ruft die API mit `Authorization: Bearer …` auf. Die API verweigert den Start ohne mindestens 32 Zeichen langen `JARVIS_API_TOKEN`.

Die FastAPI-Schicht in `jarvis/api/app.py` stellt `GET /health` unauthentifiziert bereit; die Antwort enthält nur `status` und `uptime_s`. Alle `/api/v1/*`-Routen erfordern den Bearer-Token. CORS erlaubt im vorhandenen Stand nur `localhost`, `127.0.0.1` und den `file://`-Origin (`null`), nicht eine beliebige Lovable-Preview-/Produktionsdomain.

## 2. Inkompatibilität im ersten Lovable-Control-Center-Commit

Der neue Adapter `src/lib/jarvis/adapters/desktop-bridge.ts` erwartet derzeit:
- `window.jarvisBridge.getInfo()` mit einem Objekt `{ service: "jarvis-desktop-core", version, capabilities }`, oder
- `VITE_JARVIS_BRIDGE_URL` und einen GET-Aufruf auf `/health`, der genau dieses Objekt zurückgibt.

Diese beiden Formen sind im hochgeladenen V27.5.2-Desktop-Core nicht vorhanden:
- Das Preload exponiert `jarvisCore`, nicht `jarvisBridge`.
- `/health` liefert nicht das erwartete Schema.
- Der geschützte API-Port und sein zufälliger Token können nicht einfach im Browser angesprochen werden; die Lovable-Origin ist nicht in der vorhandenen CORS-Allowlist.
- Eine Browser-Umgebungsvariable oder ein ungeschützter zusätzlicher Port wäre keine sichere Lösung.

**Ergebnis:** Das Control Center zeigt in dieser Version den Desktop-Core erwartungsgemäß als nicht verbunden. Es darf nicht behauptet werden, dass der vorhandene V27.5.2-Core bereits gekoppelt ist.

## 3. Sichere Phase-2-Integrationsoptionen

### Bevorzugt: schmaler Electron-Preload-Adapter
- Das Web-Control-Center wird in einem vom bestehenden Electron-Main-Prozess kontrollierten Fenster/Origin eingebettet oder als lokales Frontend ausgeliefert.
- Der Preload ergänzt eine eng begrenzte `jarvisBridge.getInfo()`-Funktion, die intern nur `jarvisCore.getSnapshot()` verwendet und ein minimiertes, schema-validiertes Statusobjekt zurückgibt.
- Aktionen bleiben als benannte, einzeln validierte IPC-Methoden implementiert. Kein generischer IPC-Kanal, kein Token, keine frei wählbaren API-Routen.
- Der Main-Prozess kontrolliert den vertrauenswürdigen Renderer, prüft Sender/Origin und führt eine Capability-Allowlist plus Auditierung durch.

### Alternative für eine separate Browser-PWA
- Kein direkter Zugriff auf den vorhandenen Core-API-Token.
- Explizites Pairing über einen vom Nutzer bestätigten, kurzlebigen Einmalcode und einen lokalen Vermittlungsprozess.
- Der Core muss die PWA-Origin explizit und eng begrenzt zulassen; jede Sitzung erhält ein kurzlebiges, widerrufbares Capability-Token mit minimalen Lese-/Schreibrechten.
- Schutz vor CSRF, Replay, DNS-Rebinding, Host-/Origin-Spoofing, unaufgeforderten Netzwerkanfragen und Browser-Mixed-Content ist vor Implementierung festzulegen.
- Schreibende Geräte-/Desktop-Aktionen erfordern zusätzliche Bestätigung und einen Audit-Eintrag. Erst mit Negativtests für fremde Origins, fehlende Tokens, abgelaufene Tokens und nicht erlaubte Capabilities darf die Verbindung als bereit gelten.

**Nicht zulässig:** CORS auf `*` setzen, den bestehenden Core-Token an JavaScript geben, den API-Port ohne Authentifizierung öffnen oder `/health` zu einem Daten-/Befehlsendpunkt erweitern.

## 4. Verifikationsstand des Lovable-Control-Centers

Commit `63f77e470840742966121671a11fef882126759b` enthält eine erste modulare UI mit:
- zehn Moduldefinitionen und Capability-/Health-Metadaten;
- zentralem Permission-Gate;
- Browser-Opt-in für Bildschirm, Kamera und Geolocation;
- Session-Stopps, lokalem Aktivitätslog und lokalem Workspace;
- KI-, Desktop-, Home-Assistant- und Vision-Adapter-Verträgen ohne vorgetäuschte Verbindung;
- Routen für Mission Control, Assistant, PC Companion, Earth, Vision, Worlds, Smart Home, Workspace, Integrationen und Sicherheit.

Der Agent meldete beim Abschluss `out_of_credits`. Er bestätigte ausdrücklich, dass er nach der letzten Korrekturrunde weder Build noch Tests erneut ausgeführt hat. Im Projektbaum ist nur der Starter-Routingtest `src/test/app-routing.test.tsx` vorhanden; die geplanten Tests für Registry, Permission-Gating und lokalen Workspace-Speicher wurden noch nicht hinzugefügt. Die Checklisten-Logik ist im Workspace-Modul vorbereitet, aber in der Workspace-Route noch nicht sichtbar.

Der Projektstatus wurde als `needs_attention / out_of_credits` gemeldet. Die Preview-URL ist ein gespeicherter Projektlink, aber kein Nachweis eines erfolgreichen Builds, einer kompletten Browserprüfung oder eines produktiven Deployments.

## 5. Release-Paket des vorhandenen Desktop-Cores

Das hochgeladene Archiv enthält nur den Ordner `Jarvis_Core/`, während die deutsche Anleitung und einige vorhandene Regressionstests zusätzliche äußere Plattform-Einstiegspunkte erwarten. Ein ergänztes Release-Paket legt daher die Launcher-Verzeichnisse auf der erwarteten Paketebene an:
- `Start-Jarvis.bat`
- `Windows/Start-Jarvis.bat` und `Windows/Einrichten.bat`
- `Mac/Start-Jarvis.command`
- `Linux/Setup-Jarvis.sh` und `Linux/Start-Jarvis.sh`

Nach Ergänzung der Wrapper liefen in der ausgepackten Release-Struktur:
- Node UI-/Regressionstests: **379 bestanden, 0 fehlgeschlagen**;
- Python-Suite: **442 bestanden, 34 übersprungen, 2.186 Subtests bestanden**;
- `bash -n` für die macOS-/Linux-Launcher: erfolgreich;
- `py_compile` für ausgewählte API-/Runtime-Dateien: erfolgreich;
- ZIP-Integrität des ergänzten Pakets: erfolgreich.

Der Produktionsbuild `npm run build:desktop` wurde versucht, brach aber bei `verify:icons` ab, weil `node_modules/lucide-react` nicht installiert ist. Eine Netzwerk-/Registry-Installation konnte in dieser Umgebung nicht abgeschlossen werden. Ein echter Electron-Start, Hardwaretest und OS-spezifischer macOS-/Linux-Lauf sind damit nicht bestätigt.

## 6. Nächste Freigabekriterien

1. Lovable-Credits wieder verfügbar machen und die Bridge-Inkompatibilität mit dem tatsächlichen `window.jarvisCore`-Vertrag beheben.
2. Unit-/Integrationstests für Registry, Gate, Browser-Consent/Stop, lokale Speicherung, Export/Reset und Routing hinzufügen.
3. Build, Lint und Vitest vollständig grün ausführen; anschließend jeden Browser-Flow mit realem Fehler-/Abbruchpfad durchklicken.
4. Die Desktop-Bridge ausschließlich innerhalb des bestehenden Preload-/Main-Prozess-Sicherheitsmodells koppeln.
5. Erst danach einen lokalen Geräte-/Hardwaretest und einen separaten Cloud-/PWA-Pairing-Entwurf beginnen.

Bis diese Kriterien erfüllt sind, bleibt Mission Control eine **erste Control-Center-Ausbaustufe im Workspace**, keine produktiv integrierte Super-App.
