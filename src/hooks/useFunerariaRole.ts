import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FunerariaRole = "admin" | "editor" | null;

export function useFunerariaRole() {
  const [role, setRole] = useState<FunerariaRole>(null);
  const [funerariaId, setFunerariaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) { setLoading(false); return; }

        // Get user's funeraria membership
        const { data: membership, error } = await supabase
          .from("funeraria_members")
          .select("role, funeraria_id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error("Error fetching funeraria role:", error);
          setRole(null);
          setFunerariaId(null);
        } else if (membership) {
          setRole(membership.role as FunerariaRole);
          setFunerariaId(membership.funeraria_id);
        } else {
          // Fallback: check if owner via funerarias.user_id
          const { data: funeraria } = await supabase
            .from("funerarias")
            .select("id")
            .eq("user_id", user.id)
            .limit(1)
            .maybeSingle();

          if (funeraria) {
            setRole("admin");
            setFunerariaId(funeraria.id);
          } else {
            setRole(null);
            setFunerariaId(null);
          }
        }
      } catch (err) {
        console.error("Error in useFunerariaRole:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRole();
    return () => { cancelled = true; };
  }, []);

  const isAdmin = role === "admin";
  const isEditor = role === "editor";

  return { role, funerariaId, loading, isAdmin, isEditor };
}
