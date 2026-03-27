import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Home, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-memoralis.svg";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicObituaryCard, type PublicObituary } from "@/components/obituaries/PublicObituaryCard";
import { fetchObituaryCounts } from "@/hooks/useObituaryCounts";
import { getActiveTag, hasUpcomingMass, type CeremonyEvent } from "@/lib/ceremony-utils";

const PAGE_SIZE = 12;

export default function ObituaryArchive() {
  const [obituaries, setObituaries] = useState<PublicObituary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [selectedLocality, setSelectedLocality] = useState<string>("all");
  const [sortBy, setSortBy] = useState("recent");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);

  useEffect(() => {
    loadObituaries(true);
    loadLocalities();
  }, [searchName, selectedLocality, sortBy]);

  const loadLocalities = async () => {
    const { data } = await supabase
      .from("obituaries")
      .select("locality")
      .eq("is_public", true)
      .not("locality", "is", null);
    
    if (data) {
      const unique = [...new Set(data.map(d => d.locality).filter(Boolean))] as string[];
      setLocalities(unique.sort());
    }
  };

  const loadObituaries = async (reset = false) => {
    const currentPage = reset ? 0 : page;
    if (reset) {
      setLoading(true);
      setPage(0);
    } else {
      setLoadingMore(true);
    }

    try {
      let query = supabase
        .from("obituaries")
        .select("id, display_name, birth_date, death_date, locality, freguesia, photo_url, funeraria_id, funerarias(nome_comercial, slug)", { count: "exact" })
        .eq("is_public", true);

      if (searchName.trim()) {
        query = query.ilike("display_name", `%${searchName.trim()}%`);
      }
      if (selectedLocality && selectedLocality !== "all") {
        query = query.eq("locality", selectedLocality);
      }

      if (sortBy === "recent") {
        query = query.order("death_date", { ascending: false, nullsFirst: false });
      } else if (sortBy === "oldest") {
        query = query.order("death_date", { ascending: true, nullsFirst: false });
      } else if (sortBy === "name") {
        query = query.order("display_name", { ascending: true });
      }

      query = query.range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      const { data, count, error } = await query;

      if (error) {
        console.error("Error loading obituaries:", error);
        return;
      }

      let obits = (data as unknown as PublicObituary[]) || [];
      if (obits.length > 0) {
        const obitIds = obits.map((o) => o.id);
        const [counts, { data: events }] = await Promise.all([
          fetchObituaryCounts(obitIds),
          supabase
            .from("ceremony_events")
            .select("obituary_id, event_type, event_date, event_time, location")
            .in("obituary_id", obitIds),
        ]);

        const eventsMap: Record<string, CeremonyEvent[]> = {};
        (events || []).forEach((e: any) => {
          if (!eventsMap[e.obituary_id]) eventsMap[e.obituary_id] = [];
          eventsMap[e.obituary_id].push(e);
        });

        obits = obits.map((o) => ({
          ...o,
          ...counts[o.id],
          active_tag: getActiveTag(eventsMap[o.id] || []),
        }));

        // Boost obituaries with upcoming masses to top when sorting by recent
        if (sortBy === "recent") {
          const boosted = obits.filter((o) => hasUpcomingMass(eventsMap[o.id] || []));
          const rest = obits.filter((o) => !hasUpcomingMass(eventsMap[o.id] || []));
          obits = [...boosted, ...rest];
        }
      }

      if (reset) {
        setObituaries(obits);
      } else {
        setObituaries(prev => [...prev, ...obits]);
      }
      setTotalCount(count || 0);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    loadObituaries(false);
  };



  const hasMore = obituaries.length < totalCount;

  // Debounce search
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => setSearchName(value), 400);
    setSearchTimeout(timeout);
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary flex items-center gap-1">
              <Home className="w-4 h-4" />
              Início
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">Obituário</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-archivo font-bold text-foreground mb-8">Obituário</h1>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
              <Input
                placeholder="Pesquisar por nome..."
                className="pl-10"
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Select value={selectedLocality} onValueChange={setSelectedLocality}>
              <SelectTrigger>
                <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Localidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as localidades</SelectItem>
                {localities.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigos</SelectItem>
                <SelectItem value="name">Nome A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? "A carregar..." : `${totalCount} resultado${totalCount !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Array(8).fill(null).map((_, i) => (
              <Skeleton key={i} className="h-96 w-full rounded-lg" />
            ))}
          </div>
        ) : obituaries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">Nenhum obituário encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {obituaries.map((obit) => (
              <PublicObituaryCard key={obit.id} obit={obit} />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="flex justify-center">
            <Button variant="outline" size="lg" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? "A carregar..." : "Carregar mais"}
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-foreground))] py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <img src={logo} alt="Memoralis" className="h-8 brightness-0 invert" />
              </div>
              <p className="text-sm opacity-80">Homenagens que eternizam memórias e sentimentos.</p>
            </div>
            <div>
              <h4 className="font-archivo font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="opacity-80 hover:opacity-100">Início</Link></li>
                <li><Link to="/sobre" className="opacity-80 hover:opacity-100">Sobre</Link></li>
                <li><Link to="/blog" className="opacity-80 hover:opacity-100">Blog</Link></li>
                <li><Link to="/contactos" className="opacity-80 hover:opacity-100">Contactos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-archivo font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/ajuda" className="opacity-80 hover:opacity-100">Ajuda</Link></li>
                <li><Link to="/privacidade" className="opacity-80 hover:opacity-100">Privacidade</Link></li>
                <li><Link to="/termos" className="opacity-80 hover:opacity-100">Termos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-archivo font-semibold mb-4">Contacto</h4>
              <p className="text-sm opacity-80">Email: info@memoralis.pt</p>
            </div>
          </div>
          <div className="pt-8 border-t border-[hsl(var(--footer-foreground))]/20 text-center text-sm opacity-80">
            © 2025 Memoralis. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
