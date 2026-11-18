import { readFile } from "node:fs/promises";

const STATUSES = new Set(["working", "waiting", "idle", "offline"]);

// Reads the optional office-status.json that agents/harness write:
//   [{ "agent": "Tigplano", "status": "working", "task": "Drafting…" }]
// This is the richest status source; invalid entries are dropped, never fatal.
export function parseStatusFile(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (e) =>
        e &&
        typeof e.agent === "string" &&
        e.agent.length > 0 &&
        STATUSES.has(e.status),
    )
    .map((e) => ({
      agent: e.agent,
      status: e.status,
      task: typeof e.task === "string" ? e.task : "",
    }));
}

export async function readStatusFile(path) {
  if (!path) return [];
  try {
    return parseStatusFile(await readFile(path, "utf8"));
  } catch {
    return [];
  }
}
