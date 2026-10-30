@echo off
setlocal
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python 3 wurde nicht gefunden. Installiere Python 3.12 und aktiviere PATH.
  pause
  exit /b 1
)
python -c "import sys; raise SystemExit(0 if sys.version_info >= (3,10) else 1)"
if errorlevel 1 (
  echo Jarvis braucht Python 3.10 oder neuer.
  pause
  exit /b 1
)
python jarvis_server.py
if errorlevel 1 pause
