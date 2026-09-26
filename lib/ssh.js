import { spawn } from "node:child_process";
import { basename } from "node:path";

export function listHosts(hosts) {
  return (Array.isArray(hosts) ? hosts : [])
    .map((h) => ({
      id: String(h.id || h.host || ""),
      host: String(h.host || ""),
      user: h.user ? String(h.user) : undefined,
      port: h.port != null ? Number(h.port) : 22,
      os: String(h.os || "unix"),
      identityFile: h.identityFile ? String(h.identityFile) : undefined,
    }))
    .filter((h) => h.id && h.host);
}

export function resolveHost(hosts, id) {
  const list = listHosts(hosts);
  if (!list.length) throw new Error("no hosts configured — set config.hosts in cordis.patch.yml");
  if (!id) {
    if (list.length === 1) return list[0];
    throw new Error(`hostId required; known: ${list.map((h) => h.id).join(", ")}`);
  }
  const hit = list.find((h) => h.id === id);
  if (!hit) throw new Error(`unknown hostId=${id}; known: ${list.map((h) => h.id).join(", ")}`);
  return hit;
}

export function assertAllowedCommand(argv, allowCommands, { allowMutate = false, confirm = false } = {}) {
  const args = Array.isArray(argv) ? argv.map(String) : [];
  if (!args.length) throw new Error("argv required");
  if (args.some((a) => a.includes("\n") || a.includes("\r"))) throw new Error("newlines in argv blocked");
  for (const a of args) {
    if (/[;&|`$<>]/.test(a)) throw new Error(`shell metacharacter blocked in arg: ${a}`);
  }
  const cmd = basename(args[0]);
  const allow = new Set((allowCommands || []).map(String));
  if (!allow.has(cmd) && !allow.has(args[0])) {
    throw new Error(`command not in allowCommands: ${cmd}`);
  }
  const mutateRe = /^(rm|mv|cp|chmod|chown|kill|reboot|shutdown|mkfs|dd|crontab|useradd|passwd)$/;
  if (mutateRe.test(cmd) && !(allowMutate && confirm)) {
    throw new Error(`mutating command blocked without allowMutate+confirm: ${cmd}`);
  }
  return args;
}

/** Read-only probe argv lists; skip entries whose cmd is not allowlisted. */
export function probeSuite(osHint = "unix") {
  const os = String(osHint || "unix").toLowerCase();
  const common = [
    ["uname", "-a"],
    ["hostname"],
    ["uptime"],
    ["df", "-h"],
  ];
  if (os === "aix") {
    return [...common, ["oslevel", "-s"], ["errpt", "-a"], ["lsps", "-a"]];
  }
  if (os === "darwin" || os === "macos" || os === "mac") {
    return [...common, ["sw_vers"], ["vm_stat"]];
  }
  return [...common, ["free", "-m"], ["ps", "-eo", "pid,comm", "--sort=-pcpu"]];
}

export function runSsh(host, argv, { timeoutMs = 60_000, maxOutputChars = 40_000 } = {}) {
  const target = host.user ? `${host.user}@${host.host}` : host.host;
  const sshArgs = [
    "-o",
    "BatchMode=yes",
    "-o",
    "ConnectTimeout=10",
    "-o",
    "StrictHostKeyChecking=accept-new",
    "-p",
    String(host.port || 22),
  ];
  if (host.identityFile) {
    sshArgs.push("-i", String(host.identityFile));
    sshArgs.push("-o", "IdentitiesOnly=yes");
  }
  sshArgs.push(target, "--", ...argv);
  return new Promise((resolve, reject) => {
    const child = spawn("ssh", sshArgs, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const t = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("ssh timeout"));
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      if (stdout.length > maxOutputChars * 2) child.kill("SIGKILL");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (e) => {
      clearTimeout(t);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(t);
      resolve({
        code,
        stdout: stdout.slice(0, maxOutputChars),
        stderr: stderr.slice(0, 4000),
        truncated: stdout.length > maxOutputChars,
        target,
        argv,
      });
    });
  });
}
