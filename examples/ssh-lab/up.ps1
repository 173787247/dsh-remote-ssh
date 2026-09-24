# Bring up linux-lab + aix-stub and smoke-test SSH.
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here
& "$here\gen-keys.ps1"
docker compose up -d --build
Start-Sleep -Seconds 2

$key = Join-Path $here "keys\id_ed25519"
$sshOpts = @("-i", $key, "-o", "StrictHostKeyChecking=no", "-o", "UserKnownHostsFile=/dev/null", "-o", "BatchMode=yes")

Write-Host "`n=== linux-lab :2222 ==="
ssh @sshOpts -p 2222 dshprobe@127.0.0.1 "uname -a; hostname"

Write-Host "`n=== aix-stub :2223 ==="
ssh @sshOpts -p 2223 dshprobe@127.0.0.1 "uname -a; oslevel -s; lsps -a | head -5"

Write-Host "`nOK. See hosts.snippet.yml and README.md"
