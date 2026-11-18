# Agent HQ Reporter (runs on your PC)

The reporter is the engine-room half of Agent HQ. It runs on your own PC,
watches your CLI sessions, project repos, and harness memory folder, and
pushes status to Supabase so the office (web + phone) shows the real thing.
It also runs API agents through your own providers (FreeLLMAPI first; any
OpenAI-compatible API works).

## Setup (Windows)

1. Copy this `reporter/` folder anywhere on your PC (e.g. `C:\agent-hq-reporter`).
2. Copy `config.example.json` to `config.json` and fill it in:
   - `supabaseUrl` — your Agent-HQ project URL
   - `serviceRoleKey` — Project Settings → API → **service_role** key.
     This key is powerful and stays on your PC only. Never share it,
     never commit it.
   - `userId` — your Supabase user id (Authentication → Users in the dashboard)
   - `watchProjects` — the repos to watch (name + path)
   - `memoryDir` — a project's harness `memory/` folder (optional)
   - `statusFile` — optional `office-status.json` written by agents:
     `[{ "agent": "Tigplano", "status": "working", "task": "Drafting the plan" }]`
3. Run it: `node src/index.js` (Node 20+). It ticks every `intervalSeconds`.
4. Optional: make it start with Windows via Task Scheduler
   (action: `node`, arguments: the full path to `src/index.js`).

## What it reports

- **Heartbeat** every tick — the office shows "PC online · last seen …".
- **CLI workers** — Claude Code / OpenCode / Qoder / Freebuff sessions it
  sees running, shown as working agents.
- **Projects** — last commit time per watched repo; a new commit becomes
  an activity event.
- **Memory** — a newer newest note in `memoryDir` becomes an activity event.
- **Status file** — when present, its per-agent status/task wins over
  process inference (it is the richest source).

## API agents

`src/agent-runner.js` runs one task through one provider
(`POST {baseUrl}/chat/completions`) and returns the reply plus exact token
usage from the provider's response. Providers are config, not code:
FreeLLMAPI (`http://127.0.0.1:31415/v1`), OmniRoute
(`http://localhost:20128/v1`), Groq, Gemini API, OpenRouter — anything
OpenAI-compatible. Provider keys stored in Supabase are AES-256-GCM
ciphertext; the runner decrypts them with `keyEncryptionSecret` from your
local config.

## Tests

`npm test` (Node's built-in runner — parsing, key round-trip, provider
request/response shaping, and a full tick against a fake database).
