import { supabase } from "@/integrations/supabase/client";

export async function fetchObituaryCounts(obituaryIds: string[]) {
  if (obituaryIds.length === 0) return {};

  const [viewsRes, condolencesRes, candlesRes] = await Promise.all([
    supabase
      .from("obituary_views")
      .select("obituary_id")
      .in("obituary_id", obituaryIds),
    supabase
      .from("condolences")
      .select("obituary_id")
      .in("obituary_id", obituaryIds)
      .eq("is_approved", true),
    supabase
      .from("obituary_candles")
      .select("obituary_id")
      .in("obituary_id", obituaryIds),
  ]);

  const counts: Record<string, { view_count: number; condolence_count: number; candle_count: number }> = {};

  for (const id of obituaryIds) {
    counts[id] = { view_count: 0, condolence_count: 0, candle_count: 0 };
  }

  viewsRes.data?.forEach((r) => {
    if (counts[r.obituary_id]) counts[r.obituary_id].view_count++;
  });
  condolencesRes.data?.forEach((r) => {
    if (counts[r.obituary_id]) counts[r.obituary_id].condolence_count++;
  });
  candlesRes.data?.forEach((r) => {
    if (counts[r.obituary_id]) counts[r.obituary_id].candle_count++;
  });

  return counts;
}
