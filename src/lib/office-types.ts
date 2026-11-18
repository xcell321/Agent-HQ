// Shared shapes for the office. The dashboard renders ONLY this data —
// demo data today (clearly labeled), live Supabase rows from M3 onward.

export type AgentStatus = "working" | "waiting" | "idle" | "offline";

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  currentTask: string;
  providerName: string; // API this agent is bound to ('' for supervisor)
  desk: number; // desk slot in the scene (0-based); -1 = not seated
}

export interface ActivityItem {
  id: string;
  agentName: string;
  message: string;
  minutesAgo: number;
}

export interface ProviderUsage {
  providerName: string;
  percent: number; // 0-100 of the period budget, as reported by the runner
  label: string; // e.g. '12.4k tokens today'
}

export interface Approval {
  id: string;
  title: string;
  agentName: string;
}

export interface OfficeData {
  agents: Agent[];
  activity: ActivityItem[];
  usage: ProviderUsage[];
  providers: string[]; // connected provider names for the bottom bar
  approvals: Approval[];
  pcOnline: boolean;
  lastSeenLabel: string; // e.g. 'just now', '14:02'
}
