import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config.js";
import { createSupabaseClient } from "./supabase.js";
import { scanCliProcesses } from "./scan-processes.js";
import { scanGitProject } from "./scan-git.js";
import { scanMemoryDir } from "./scan-memory.js";
import { readStatusFile } from "./status-file.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const configPath = process.argv[2] || path.join(here, "..", "config.json");

// One reporter tick: heartbeat + scans -> Supabase upserts.
// Returns a summary for logging. Exported for tests; the loop below is thin.
export async function tick(cfg, db, state) {
  const now = new Date().toISOString();
  await db.upsert("heartbeats", [{ user_id: cfg.userId, last_seen_at: now, runner_version: "0.1.0" }], "user_id");

  // Agents: status file (richest) wins; running CLIs fill the rest.
  const fromFile = await readStatusFile(cfg.statusFile);
  const runningClis = await scanCliProcesses().catch(() => []);
  const agentRows = new Map();
  for (const label of runningClis) {
    agentRows.set(label, { user_id: cfg.userId, name: label, kind: "cli", status: "working", current_task: "Session open", status_updated_at: now });
  }
  for (const e of fromFile) {
    agentRows.set(e.agent, { user_id: cfg.userId, name: e.agent, kind: "named", status: e.status, current_task: e.task, status_updated_at: now });
  }
  if (agentRows.size > 0) {
    await db.upsert("agents", [...agentRows.values()], "user_id,name");
  }

  // Projects: report the last commit; a NEW commit becomes an activity event.
  const activity = [];
  for (const proj of cfg.watchProjects || []) {
    const last = await scanGitProject(proj.path);
    if (!last) continue;
    await db.upsert(
      "projects",
      [{ user_id: cfg.userId, name: proj.name, path: proj.path, last_activity_at: last.at, last_event: "commit" }],
      "user_id,name",
    );
    const key = `git:${proj.name}`;
    if (state.seen.get(key) && state.seen.get(key) !== last.at) {
      activity.push({ user_id: cfg.userId, message: `${proj.name}: new commit — ${last.subject}` });
    }
    state.seen.set(key, last.at);
  }

  // Memory: a NEW newest note becomes an activity event.
  const mem = await scanMemoryDir(cfg.memoryDir);
  if (mem) {
    if (state.seen.get("memory") && state.seen.get("memory") !== mem.at) {
      activity.push({ user_id: cfg.userId, message: `Memory updated — ${mem.title}` });
    }
    state.seen.set("memory", mem.at);
  }

  if (activity.length > 0) await db.insert("activity", activity);
  return { agents: agentRows.size, activity: activity.length, at: now };
}

async function main() {
  const cfg = await loadConfig(configPath);
  const db = createSupabaseClient(cfg);
  const state = { seen: new Map() };
  console.log(`Agent HQ reporter started (every ${cfg.intervalSeconds}s). Ctrl+C to stop.`);
  const run = async () => {
    try {
      const s = await tick(cfg, db, state);
      console.log(`[${s.at}] tick ok — agents: ${s.agents}, new activity: ${s.activity}`);
    } catch (err) {
      console.error("tick failed (will retry next interval):", err.message);
    }
  };
  await run();
  setInterval(run, cfg.intervalSeconds * 1000);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    console.error("Reporter failed to start:", err.message);
    process.exit(1);
  });
}
