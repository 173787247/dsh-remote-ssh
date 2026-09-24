# Generate ed25519 keypair for the SSH lab (idempotent).
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$keyDir = Join-Path $here "keys"
New-Item -ItemType Directory -Force -Path $keyDir | Out-Null
$priv = Join-Path $keyDir "id_ed25519"
$pub = Join-Path $keyDir "id_ed25519.pub"
$auth = Join-Path $keyDir "authorized_keys"

if (-not (Test-Path $priv)) {
  ssh-keygen -t ed25519 -N '""' -f $priv -C "dsh-remote-ssh-lab"
  Write-Host "generated $priv"
} else {
  Write-Host "reuse $priv"
}

Copy-Item $pub $auth -Force
Write-Host "authorized_keys ready"
Get-Content $pub
