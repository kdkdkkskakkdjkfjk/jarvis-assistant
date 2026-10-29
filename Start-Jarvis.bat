@echo off
cd /d "%~dp0"
title Jarvis - lokaler Start
where py >nul 2>nul
if not errorlevel 1 goto usepy
python Start-Jarvis.py
goto finish
:usepy
py -3 Start-Jarvis.py
:finish
if errorlevel 1 (
  echo.
  echo Jarvis konnte nicht gestartet werden. Pruefe, ob Python 3 installiert ist.
  pause
)
