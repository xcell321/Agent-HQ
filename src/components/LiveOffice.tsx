"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapOfficeData, type ActivityRow, type AgentRow, type ApprovalRow, type ProviderRow, type UsageRow } from "@/lib/office-map";
import type { OfficeData } from "@/lib/office-types";
import OfficeDashboard from "./office/OfficeDashboard";

// Live office: starts from the server-loaded snapshot, then keeps itself
// current with Supabase Realtime. Any change to the user's agents,
// activity, approvals, or heartbeat triggers a refetch (RLS-scoped), so
// the screen never shows invented state. Approvals write the decision
// back to Supabase; v1 records decisions only — nothing executes them.
export default function LiveOffice({ userId, initialData }: { userId: string; initialData: OfficeData }) {
  const [data, setData] = useState<OfficeData>(initialData);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [agents, activity, approvals, providers, usage, heartbeat] = await Promise.all([
      supabase.from("agents").select("id,name,role,kind,provider_id,status,current_task").order("name"),
      supabase.from("activity").select("id,agent_id,message,created_at").order("created_at", { ascending: false }).limit(12),
      supabase.from("approvals").select("id,agent_id,title,detail,state,created_at").eq("state", "pending").order("created_at", { ascending: false }),
      supabase.from("providers").select("id,name"),
      supabase.from("usage_events").select("provider_id,input_tokens,output_tokens").gte("created_at", since),
      supabase.from("heartbeats").select("last_seen_at").maybeSingle(),
    ]);
    setData(
      mapOfficeData({
        agents: (agents.data ?? []) as AgentRow[],
        activity: (activity.data ?? []) as ActivityRow[],
        approvals: (approvals.data ?? []) as ApprovalRow[],
        providers: (providers.data ?? []) as ProviderRow[],
        usage: (usage.data ?? []) as UsageRow[],
        heartbeatAt: heartbeat.data?.last_seen_at ?? null,
        nowMs: Date.now(),
      }),
    );
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const channel = supabase
      .channel(`office-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "agents", filter: `user_id=eq.${userId}` }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "activity", filter: `user_id=eq.${userId}` }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "approvals", filter: `user_id=eq.${userId}` }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "heartbeats", filter: `user_id=eq.${userId}` }, refetch)
      .subscribe();
    // Freshness tick: keeps "last seen" and the online/offline chip honest
    // even when nothing changes.
    const timer = setInterval(refetch, 60_000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [userId, refetch]);

  async function decide(id: string, ok: boolean) {
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase
      .from("approvals")
      .update({ state: ok ? "approved" : "rejected", decided_at: new Date().toISOString() })
      .eq("id", id);
    if (error) refetch(); // resync if the write failed
  }

  return <OfficeDashboard data={data} mode="live" onDecide={decide} />;
}
