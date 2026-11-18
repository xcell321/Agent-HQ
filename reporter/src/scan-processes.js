import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

// Which executables count as which CLI worker in the office.
// Keys are lowercase process image names (Windows) / command names (POSIX).
export const CLI_PROCESSES = {
  "claude.exe": "Claude Code",
  claude: "Claude Code",
  "opencode.exe": "OpenCode",
  opencode: "OpenCode",
  "qoder.exe": "Qoder",
  qoder: "Qoder",
  "freebuff.exe": "Freebuff",
  freebuff: "Freebuff",
};

// Pure parser: tasklist /FO CSV output -> set of image names (lowercase).
export function parseTasklist(csv) {
  const names = new Set();
  for (const line of csv.split(/\r?\n/)) {
    const m = line.match(/^"([^"]+)"/);
    if (m) names.add(m[1].toLowerCase());
  }
  return names;
}

// Pure parser: `ps -eo comm` output -> set of command names (lowercase).
export function parsePs(out) {
  const names = new Set();
  for (const line of out.split(/\r?\n/).slice(1)) {
    const name = line.trim().toLowerCase();
    if (name) names.add(name);
  }
  return names;
}

// Returns the display names of CLI workers running right now.
export async function scanCliProcesses(platform = process.platform) {
  let names;
  if (platform === "win32") {
    const { stdout } = await run("tasklist", ["/FO", "CSV", "/NH"], { windowsHide: true });
    names = parseTasklist(stdout);
  } else {
    const { stdout } = await run("ps", ["-eo", "comm"]);
    names = parsePs(stdout);
  }
  const found = new Set();
  for (const [proc, label] of Object.entries(CLI_PROCESSES)) {
    if (names.has(proc)) found.add(label);
  }
  return [...found];
}
