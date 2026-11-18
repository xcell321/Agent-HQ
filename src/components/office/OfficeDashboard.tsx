"use client";

import { useState } from "react";
import type { OfficeData } from "@/lib/office-types";
import OfficeScene from "./OfficeScene";
import { ActivityFeed, AgentList, ProviderBar, UsagePanel } from "./panels";

// The whole office screen. `mode` keeps the data honest:
// 'preview' = Supabase not connected yet; 'demo' = signed in, demo rows
// until the PC reporter lands in M3; 'live' = real data.
export default function OfficeDashboard({
  data,
  mode,
}: {
  data: OfficeData;
  mode: "preview" | "demo" | "live";
}) {
  const [approvals, setApprovals] = useState(data.approvals);
  const [decided, setDecided] = useState<string | null>(null);

  function decide(id: string, ok: boolean, title: string) {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    setDecided(
      mode === "live"
        ? `${ok ? "Approved" : "Rejected"}: ${title}`
        : `Demo only — nothing was sent. (${ok ? "Approve" : "Reject"}: ${title})`,
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* header */}
        <header className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
            Agent HQ
          </p>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
              data.pcOnline
                ? "border-neutral-700 text-neutral-300"
                : "border-red-900/70 text-red-300"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${data.pcOnline ? "bg-amber-400 animate-pulse" : "bg-red-500"}`}
            />
            {data.pcOnline
              ? `PC online · last seen ${data.lastSeenLabel}`
              : `PC offline · last seen ${data.lastSeenLabel}`}
          </span>
          {mode !== "live" && (
            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-black">
              {mode === "preview" ? "PREVIEW — NOT CONNECTED" : "DEMO DATA"}
            </span>
          )}
        </header>

        {/* approvals strip */}
        {approvals.length > 0 && (
          <section className="mt-5 rounded-2xl border border-amber-800/60 bg-amber-950/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-400">
              Needs your approval
            </p>
            <ul className="mt-3 space-y-3">
              {approvals.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 text-sm"
                >
                  <span className="text-neutral-200">
                    <span className="font-semibold text-white">{a.agentName}</span>{" "}
                    — {a.title}
                  </span>
                  <span className="ml-auto flex gap-2">
                    <button
                      onClick={() => decide(a.id, true, a.title)}
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-400"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => decide(a.id, false, a.title)}
                      className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:border-neutral-500"
                    >
                      Reject
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {decided && (
          <p className="mt-3 text-xs text-neutral-500" role="status">
            {decided}
          </p>
        )}

        {/* three zones */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[290px_minmax(0,1fr)_320px]">
          <div className="order-2 lg:order-1">
            <AgentList agents={data.agents} />
          </div>
          <section className="order-1 overflow-hidden rounded-2xl border border-neutral-800/80 bg-[#0b0906] lg:order-2">
            <OfficeScene agents={data.agents} />
          </section>
          <div className="order-3 space-y-5">
            <ActivityFeed items={data.activity} />
            <UsagePanel usage={data.usage} />
          </div>
        </div>

        <div className="mt-5">
          <ProviderBar providers={data.providers} />
        </div>
      </div>
    </main>
  );
}
