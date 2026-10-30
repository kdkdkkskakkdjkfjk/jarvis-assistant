$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Get-Command py -ErrorAction SilentlyContinue)) { throw 'Python Launcher py fehlt. Installiere Python 3.12.' }
py -3.12 -m venv .venv
if ($LASTEXITCODE -ne 0) { throw 'Die Python-Umgebung konnte nicht erstellt werden.' }
$Python = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
& $Python -m pip install --upgrade pip
& $Python -m pip install faster-whisper
if ($LASTEXITCODE -ne 0) { throw 'faster-whisper konnte nicht installiert werden.' }
Write-Host 'Fertig. Jarvis neu starten. Beim ersten Mikrofonstart lädt Whisper base sein lokales Modell.' -ForegroundColor Green
