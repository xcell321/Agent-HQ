import { readFile } from "node:fs/promises";

// Loads and validates reporter/config.json. Throws with a plain message
// naming the missing field — the reporter must fail loudly at startup,
// never silently report nothing.
export async function loadConfig(path) {
  let raw;
  try {
    raw = await readFile(path, "utf8");
  } catch {
    throw new Error(`Config file not found: ${path} (copy config.example.json to config.json and fill it in)`);
  }
  const cfg = JSON.parse(raw);
  for (const field of ["supabaseUrl", "serviceRoleKey", "userId"]) {
    if (!cfg[field] || String(cfg[field]).includes("PUT-YOUR")) {
      throw new Error(`config.json: "${field}" is missing or still a placeholder`);
    }
  }
  return {
    intervalSeconds: 60,
    watchProjects: [],
    ...cfg,
  };
}
