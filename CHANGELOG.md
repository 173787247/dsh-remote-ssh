# Changelog

## 0.1.1

- Tool: `remote_ssh_probe` — fixed read-only suite (uname/uptime/df/…), OS-aware; skips cmds not in allowCommands.
- Default allowlist adds `vm_stat` for macOS probes.

## 0.1.0

- Initial: `remote_ssh_status` / `remote_ssh_run` with host + command allowlists.
