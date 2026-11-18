import type { OfficeData } from "./office-types";

// DEMO DATA — design preview only. Every screen that renders this says so.
// Replaced by live Supabase data in M3; never present this as real activity.
export const demoOfficeData: OfficeData = {
  agents: [
    { id: "a1", name: "Tigplano", role: "Planner", status: "working", currentTask: "Drafting the Water Refilling plan", providerName: "FreeLLMAPI", desk: 0 },
    { id: "a2", name: "Tig-ayo", role: "Fixer", status: "working", currentTask: "Fixing audit findings, round 1", providerName: "Groq", desk: 1 },
    { id: "a3", name: "Scout", role: "Researcher", status: "idle", currentTask: "Standing by", providerName: "Gemini API", desk: 2 },
    { id: "a4", name: "Scribe", role: "Writer", status: "waiting", currentTask: "Draft ready — waiting for approval", providerName: "FreeLLMAPI", desk: 3 },
  ],
  activity: [
    { id: "e1", agentName: "Tig-ayo", message: "Patched the upload policy and re-ran the tests", minutesAgo: 1 },
    { id: "e2", agentName: "Bantay", message: "Reviewed Tigplano's output", minutesAgo: 4 },
    { id: "e3", agentName: "Tigplano", message: "Saved 3 notes to the shared memory", minutesAgo: 9 },
    { id: "e4", agentName: "Scribe", message: "Finished the weekly summary draft", minutesAgo: 16 },
  ],
  usage: [
    { providerName: "FreeLLMAPI", percent: 62, label: "18.2k tokens today" },
    { providerName: "Groq", percent: 34, label: "6.1k tokens today" },
    { providerName: "Gemini API", percent: 12, label: "2.3k tokens today" },
  ],
  providers: ["FreeLLMAPI", "Groq", "Gemini API", "OpenRouter"],
  approvals: [
    { id: "p1", title: "Publish Scribe's weekly summary draft", agentName: "Scribe" },
  ],
  pcOnline: true,
  lastSeenLabel: "just now",
};
