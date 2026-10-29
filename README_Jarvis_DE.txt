JARVIS ULTRA 5 – Überarbeitung deines vorhandenen v4-Projekts
===========================================================

START UNTER WINDOWS
1. Das gesamte ZIP in einen eigenen Ordner entpacken.
2. Python 3.10 oder neuer installieren, falls noch nicht vorhanden.
3. Start-Jarvis.bat doppelt anklicken. Das Terminal geöffnet lassen.
4. JARVIS öffnet sich unter http://localhost:8000 (oder dem nächsten freien Port).
Nicht nur die HTML-Datei öffnen: Datenabrufe und Schlüsselverwaltung benötigen
jetzt das lokale Backend. Linux/macOS: sh Start-Jarvis.sh

ERSTE SCHRITTE
- „Wien entdecken“ öffnet das echte Wiener Baukörpermodell.
- Ziehen: Karte bewegen. Mausrad: Zoom. Strg + Ziehen: drehen/neigen.
- Ein Gebäude anklicken: Datenquelle, tatsächliche/abgeleitete Höhe und Details.
- „Wie wird das Wetter morgen in Wien?“ öffnet die Wetteransicht.
- „Finde Lidl in Wien“ sucht reale Karteneinträge; öffentliche Quellen können langsam sein.
- „Aktuelle Nachrichten zu: Wien“ zeigt datierte RSS-Meldungen mit Links.
- „Suche Bilder: Wien“ zeigt Commons-Bilder mit Urheber-/Lizenzangaben.
- „Rechne 12 + 8 * 2“ rechnet lokal, ohne Wetter- oder Kartenfenster.
- ■ stoppt laufende Antworten und Sprachausgabe.

EINSTELLUNGEN
Gemini/Claude: API-Schlüssel und ein für dein Konto verfügbares Modell eintragen.
Wetter, Orte, Wiener Gebäude und Nachrichten benötigen keinen KI-Schlüssel.
Der konfigurierte KI-Anbieter wird einzeln aufgerufen; keine parallelen,
potenziell kostenpflichtigen Modellrennen mehr. Websuche nutzt bei Gemini
Google Search Grounding und kann nach Anbietertarif Kosten verursachen.

3D: Ohne ion-Token verwendet Wien sein offizielles Baukörpermodell; außerhalb
Wiens werden OSM-Polygone extrudiert. OSM-Höhen aus Geschosszahlen oder
Standardwerten sind ausdrücklich als geschätzt gekennzeichnet.
Optional: Cesium-ion-Lesetoken für World Terrain und OSM Buildings eintragen.
Nur einen auf benötigte Assets/localhost beschränkten öffentlichen Lesetoken
verwenden. Er muss im Kartenbrowser sichtbar sein; kein Admin-/Kontotoken.
Eine eigene 3D-Tiles-Asset-ID kann zusätzlich eingetragen werden. Danach neu laden.
Echte Fassadenfotos, Innenräume oder fotogrammetrische Modelle sind ohne
entsprechende lizenzierte Datenquelle NICHT enthalten.

Home Assistant: Basisadresse und Zugriffstoken eintragen. Statuswerte werden
live abgefragt. Nur Lichtaktionen sind freigegeben, mit Bestätigung am Gerät.
Es gibt keine direkte Google-Home-Steuerung allein über eine E-Mail-Adresse.
Systemwerte: Optional mit „python -m pip install psutil“ CPU/RAM/Prozesswerte
aktivieren. Ohne diese Erweiterung werden fehlende Messwerte klar ausgewiesen.

SPRACHE
Die vorhandene Browser-Spracherkennung und Piper-Stimme wurden beibehalten.
Chrome/Edge unterstützen die Browser-Spracherkennung typischerweise besser.
Für den Aufnahme-Fallback ist ein Gemini-Schlüssel erforderlich; vor dem ersten
Versenden einer Aufnahme wird nach deiner Zustimmung gefragt. Keine Sprache:
keine Transkription. Mikrofon/Soundhardware müssen auf deinem PC geprüft werden.

DATEN UND SICHERUNG
Der ursprüngliche Upload liegt unverändert unter original/ im ZIP.
Kalender, Stundenplan, Kameras, Notizen und Werkzeuge wurden beibehalten.
Zugangsdaten liegen außerhalb des Webordners unter %LOCALAPPDATA%\JarvisUltra
(Windows), sonst im Ordner JarvisUltra unter deinem Benutzerordner. Die Datei
config.json enthält Geheimnisse: nicht weitergeben. Es ist eine lokale Datei,
kein verschlüsselter Betriebssystem-Tresor. Umgebungsvariablen sind alternativ
möglich, siehe config.env.example. Alte Browser-Schlüssel werden nach erfolgreicher
Übernahme entfernt. Der Server bindet ausschließlich an 127.0.0.1.

HINTERGRUNDVORBEREITUNG UND TESTS
python scripts/prefetch.py
Bereitet einen kleinen Wiener Ausschnitt vor, mit Fortschrittsdatei und Wiederaufnahme.
Kein flächiger Europa-Download; maximal 64 Geometriekacheln pro Auftrag,
keine Rasterkarten-Vorabdownloads. --help zeigt die Optionen.
python -m unittest discover -s tests -v
node tests/test_intents.cjs
python scripts/check_services.py
Der letzte Befehl prüft echte Dienste. --ai führt optional einen KI-Aufruf aus.

DOKUMENTATION
Siehe docs/TECHNIK_UND_TESTS.md und docs/FORTSCHRITT.json für geprüfte Funktionen,
Grenzen, Datenquellen und offene Abnahmeschritte. Diese Version enthält keine
vollständig modellierte oder offline gespeicherte Kopie Europas.
