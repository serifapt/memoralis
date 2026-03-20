import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, FileText, Eye, Edit, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface Obituary {
  id: string;
  display_name: string;
  birth_date: string | null;
  death_date: string | null;
  locality: string | null;
  freguesia: string | null;
  is_public: boolean;
  is_completed: boolean;
  photo_url: string | null;
  ceremony_events?: {
    event_type: string;
    event_date: string | null;
    event_time: string | null;
    location: string | null;
  }[];
}

export default function Obituaries() {
  const [obituaries, setObituaries] = useState<Obituary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");

  const fetchObituaries = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: funeraria } = await supabase
        .from("funerarias")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!funeraria) { setObituaries([]); return; }

      const { data, error } = await supabase
        .from("obituaries")
        .select("id, display_name, birth_date, death_date, locality, freguesia, is_public, is_completed, photo_url, ceremony_events(event_type, event_date, event_time, location)")
        .eq("funeraria_id", funeraria.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setObituaries((data as Obituary[]) || []);
    } catch (error) {
      console.error("Erro ao carregar obituários:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchObituaries(); }, [fetchObituaries]);

  const counts = {
    active: obituaries.filter(o => !o.is_completed).length,
    completed: obituaries.filter(o => o.is_completed).length,
    public: obituaries.filter(o => o.is_public).length,
    private: obituaries.filter(o => !o.is_public).length,
  };

  const filtered = obituaries.filter((o) => {
    const matchesName = o.display_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? !o.is_completed : o.is_completed);
    const matchesVisibility = visibilityFilter === "all" || (visibilityFilter === "public" ? o.is_public : !o.is_public);
    return matchesName && matchesStatus && matchesVisibility;
  });

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    try { return format(new Date(date), "dd/MM/yyyy", { locale: pt }); } catch { return "—"; }
  };

  const getFirstCeremony = (o: Obituary) => {
    const ce = o.ceremony_events?.find((e) => e.event_type === "funeral") || o.ceremony_events?.[0];
    if (!ce) return null;
    return ce;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-archivo font-bold text-foreground">Obituários</h1>
          <p className="text-muted-foreground mt-1">Gerir e publicar obituários</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" asChild>
          <Link to="/obituaries/new">
            <Plus className="w-4 h-4 mr-2" />
            Criar Obituário
          </Link>
        </Button>
      </div>

      <Card className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Pesquisar por nome..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground mr-1">Processo:</span>
            {([["all", "Todos", obituaries.length], ["active", `Em curso (${counts.active})`, counts.active], ["completed", `Terminado (${counts.completed})`, counts.completed]] as const).map(([value, label]) => (
              <Button
                key={value}
                variant={statusFilter === value ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setStatusFilter(value as typeof statusFilter)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground mr-1">Visibilidade:</span>
            {([["all", "Todos", obituaries.length], ["public", `Público (${counts.public})`, counts.public], ["private", `Privado (${counts.private})`, counts.private]] as const).map(([value, label]) => (
              <Button
                key={value}
                variant={visibilityFilter === value ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setVisibilityFilter(value as typeof visibilityFilter)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6">
              <div className="flex gap-4">
                <Skeleton className="w-24 h-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {searchQuery ? "Nenhum resultado encontrado" : "Sem obituários"}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Tente outra pesquisa." : "Crie o primeiro obituário para começar."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((obituary) => {
            const ceremony = getFirstCeremony(obituary);
            const isPublished = obituary.is_public && obituary.is_completed;

            return (
              <Card key={obituary.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {obituary.photo_url ? (
                        <img src={obituary.photo_url} alt={obituary.display_name} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-archivo font-semibold text-foreground">
                          {obituary.display_name}
                        </h3>
                        <Badge variant={isPublished ? "default" : "secondary"}>
                          {isPublished ? "Publicado" : "Rascunho"}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>✝ {formatDate(obituary.birth_date)} - {formatDate(obituary.death_date)}</p>
                        {(obituary.locality || obituary.freguesia) && (
                          <p>📍 {obituary.locality || obituary.freguesia}</p>
                        )}
                        {ceremony && (
                          <p>🕐 {formatDate(ceremony.event_date)}{ceremony.event_time ? ` - ${ceremony.event_time.slice(0, 5)}` : ""}{ceremony.location ? ` · ${ceremony.location}` : ""}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/obituario/${obituary.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/obituaries/${obituary.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
