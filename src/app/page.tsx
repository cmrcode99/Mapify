import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MapDashboard } from "@/components/map-dashboard";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <MapDashboard userEmail={user.email ?? ""} />;
}
