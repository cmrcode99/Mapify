import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecommendedDashboard } from "@/components/recommended/recommended-dashboard";

export const metadata = {
  title: "Recommended Rooms — Mapify",
  description: "Find the best study spaces ranked by availability and energy efficiency",
};

export default async function RecommendedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <RecommendedDashboard />;
}
