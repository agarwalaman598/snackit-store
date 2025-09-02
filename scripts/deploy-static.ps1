<#
deploy-static.ps1

Usage (PowerShell, run from repo or call this script):
  .\scripts\deploy-static.ps1

What it does:
- Runs `npm run build`
- Backs up existing `server/public` to `server/public-backup-<timestamp>`
- Mirrors `dist/public` into `server/public` using robocopy

Notes:
- This is Windows-focused. It uses robocopy for reliable copying.
- Review the script before running on production. Always back up first.
#>

Set-StrictMode -Version Latest
try {
    $ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
    Push-Location (Resolve-Path (Join-Path $ScriptRoot '..'))

    Write-Host 'Running frontend build (npm run build)...' -ForegroundColor Cyan
    $build = Start-Process -FilePath npm -ArgumentList 'run','build' -NoNewWindow -Wait -PassThru
    if ($build.ExitCode -ne 0) { throw "npm run build failed with exit code $($build.ExitCode)" }

    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $serverPublic = Join-Path (Get-Location) 'server\public'
    $backupFolder = Join-Path (Get-Location) "server\public-backup-$timestamp"

    if (Test-Path $serverPublic) {
        Write-Host "Backing up existing server/public to $backupFolder" -ForegroundColor Yellow
        robocopy "$serverPublic" "$backupFolder" /E | Out-Null
    } else {
        Write-Host 'No existing server/public folder found; skipping backup.' -ForegroundColor Yellow
    }

    $distPublic = Join-Path (Get-Location) 'dist\public'
    if (-not (Test-Path $distPublic)) {
        throw "Build output folder not found: $distPublic. Check your build step or output path."
    }

    Write-Host "Mirroring $distPublic -> $serverPublic" -ForegroundColor Cyan
    robocopy "$distPublic" "$serverPublic" /MIR /NFL /NDL /NJH /NJS /NP

    Write-Host 'Static assets deployed to server/public successfully.' -ForegroundColor Green
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location -ErrorAction SilentlyContinue
}
