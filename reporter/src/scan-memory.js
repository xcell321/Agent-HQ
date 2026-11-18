import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

// The newest memory note in a harness memory/ folder: { title, at }.
// Title = first markdown heading, else the file name. Read-only.
export async function scanMemoryDir(dir) {
  if (!dir) return null;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  let newest = null;
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith(".md")) continue;
    const full = path.join(dir, e.name);
    const st = await stat(full);
    if (!newest || st.mtime > newest.mtime) newest = { full, name: e.name, mtime: st.mtime };
  }
  if (!newest) return null;
  let title = newest.name.replace(/\.md$/, "");
  try {
    const text = await readFile(newest.full, "utf8");
    const m = text.match(/^#\s+(.+)$/m);
    if (m) title = m[1].trim();
  } catch {
    // keep the file-name title
  }
  return { title, at: newest.mtime.toISOString() };
}
