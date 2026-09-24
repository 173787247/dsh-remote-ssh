import {
  listHosts,
  resolveHost,
  assertAllowedCommand,
  runSsh,
} from "./lib/ssh.js";

export const name = "dsh-remote-ssh";
export const inject = ["tools", "systemPrompt"];

function positive(v, d) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
}

export function apply(ctx, config = {}) {
  if (config.enabled === false) {
    console.log("[dsh-remote-ssh] disabled");
    return;
  }
  const timeoutMs = positive(config.timeoutMs, 60_000);
  const maxOutputChars = positive(config.maxOutputChars, 40_000);
  const hosts = listHosts(config.hosts);
  const allowCommands = Array.isArray(config.allowCommands) ? config.allowCommands.map(String) : [];
  const allowMutate = config.allowMutate === true;
  console.log(`[dsh-remote-ssh] hosts=${hosts.length} allowCommands=${allowCommands.length} allowMutate=${allowMutate}`);

  ctx.systemPrompt.section({
    name: "tool:remote-ssh",
    order: 140,
    text: "dsh-remote-ssh runs allowlisted commands on remote Unix/AIX/macOS via SSH. Prefer remote_ssh_status then remote_ssh_run with hostId. Never paste private keys. Mutating commands need allowMutate+confirm.",
  });

  ctx.tools.register({
    name: "remote_ssh_status",
    description: "List configured SSH hosts and optionally probe one with uname.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        hostId: { type: "string", description: "Probe this host; omit to only list" },
        probe: { type: "boolean", description: "default true when hostId set" },
      },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: JSON.stringify(v, null, 2) }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        const out = { ok: true, hosts, allowCommands, allowMutate };
        if (args.hostId || (hosts.length === 1 && args.probe !== false)) {
          const host = resolveHost(hosts, args.hostId);
          if (args.probe === false) {
            out.selected = host;
          } else {
            const argv = assertAllowedCommand(["uname", "-a"], allowCommands);
            const r = await runSsh(host, argv, { timeoutMs, maxOutputChars });
            out.probe = { host: host.id, ...r };
          }
        }
        return out;
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e), hosts };
      }
    },
    presentCall: () => ({ card: "generic", title: "remote ssh status" }),
    presentResult: (_a, r) => ({ card: "generic", title: "remote ssh status", content: r.content }),
  });

  ctx.tools.register({
    name: "remote_ssh_run",
    description: "Run an allowlisted argv on a configured SSH host (no shell). AIX/macOS/Linux.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["argv"],
      properties: {
        hostId: { type: "string" },
        argv: {
          type: "array",
          items: { type: "string" },
          description: "Executable + args, e.g. [\"df\",\"-h\"] or AIX [\"oslevel\",\"-s\"]",
        },
        confirm: { type: "boolean", description: "required with allowMutate for mutating cmds" },
      },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: v.ok === false ? v.error : v.stdout || JSON.stringify(v, null, 2) }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        const host = resolveHost(hosts, args.hostId);
        const argv = assertAllowedCommand(args.argv, allowCommands, {
          allowMutate,
          confirm: args.confirm === true,
        });
        const r = await runSsh(host, argv, { timeoutMs, maxOutputChars });
        return { ok: r.code === 0, hostId: host.id, os: host.os, ...r };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "remote ssh run" }),
    presentResult: (_a, r) => ({ card: "generic", title: "remote ssh run", content: r.content }),
  });
}
