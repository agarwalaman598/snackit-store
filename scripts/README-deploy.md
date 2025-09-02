Deploy static frontend assets into server/public (Windows)
=====================================================

This folder contains helper scripts to build the frontend and copy the generated
static assets into `server/public` so the server can serve them.

Files
- `deploy-static.ps1` - PowerShell script. Recommended.
- `deploy-static.bat` - Batch file for cmd.exe.

Usage
1. From the repository root run (PowerShell):
   ```powershell
   .\scripts\deploy-static.ps1
   ```

2. Or using cmd.exe:
   ```cmd
   scripts\deploy-static.bat
   ```

What the scripts do
- Run `npm run build` to produce frontend build (Vite/esbuild)
- Backup existing `server/public` to `server/public-backup-<timestamp>` (if present)
- Mirror `dist/public` into `server/public` (robocopy `/MIR`)

Notes
- These scripts are Windows-focused. Adapt for macOS/Linux if needed.
- Always verify the build output folder (`dist/public`) and test locally before deploying.
- If your server serves static files from a different folder, update the destination path in the scripts.
