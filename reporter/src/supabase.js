// Minimal PostgREST client for the reporter. Uses the service-role key,
// which bypasses RLS — that key lives ONLY on the user's own PC.
export function createSupabaseClient({ supabaseUrl, serviceRoleKey, fetchImpl = fetch }) {
  const base = `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };

  async function request(path, options = {}) {
    const res = await fetchImpl(`${base}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Supabase ${options.method || "GET"} ${path} -> ${res.status} ${body.slice(0, 200)}`);
    }
    return res.status === 204 ? null : res.json().catch(() => null);
  }

  return {
    // Upsert rows on the given conflict target (comma-separated columns).
    upsert(table, rows, onConflict) {
      return request(`/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(rows),
      });
    },
    insert(table, rows) {
      return request(`/${table}`, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(rows),
      });
    },
    select(table, query) {
      return request(`/${table}?${query}`);
    },
  };
}
