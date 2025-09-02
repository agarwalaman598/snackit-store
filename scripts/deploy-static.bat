@echo off
REM deploy-static.bat
REM Usage: run from repository root: scripts\deploy-static.bat

setlocal enabledelayedexpansion
echo Running frontend build...
npm run build
if errorlevel 1 (
  echo npm run build failed
  exit /b 1
)

set TIMESTAMP=%DATE:~10,4%%DATE:~4,2%%DATE:~7,2%-%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

if exist server\public (
  echo Backing up server\public to server\public-backup-%TIMESTAMP%
  robocopy server\public server\public-backup-%TIMESTAMP% /E >nul
else
  echo No server\public folder found; skipping backup
)

if not exist dist\public (
  echo Build output dist\public not found
  exit /b 1
)

echo Mirroring dist\public -> server\public
robocopy dist\public server\public /MIR
echo Done.
