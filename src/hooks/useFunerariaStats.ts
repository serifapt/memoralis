import { supabase } from "@/integrations/supabase/client";
import type { FunerariaStats } from "@/components/funerarias/PublicFunerariaCard";

export async function fetchFunerariaStats(funerariaIds: string[]): Promise<Record<string, FunerariaStats>> {
  if (funerariaIds.length === 0) return {};

  const result: Record<string, FunerariaStats> = {};
  for (const id of funerariaIds) {
    result[id] = { avg_rating: 0, review_count: 0, view_count: 0 };
  }

  // Fetch approved testimonials
  const { data: testimonials } = await supabase
    .from("funeraria_testimonials")
    .select("funeraria_id, rating")
    .in("funeraria_id", funerariaIds)
    .eq("status", "approved");

  if (testimonials) {
    const grouped: Record<string, number[]> = {};
    testimonials.forEach((t) => {
      if (!grouped[t.funeraria_id]) grouped[t.funeraria_id] = [];
      grouped[t.funeraria_id].push(t.rating);
    });
    for (const [fid, ratings] of Object.entries(grouped)) {
      if (result[fid]) {
        result[fid].review_count = ratings.length;
        result[fid].avg_rating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      }
    }
  }

  // Fetch view counts via obituary_views joined with obituaries
  const { data: views } = await supabase
    .from("obituary_views")
    .select("obituary_id, obituaries!inner(funeraria_id)")
    .in("obituaries.funeraria_id", funerariaIds);

  if (views) {
    views.forEach((v: any) => {
      const fid = v.obituaries?.funeraria_id;
      if (fid && result[fid]) {
        result[fid].view_count++;
      }
    });
  }

  return result;
}
