import { supabase } from "@/integrations/supabase/client";

export async function getCurrentFuneraria<T = Record<string, unknown>>(select = "id") {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: membership } = await supabase
    .from("funeraria_members")
    .select("funeraria_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership?.funeraria_id) {
    const { data: funerariaByMembership, error } = await supabase
      .from("funerarias")
      .select(select)
      .eq("id", membership.funeraria_id)
      .maybeSingle();

    if (!error && funerariaByMembership) {
      return funerariaByMembership as T;
    }
  }

  const { data: funeraria } = await supabase
    .from("funerarias")
    .select(select)
    .eq("user_id", user.id)
    .maybeSingle();

  return (funeraria as T | null) ?? null;
}