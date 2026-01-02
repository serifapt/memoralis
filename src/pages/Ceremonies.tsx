import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface CeremonyEvent {
  id: string;
  obituary_id: string;
  event_type: string;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  map_link: string | null;
  responsible_name: string | null;
  responsible_phone: string | null;
  obituary: {
    display_name: string;
    full_name: string;
  };
}

export default function Ceremonies() {
  const [ceremonies, setCeremonies] = useState<CeremonyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCeremonies();
  }, []);

  const fetchCeremonies = async () => {
    try {
      const { data: funerariaData } = await supabase
        .from("funerarias")
        .select("id")
        .single();

      if (!funerariaData) return;

      const { data, error } = await supabase
        .from("ceremony_events")
        .select(`
          *,
          obituary:obituaries!inner(display_name, full_name, funeraria_id)
        `)
        .eq("obituary.funeraria_id", funerariaData.id)
        .order("event_date", { ascending: true, nullsFirst: false });

      if (error) throw error;

      // Filter to only show future ceremonies or ceremonies from last 7 days
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const filteredData = (data || []).filter((ceremony) => {
        if (!ceremony.event_date) return true; // Show ceremonies without date
        const eventDate = parseISO(ceremony.event_date);
        return eventDate >= sevenDaysAgo;
      });

      setCeremonies(filteredData as CeremonyEvent[]);
    } catch (error) {
      console.error("Erro ao carregar cerimónias:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return { day: "--", month: "---" };
    const date = parseISO(dateStr);
    return {
      day: format(date, "dd"),
      month: format(date, "MMM", { locale: pt }).toUpperCase(),
    };
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "--:--";
    return timeStr.slice(0, 5);
  };

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      velorio: "Velório",
      missa: "Missa",
      cremacao: "Cremação",
      sepultamento: "Sepultamento",
      outro: "Outro",
    };
    return types[type] || type;
  };

  const isPastEvent = (dateStr: string | null) => {
    if (!dateStr) return false;
    return parseISO(dateStr) < new Date();
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-archivo font-bold text-foreground">
            Cerimónias
          </h1>
          <p className="text-muted-foreground mt-1">
            Calendário automático das cerimónias registadas nos óbitos
          </p>
        </div>
      </div>

      {/* Calendar View */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-archivo font-semibold text-foreground">
            Próximas Cerimónias
          </h2>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
            {ceremonies.length} eventos
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border border-border">
                <div className="flex gap-4">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : ceremonies.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Nenhuma cerimónia registada</p>
            <p className="text-sm mt-1">
              As cerimónias aparecem automaticamente quando são adicionadas nas informações fúnebres de cada óbito.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ceremonies.map((ceremony) => {
              const { day, month } = formatDate(ceremony.event_date);
              const past = isPastEvent(ceremony.event_date);

              return (
                <div
                  key={ceremony.id}
                  className={`p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors ${
                    past ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg ${
                            past
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <span className="text-2xl font-bold">{day}</span>
                          <span className="text-xs">{month}</span>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-archivo font-semibold text-foreground text-lg">
                            {ceremony.obituary.display_name}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(ceremony.event_time)}</span>
                              <span
                                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                  past
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-accent/10 text-accent"
                                }`}
                              >
                                {getEventTypeLabel(ceremony.event_type)}
                              </span>
                              {past && (
                                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                                  Passado
                                </span>
                              )}
                            </div>
                            {ceremony.location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{ceremony.location}</span>
                                {ceremony.map_link && (
                                  <a
                                    href={ceremony.map_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            )}
                            {ceremony.responsible_name && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Responsável:</span>{" "}
                                {ceremony.responsible_name}
                                {ceremony.responsible_phone && (
                                  <span className="ml-2">
                                    ({ceremony.responsible_phone})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Link
                        to={`/obituaries/${ceremony.obituary_id}/edit#informacoes-funebres`}
                      >
                        <Button variant="outline" size="sm" className="mt-2">
                          Ver Óbito
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
