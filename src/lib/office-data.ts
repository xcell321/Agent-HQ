import { createClient } from "./supabase/server";
import { mapOfficeData, type ActivityRow, type AgentRow, type ApprovalRow, type ProviderRow, type UsageRow } from "./office-map";
import type { OfficeData } from "./office-types";

// Server-side live data load for the signed-in user. RLS scopes every
// query to that user — there is no user filter to forget here.
export async function loadOfficeData(): Promise<{ userId: string; data: OfficeData } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [agents, activity, approvals, providers, usage, heartbeat] = await Promise.all([
    supabase.from("agents").select("id,name,role,kind,provider_id,status,current_task").order("name"),
    supabase.from("activity").select("id,agent_id,message,created_at").order("created_at", { ascending: false }).limit(12),
    supabase.from("approvals").select("id,agent_id,title,detail,state,created_at").eq("state", "pending").order("created_at", { ascending: false }),
    supabase.from("providers").select("id,name"),
    supabase.from("usage_events").select("provider_id,input_tokens,output_tokens").gte("created_at", since),
    supabase.from("heartbeats").select("last_seen_at").maybeSingle(),
  ]);

  return {
    userId: user.id,
    data: mapOfficeData({
      agents: (agents.data ?? []) as AgentRow[],
      activity: (activity.data ?? []) as ActivityRow[],
      approvals: (approvals.data ?? []) as ApprovalRow[],
      providers: (providers.data ?? []) as ProviderRow[],
      usage: (usage.data ?? []) as UsageRow[],
      heartbeatAt: heartbeat.data?.last_seen_at ?? null,
      nowMs: Date.now(),
    }),
  };
}
