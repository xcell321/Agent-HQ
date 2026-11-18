import { isSupabaseConfigured } from "@/lib/supabase/env";
import { demoOfficeData } from "@/lib/demo-data";
import OfficeDashboard from "@/components/office/OfficeDashboard";

// Office home. Until the PC reporter lands (M3) this renders clearly
// labeled demo data; before Supabase is connected it is a labeled preview.
export default function Home() {
  const mode = isSupabaseConfigured() ? "demo" : "preview";
  return <OfficeDashboard data={demoOfficeData} mode={mode} />;
}
