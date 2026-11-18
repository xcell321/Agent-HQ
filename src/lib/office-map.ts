import type { Agent, AgentStatus, OfficeData, ProviderUsage } from "./office-types";

// Row shapes as stored in Supabase (see supabase/migrations/0001_init.sql).
export interface AgentRow {
  id: string;
  name: string;
  role: string;
  kind: string;
  provider_id: string | null;
  status: AgentStatus;
  current_task: string;
}
export interface ActivityRow {
  id: number;
  agent_id: string | null;
  message: string;
  created_at: string;
}
export interface ApprovalRow {
  id: string;
  agent_id: string | null;
  title: string;
  detail: string;
  state: string;
  created_at: string;
}
export interface ProviderRow {
  id: string;
  name: string;
}
export interface UsageRow {
  provider_id: string;
  input_tokens: number;
  output_tokens: number;
}

export function timeAgo(iso: string, nowMs: number): string {
  const mins = Math.max(0, Math.floor((nowMs - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// Maps raw Supabase rows into the dashboard's OfficeData. Usage percent is
// each provider's share of the window's total tokens — a true number,
// computed from the user's own usage_events, never estimated.
export function mapOfficeData(input: {
  agents: AgentRow[];
  activity: ActivityRow[];
  approvals: ApprovalRow[];
  providers: ProviderRow[];
  usage: UsageRow[];
  heartbeatAt: string | null;
  nowMs: number;
}): OfficeData {
  const providerName = new Map(input.providers.map((p) => [p.id, p.name]));
  const agentName = new Map(input.agents.map((a) => [a.id, a.name]));

  // Desks: working/idle agents sit at sequential desks; waiting agents
  // stand by Bantay's platform and offline agents are not seated (-1).
  let nextDesk = 0;
  const agents: Agent[] = input.agents.map((a) => ({
    id: a.id,
    name: a.name,
    role: a.role,
    status: a.status,
    currentTask: a.current_task,
    providerName: a.provider_id ? (providerName.get(a.provider_id) ?? "") : "",
    desk: a.status === "working" || a.status === "idle" ? nextDesk++ : -1,
  }));

  const totals = new Map<string, number>();
  let grand = 0;
  for (const u of input.usage) {
    const t = (u.input_tokens || 0) + (u.output_tokens || 0);
    totals.set(u.provider_id, (totals.get(u.provider_id) ?? 0) + t);
    grand += t;
  }
  const usage: ProviderUsage[] = [...totals.entries()]
    .map(([id, tokens]) => ({
      providerName: providerName.get(id) ?? "Unknown provider",
      percent: grand > 0 ? Math.round((tokens / grand) * 100) : 0,
      label: `${formatTokens(tokens)} tokens · last 24h`,
    }))
    .sort((a, b) => b.percent - a.percent);

  const heartbeatMs = input.heartbeatAt ? new Date(input.heartbeatAt).getTime() : null;

  return {
    agents,
    activity: input.activity.map((a) => ({
      id: String(a.id),
      agentName: a.agent_id ? (agentName.get(a.agent_id) ?? "Agent") : "Reporter",
      message: a.message,
      minutesAgo: Math.max(0, Math.floor((input.nowMs - new Date(a.created_at).getTime()) / 60000)),
    })),
    usage,
    providers: input.providers.map((p) => p.name),
    approvals: input.approvals
      .filter((a) => a.state === "pending")
      .map((a) => ({
        id: a.id,
        title: a.title,
        agentName: a.agent_id ? (agentName.get(a.agent_id) ?? "Agent") : "Agent",
      })),
    // A heartbeat counts as "online" for 3 minutes; after that the office
    // honestly shows the PC as offline with its last-seen time.
    pcOnline: heartbeatMs !== null && input.nowMs - heartbeatMs < 3 * 60 * 1000,
    lastSeenLabel: heartbeatMs !== null ? timeAgo(input.heartbeatAt as string, input.nowMs) : "never",
  };
}
