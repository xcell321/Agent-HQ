import type { ActivityItem, Agent, AgentStatus, ProviderUsage } from "@/lib/office-types";

export const STATUS_STYLE: Record<AgentStatus, { dot: string; label: string }> = {
  working: { dot: "bg-amber-400 animate-pulse", label: "Working" },
  waiting: { dot: "bg-white animate-pulse", label: "Waiting" },
  idle: { dot: "bg-neutral-500", label: "Idle" },
  offline: { dot: "bg-neutral-700", label: "Offline" },
};

const panel =
  "rounded-2xl border border-neutral-800/80 bg-[#0b0906] p-5";
const panelTitle =
  "text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-500/90";

export function AgentList({ agents }: { agents: Agent[] }) {
  return (
    <section className={panel}>
      <h2 className={panelTitle}>Agents</h2>
      <ul className="mt-4 space-y-4">
        {agents.length === 0 && (
          <li className="text-xs text-neutral-500">No agents yet — they appear here when your PC reporter or an API agent reports in.</li>
        )}
        {agents.map((a) => (
          <li key={a.id} className="flex items-start gap-3">
            <span
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_STYLE[a.status].dot}`}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                {a.name}
                <span className="ml-2 text-xs font-normal text-neutral-500">
                  {a.role} · {STATUS_STYLE[a.status].label}
                </span>
              </p>
              <p className="truncate text-xs text-neutral-400">{a.currentTask}</p>
              {a.providerName && (
                <p className="mt-0.5 text-[11px] text-neutral-600">
                  via {a.providerName}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-5 border-t border-neutral-800/80 pt-3">
        <p className="text-xs text-neutral-400">
          <span className="font-semibold text-neutral-200">Bantay</span> —
          supervisor, reviews output before it counts as done.
        </p>
      </div>
    </section>
  );
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <section className={panel}>
      <h2 className={panelTitle}>Live activity</h2>
      <ul className="mt-4 space-y-3.5">
        {items.length === 0 && (
          <li className="text-xs text-neutral-500">No activity yet — when your reporter or an agent does something, it shows up here.</li>
        )}
        {items.map((it) => (
          <li key={it.id} className="text-sm">
            <p className="leading-5 text-neutral-300">
              <span className="font-semibold text-white">{it.agentName}</span>{" "}
              — {it.message}
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-600">
              {it.minutesAgo <= 1 ? "just now" : `${it.minutesAgo}m ago`}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function UsagePanel({ usage }: { usage: ProviderUsage[] }) {
  return (
    <section className={panel}>
      <h2 className={panelTitle}>Token usage — per API</h2>
      <div className="mt-4 space-y-4">
        {usage.length === 0 && (
          <p className="text-xs text-neutral-500">No API usage in the last 24h yet.</p>
        )}
        {usage.map((u) => (
          <div key={u.providerName}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium text-neutral-200">{u.providerName}</span>
              <span className="text-neutral-500">
                {u.label} · {u.percent}%
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
                style={{ width: `${u.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProviderBar({ providers }: { providers: string[] }) {
  return (
    <footer className="flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-800/80 bg-[#0b0906] px-5 py-4">
      <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500">
        Connected APIs
      </span>
      {providers.length === 0 && (
        <span className="text-xs text-neutral-600">No APIs connected yet</span>
      )}
      {providers.map((p) => (
        <span
          key={p}
          className="rounded-full border border-amber-900/60 px-3 py-1 text-xs font-medium text-amber-200/90"
        >
          {p}
        </span>
      ))}
    </footer>
  );
}
