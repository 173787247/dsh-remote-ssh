# dsh-remote-ssh

> Optional companion to [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit). Not in `install.sh`.

Allowlisted **SSH** from the dsh host into Unix / IBM AIX / macOS.

[中文 → README.md](./README.md)

## Compatibility

| Field | Value |
|-------|-------|
| **Plugin** | `dsh-remote-ssh` **0.1.0** |
| **Minimum dsh** | ≥ **0.1.2** |
| **Latest verified** | See [dsh-wsl-kit Compatibility](https://github.com/173787247/dsh-wsl-kit#compatibility-2026-09) (currently **`0.1.7-alpha.2`**) |
| **Kit set** | optional (remote bridge) |

## Tools

| Tool | Role |
|------|------|
| `remote_ssh_status` | List hosts; optional uname probe |
| `remote_ssh_run` | Run allowlisted argv on hostId (no shell) |

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-remote-ssh
```

## License

MIT
