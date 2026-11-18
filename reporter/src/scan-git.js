import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

// Parses `git log -1 --format=%cI%x7C%s` output into { at, subject }.
export function parseGitLog(out) {
  const line = (out || "").trim();
  if (!line) return null;
  const sep = line.indexOf("|");
  if (sep < 0) return null;
  return { at: line.slice(0, sep), subject: line.slice(sep + 1) };
}

// Last commit of a repo, or null when it has none / is not a repo.
export async function scanGitProject(path) {
  try {
    const { stdout } = await run("git", ["-C", path, "log", "-1", "--format=%cI|%s"], { windowsHide: true });
    return parseGitLog(stdout);
  } catch {
    return null;
  }
}
