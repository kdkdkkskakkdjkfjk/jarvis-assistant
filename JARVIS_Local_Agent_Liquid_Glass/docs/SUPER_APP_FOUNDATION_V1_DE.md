# JARVIS Super-App – Fundament und Architektur V1

Stand: 22.11.2026  
Zielbranch: `feat/super-app-foundation-v1`

## 1. Produktgrenze

Die Super-App wird als ein zusammenhängendes Ökosystem aus drei Laufzeit-Ebenen aufgebaut:

1. **Local Core (bestehendes JARVIS V27.5.2):** Electron, Python-Core, lokale Fähigkeiten, Desktop- und Hardwarezugriff.
2. **Control Center (Phase 1):** responsive Browser-/PWA-Oberfläche für Mission Control, Workspace, Browser-native Consent-Flows und Verbindungsverwaltung.
3. **Cloud Services (später, optional):** Authentifizierung, Synchronisierung, Realtime, sichere serverseitige Provider und Backups.

Die Control-Center-Weboberfläche ersetzt keine Betriebssystem- oder Electron-APIs. Eine Browser-App kann ohne lokale Native Bridge keine zuverlässige Inventarisierung laufender Prozesse, Fenster, Monitore oder installierter Programme vornehmen.

## 2. Bestehender Funktionsbestand aus dem V27.5.2-Archiv

Das analysierte Archiv enthält bereits:
- Electron + React/Vite Frontend und Python-Core mit FastAPI-Komponenten;
- PC Companion mit explizitem Bildschirmfreigabe-Start und laufender Frame-Analyse über einen konfigurierten Bildanbieter;
- Earth/Cesium, OSM/CARTO-Fallback sowie Standort-/Navigationsmodule;
- Kamera- und Handtracking-Flows;
- Lern-, Fokus-, Workspace-, CAD-, Drucker- und Smart-Home-Module;
- Permission-/Risk-/Audit-/Capability-Runtime;
- zusätzliche Capability-Kataloge CAP, JX und NX.

**Korrekte Zählweise:** 600 NX-Einträge sind Funktionsverträge, die auf einer begrenzten Zahl deterministischer Datenroutinen arbeiten. Sie sind weder 600 separate KI-Modelle noch 600 Live-API-Integrationen.

## 3. Systemarchitektur

```text
                  ┌────────────────────────────────┐
                  │       JARVIS Control Center     │
                  │ React / TypeScript / PWA        │
                  │ Mission Control · Workspace     │
                  └───────────────┬────────────────┘
                                  │ typed adapter contracts
                  ┌───────────────▼────────────────┐
                  │    Capability / Module Layer    │
                  │ registry · health · permissions │
                  │ consent · audit · feature flags │
                  └───────┬───────────────┬────────┘
                          │               │
              ┌───────────▼─────┐   ┌─────▼────────────────┐
              │ Local Desktop   │   │ Optional Cloud Layer │
              │ Electron Bridge │   │ Auth · Sync · Realtime│
              │ Python Core     │   │ Edge Functions       │
              └─────────────────┘   └──────────────────────┘
```

### 3.1 Module Registry

Jedes Modul muss mindestens folgende Metadaten liefern:
- `id`: stabile, eindeutige Kennung;
- `title`, `description`, `category`;
- `capabilities[]`: deklarierte Funktionen;
- `requiredPermissions[]`: Berechtigungen, die erst zur Laufzeit nach Zustimmung angefragt werden;
- `adapterHealth`: `ready | local_only | needs_setup | unavailable | error`;
- `enabled`: benutzersteuerbarer Modulstatus;
- `platforms[]`: unterstützte Plattformen;
- `limitations[]`: sichtbare Grenzen.

Module dürfen nur Aktionen anbieten, die vom zugehörigen Adapter tatsächlich bereitgestellt werden.

### 3.2 Adapter-Vertrag

Adapter normalisieren Status und Fehler und trennen Capability von Ausführung. Der Browser-Client erhält niemals Service-Role-Schlüssel, private API-Schlüssel oder unvalidierte Betriebssystembefehle. Kritische Aktionen werden durch den lokalen Core nochmals autorisiert und auditiert.

## 4. Module und ehrlicher Ausführungsstatus

| Bereich | Phase-1-Verhalten | Erforderliche echte Integration für volle Funktion |
|---|---|---|
| KI-Assistent | Chat-Oberfläche, lokaler Verlauf, Provider-Status | echter Ollama-/Gemini-/anderer Provider-Adapter |
| PC Companion | `getDisplayMedia` nach Klick, sichtbarer Stream, Stop | Electron Bridge für Fenster-/Prozess-/Monitor-Metadaten und kontrollierte Aktionen |
| Vision Studio | Kamera-Opt-in und lokale Vorschau | Vision-Modell/MediaPipe Adapter; keine biometrische Identifizierung |
| Earth & Navigation | Geolocation-Consent und echte Browser-Koordinaten | Karten-/Routing-/Verkehrsanbieter; API-Lizenzen und Datenabdeckung |
| Smart Home | Adapter-Konfiguration und Verbindungsstatus | Home Assistant/MQTT mit sicherem Token-Speicher |
| Workspace | lokale Tasks und Notizen | optional Cloud-Sync nach Auth- und RLS-Einrichtung |
| 3D Worlds | Modulstruktur und WebGL-Fähigkeitsprüfung | Three.js-/WebGPU-/Asset-Pipeline |
| Kommunikation | Integrations- und Berechtigungsrahmen | zugelassener Messaging-/Calling-Provider |
| Sicherheit | Consent-, Permission- und Audit-UI | lokale OS-Speicher- und Cloud-Policies |

