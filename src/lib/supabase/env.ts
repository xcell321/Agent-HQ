// Supabase env access in one place. Returns null when the project is not
// configured yet, so pages can show an honest "setup needed" state instead
// of crashing before Edsiel's Supabase project exists.
export function supabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return supabaseEnv() !== null;
}
