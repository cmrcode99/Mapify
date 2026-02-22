import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrendsDashboard } from "@/components/trends-dashboard";

export default async function TrendsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <TrendsDashboard userEmail={user.email ?? ""} />;
}
