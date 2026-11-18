import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTasklist, parsePs } from "../src/scan-processes.js";
import { parseGitLog } from "../src/scan-git.js";
import { parseStatusFile } from "../src/status-file.js";
import { encryptKey, decryptKey } from "../src/keys.js";
import { buildChatRequest, parseChatResponse, runApiAgent } from "../src/agent-runner.js";
import { tick } from "../src/index.js";

test("parseTasklist extracts image names", () => {
  const csv = '"claude.exe","1234","Console"\r\n"node.exe","555","Console"\r\n';
  const names = parseTasklist(csv);
  assert.ok(names.has("claude.exe"));
  assert.ok(names.has("node.exe"));
  assert.equal(names.size, 2);
});

test("parsePs skips the header and lowercases", () => {
  const names = parsePs("COMMAND\nClaude\nnode\n");
  assert.ok(names.has("claude"));
  assert.equal(names.size, 2);
});

test("parseGitLog splits timestamp and subject", () => {
  assert.deepEqual(parseGitLog("2026-11-18T20:00:00+08:00|feat: thing | with pipe"), {
    at: "2026-11-18T20:00:00+08:00",
    subject: "feat: thing | with pipe",
  });
  assert.equal(parseGitLog(""), null);
  assert.equal(parseGitLog("no-separator"), null);
});

test("parseStatusFile keeps valid entries, drops invalid ones", () => {
  const out = parseStatusFile(JSON.stringify([
    { agent: "Tigplano", status: "working", task: "Drafting" },
    { agent: "", status: "working" },
    { agent: "Ghost", status: "flying" },
    { agent: "Scribe", status: "waiting" },
    "junk",
  ]));
  assert.equal(out.length, 2);
  assert.equal(out[0].agent, "Tigplano");
  assert.equal(out[1].task, "");
  assert.deepEqual(parseStatusFile("not json"), []);
  assert.deepEqual(parseStatusFile("{}"), []);
});

test("key encrypt/decrypt round-trips", () => {
  const secret = "ab".repeat(32); // 64 hex chars = 32 bytes
  const ct = encryptKey("sk-test-123", secret);
  assert.notEqual(ct, "sk-test-123");
  assert.equal(decryptKey(ct, secret), "sk-test-123");
  assert.equal(decryptKey("", secret), "");
  assert.throws(() => decryptKey(ct, "short"), /64 hex/);
});

test("buildChatRequest targets /chat/completions with auth only when a key exists", () => {
  const withKey = buildChatRequest({ baseUrl: "http://127.0.0.1:31415/v1/", apiKey: "k", model: "m", rolePrompt: "r", task: "t" });
  assert.equal(withKey.url, "http://127.0.0.1:31415/v1/chat/completions");
  assert.equal(withKey.init.headers.Authorization, "Bearer k");
  const noKey = buildChatRequest({ baseUrl: "http://x/v1", apiKey: "", model: "m", task: "t" });
  assert.equal(noKey.init.headers.Authorization, undefined);
});

test("parseChatResponse reads content and usage, defaults to zero", () => {
  assert.deepEqual(
    parseChatResponse({ choices: [{ message: { content: "hi" } }], usage: { prompt_tokens: 5, completion_tokens: 7 } }),
    { content: "hi", promptTokens: 5, completionTokens: 7 },
  );
  assert.deepEqual(parseChatResponse({}), { content: "", promptTokens: 0, completionTokens: 0 });
});

test("runApiAgent reports lifecycle and result via a mock fetch", async () => {
  const events = [];
  const fetchImpl = async (url, init) => {
    assert.ok(url.endsWith("/chat/completions"));
    assert.equal(JSON.parse(init.body).model, "auto");
    return { ok: true, json: async () => ({ choices: [{ message: { content: "done" } }], usage: { prompt_tokens: 3, completion_tokens: 4 } }) };
  };
  const result = await runApiAgent({
    provider: { name: "FreeLLMAPI", baseUrl: "http://127.0.0.1:31415/v1", apiKey: "k" },
    model: "auto",
    rolePrompt: "You plan.",
    task: "Plan it",
    fetchImpl,
    events: { onStart: () => events.push("start"), onDone: () => events.push("done") },
  });
  assert.equal(result.content, "done");
  assert.equal(result.promptTokens, 3);
  assert.deepEqual(events, ["start", "done"]);
});

test("runApiAgent surfaces provider errors", async () => {
  const fetchImpl = async () => ({ ok: false, status: 429, text: async () => "rate limited" });
  await assert.rejects(
    runApiAgent({ provider: { name: "Groq", baseUrl: "https://api.groq.com/openai/v1", apiKey: "k" }, model: "m", task: "t", fetchImpl }),
    /Groq -> 429/,
  );
});

test("tick upserts heartbeat and watched projects with a fake db", async () => {
  const calls = [];
  const db = {
    upsert: async (table, rows, onConflict) => calls.push({ table, rows, onConflict }),
    insert: async (table, rows) => calls.push({ table, rows, insert: true }),
    select: async () => [],
  };
  const cfg = {
    userId: "user-1",
    watchProjects: [{ name: "Agent HQ", path: new URL("../..", import.meta.url).pathname }],
    memoryDir: "",
    statusFile: "",
  };
  const state = { seen: new Map() };
  const summary = await tick(cfg, db, state);
  const heartbeat = calls.find((c) => c.table === "heartbeats");
  assert.ok(heartbeat, "heartbeat upserted");
  assert.equal(heartbeat.rows[0].user_id, "user-1");
  const project = calls.find((c) => c.table === "projects");
  assert.ok(project, "project upserted from the real git repo");
  assert.equal(project.rows[0].name, "Agent HQ");
  assert.ok(summary.at);
});
