# dsh-remote-ssh

> Optional companion to [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit). Not in `install.sh`.

用 **SSH** 把 Unix / IBM AIX / macOS 等旧世界主机接到 DeepSeek Harness（工具在 dsh 侧执行，默认只读 + 命令白名单）。

[English → README.en.md](./README.en.md)

## 兼容性

| 字段 | 值 |
|------|----|
| **插件** | `dsh-remote-ssh` **0.1.0** |
| **最低 dsh** | ≥ **0.1.2** |
| **最新验证** | 以 [dsh-wsl-kit 兼容性](https://github.com/173787247/dsh-wsl-kit#compatibility-2026-09) 为准（当前 **`0.1.7-alpha.2`**） |
| **套件档位** | 可选（远程桥接） |

## 工具

| 工具 | 作用 |
|------|------|
| `remote_ssh_status` | 列出配置主机；可选 uname 探测 |
| `remote_ssh_run` | 在指定 hostId 上跑白名单 argv（不走 shell） |

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-remote-ssh
```

在 profile 的 `cordis.patch.yml` 配置 `hosts` / `allowCommands`（见 `examples/hosts.cordis.snippet.yml`）。凭据走本机 ssh-agent（可与 [dsh-wsl-ssh-agent](https://github.com/173787247/dsh-wsl-ssh-agent) 配合）。

## 安全

- BatchMode SSH，禁止交互口令进聊天
- argv 禁止 shell 元字符与换行
- 破坏性命令需 allowMutate + confirm
- AIX 默认白名单含 oslevel / errpt / lsps / lparstat

## License

MIT