## 5. Sicherheits- und Datenschutzregeln

1. Kamera, Mikrofon, Bildschirm und Standort werden nie beim App-Start automatisch aktiviert.
2. Jede Freigabe hat Start, laufenden Status und explizites Stoppen/Widerrufen.
3. Kamera-/Screen-Aufnahmen werden nicht standardmäßig persistiert.
4. Gesichtserkennung zur Geräteentsperrung bleibt getrennt von allgemeiner Vision. Keine Gesichtsidentifizierung, Personenwiedererkennung oder Emotion-Inferenz in der Web-Phase.
5. Desktop-Aktionen erfordern eine enge Allowlist, sichtbaren Aktionsumfang, Bestätigung bei Auswirkungen und einen Audit-Eintrag.
6. Geheimnisse werden nur in einem geschützten OS-/Server-Secret-Store abgelegt. Kein `service_role`, Secret Key oder Provider-Key im Browser-Bundle.
7. Alle exponierten Supabase-Tabellen benötigen RLS und Least-Privilege-Policies. Client-Zugriff nutzt nur Publishable Keys.
8. Datenexport und Löschung lokaler Workspace-Daten werden als explizite Benutzeraktionen bereitgestellt.
9. Live-Daten werden nur mit Quelle und Abrufzeitpunkt angezeigt. Kein Fallback auf erfundene Messwerte.

## 6. Supabase-Zielbild (noch nicht provisioniert)

Für eine spätere Cloud-Schicht sind folgende Tabellenkandidaten vorgesehen:
- `profiles` – minimale Benutzerprofile, Auth-ID als Eigentümer;
- `module_preferences` – Modulstatus und individuelle Einstellungen;
- `workspace_tasks` und `workspace_notes` – private Workspace-Daten;
- `device_registrations` – registrierte, vom Nutzer kontrollierte Geräte;
- `integration_connections` – Metadaten über Provider-Verbindungen, keine Klartext-Secrets;
- `consent_events` – widerrufbare Einwilligungs- und Audit-Ereignisse.

Jede benutzerspezifische Tabelle erhält `user_id` als Eigentümerbezug, Indizes auf häufige Filter, RLS für SELECT/INSERT/UPDATE/DELETE mit `auth.uid() = user_id` und bei UPDATE sowohl `USING` als auch `WITH CHECK`. Service-Zugriffe laufen über Edge Functions mit serverseitigen Secrets. Dieses Zielbild wird erst nach Auswahl/Einrichtung eines konkreten Supabase-Projekts als Migration ausgeführt.

## 7. Phasenplan

### Phase 1 – Control Center Fundament
- Designsystem, Navigation, Mission-Control-Dashboard;
- Modul-Registry und typed Adapter Contracts;
- Task-/Notiz-Workspace mit lokaler Persistenz;
- reale Browser-Consent-Flows für Screen, Kamera und Standort;
- Security-/Permissions-Dashboard und Offline-/Unavailable-Zustände;
- Tests für Registry, Permission-Gating, Local Storage und Navigation.

### Phase 2 – Verbindung zum lokalen JARVIS-Core
- dokumentiertes Loopback-Protokoll mit Origin-Allowlist und kurzlebiger Sitzung;
- Health, Capability-Discovery und sichere read-only Statusabfragen;
- OS- und Gerätefunktionen ausschließlich über die Native Bridge;
- Request-Signierung, Replay-Schutz, Capability-Allowlist und Audit.

### Phase 3 – Cloud Layer
- Supabase-Projekt und Auth-Konfiguration;
- Datenbankschema, RLS-Policies, Advisors und Migrationstests;
- sicherer Secret-/Provider-Layer und optionale Synchronisierung;
- Realtime nur für ausgewählte, nutzereigene Daten.

### Phase 4 – echte Integrationen
- KI-Provider, Maps/Routing, Home Assistant, Kalender, Kommunikation;
- Health-/Freshness-Monitoring und Fehlermodi;
- Integrationstests gegen echte Konten/Hardware mit expliziter Einwilligung.

### Phase 5 – Plattformausbau
- installierbare PWA und mobile Browser-UX;
- native Windows/macOS/Linux Companion-Bridges;
- 3D-/AR-/VR-Funktionen je nach Gerät und Browserfähigkeit.

## 8. Qualitäts- und Release-Gates

- keine falschen Erfolgsmeldungen oder simulierten Live-Daten;
- Tests für jede Module-Registry-/Permission-Regel;
- Browser-API-Abbruch/Fehlerzustände abdecken;
- RLS-Tests pro Datentabelle und Supabase Security Advisor;
- Build sowie responsive, accessibility- und reduced-motion Checks;
- Hardware- und Live-Anbieter-Tests nur als bestanden markieren, wenn sie am echten Zielsystem ausgeführt wurden.

## 9. Ausgangsbericht des V27.5.2-Archivs

Der beiliegende Validierungsbericht vom 18.11.2026 nennt 366 bestandene UI-Regressionstests und 435 bestandene Python-Tests (34 übersprungen). Er weist zugleich darauf hin, dass der vollständige Windows-Produktionsbuild und reale Hardware-/Live-Tests auf dem Ziel-PC noch nicht bestätigt waren. Diese Unterscheidung bleibt verbindlich.
