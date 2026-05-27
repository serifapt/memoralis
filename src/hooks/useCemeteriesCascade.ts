import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CemeteryRow {
  id: string;
  nome: string;
  municipio: string;
  freguesia: string | null;
  morada: string | null;
  lat: number | null;
  lng: number | null;
}

export function useCemeteriesCascade(opts: { activeOnly?: boolean } = {}) {
  const activeOnly = opts.activeOnly ?? true;
  const query = useQuery({
    queryKey: ["cemeteries-cascade", activeOnly],
    queryFn: async (): Promise<CemeteryRow[]> => {
      let q = supabase.from("cemeteries").select("id,nome,municipio,freguesia,morada,lat,lng").order("nome");
      if (activeOnly) q = q.eq("ativo", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CemeteryRow[];
    },
  });

  const cemeteries = query.data ?? [];

  const localities = useMemo(() => {
    const set = new Set<string>();
    cemeteries.forEach((c) => c.municipio && set.add(c.municipio));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt"));
  }, [cemeteries]);

  const parishesFor = (locality: string) => {
    const set = new Set<string>();
    cemeteries
      .filter((c) => c.municipio === locality)
      .forEach((c) => c.freguesia && set.add(c.freguesia));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt"));
  };

  const cemeteriesFor = (locality: string, parish: string) =>
    cemeteries.filter(
      (c) => c.municipio === locality && (parish ? c.freguesia === parish : true),
    );

  return { cemeteries, localities, parishesFor, cemeteriesFor, isLoading: query.isLoading };
}