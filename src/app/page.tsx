import { isSupabaseConfigured } from "@/lib/supabase/env";
import { loadOfficeData } from "@/lib/office-data";
import { demoOfficeData } from "@/lib/demo-data";
import OfficeDashboard from "@/components/office/OfficeDashboard";
import LiveOffice from "@/components/LiveOffice";

// Home = the office. Three states, all honest:
// - Supabase not configured yet: labeled PREVIEW with demo data.
// - Configured + signed in: the user's real office, live via Realtime.
// - Configured + signed out: middleware sends you to /login first.
export default async function Home() {
  if (!isSupabaseConfigured()) {
    return <OfficeDashboard data={demoOfficeData} mode="preview" />;
  }
  const live = await loadOfficeData();
  if (!live) {
    return <OfficeDashboard data={demoOfficeData} mode="demo" />;
  }
  return <LiveOffice userId={live.userId} initialData={live.data} />;
}
