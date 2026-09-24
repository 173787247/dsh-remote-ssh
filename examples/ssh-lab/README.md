# Local SSH lab for dsh-remote-ssh

Simulates two hosts inside Docker (reachable from WSL/Windows on `127.0.0.1`):

| Service | Port | Role |
|---------|------|------|
| `linux-lab` | 2222 | Real Linux (Debian) + OpenSSH |
| `aix-stub` | 2223 | Linux SSH **plus** fake `oslevel` / `errpt` / `lsps` / `lparstat` |

This is **not** real IBM AIX (needs Power). The stub is enough to exercise allowlists and tool flow. For production AIX use a real LPAR / IBM Cloud.

## Quick start (Windows Docker Desktop)

```powershell
cd dsh-remote-ssh\examples\ssh-lab
.\up.ps1
```

Or manually:

```powershell
.\gen-keys.ps1
docker compose up -d --build
ssh -i keys\id_ed25519 -p 2222 -o StrictHostKeyChecking=no dshprobe@127.0.0.1 "uname -a"
ssh -i keys\id_ed25519 -p 2223 -o StrictHostKeyChecking=no dshprobe@127.0.0.1 "oslevel -s"
```

## Wire into dsh

Copy the snippet from `hosts.snippet.yml` into the web profile `cordis.patch.yml` under `dsh-remote-ssh` config.

Point SSH at the lab key:

```sh
# WSL
export IDENTITY="$PWD/keys/id_ed25519"   # or absolute /mnt/c/... path
# ssh already used by the plugin; ensure agent has the key OR use ~/.ssh/config Host entries
```

Recommended `~/.ssh/config` (WSL):

```
Host dsh-linux-lab
  HostName 127.0.0.1
  Port 2222
  User dshprobe
  IdentityFile /mnt/c/Users/rchua/Desktop/AIFullStackDevelopment/dsh-remote-ssh/examples/ssh-lab/keys/id_ed25519
  StrictHostKeyChecking no

Host dsh-aix-stub
  HostName 127.0.0.1
  Port 2223
  User dshprobe
  IdentityFile /mnt/c/Users/rchua/Desktop/AIFullStackDevelopment/dsh-remote-ssh/examples/ssh-lab/keys/id_ed25519
  StrictHostKeyChecking no
```

Then set plugin hosts to `host: dsh-linux-lab` / `dsh-aix-stub` (port 22 via config Host).

## Mac (real hardware)

You already have Mac mini / MacBook — prefer those over stubs:

1. **CLI:** enable Remote Login, add your WSL pubkey, use `dsh-remote-ssh` with `os: darwin`.
2. **GUI:** on the Mac run `python3 companion/server.py` from [dsh-mac-companion](https://github.com/173787247/dsh-mac-companion), then point `DSH_MAC_COMPANION_URL` at the Mac LAN IP (or `ssh -L 18765:127.0.0.1:18765 user@mac`).

## Tear down

```powershell
docker compose down
```
