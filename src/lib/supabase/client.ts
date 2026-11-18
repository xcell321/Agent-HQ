import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";

// Browser-side Supabase client (uses the anon key; RLS is the security layer).
export function createClient() {
  const env = supabaseEnv();
  if (!env) throw new Error("Supabase is not configured yet.");
  return createBrowserClient(env.url, env.anonKey);
}
