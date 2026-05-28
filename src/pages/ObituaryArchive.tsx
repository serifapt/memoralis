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
import { Search, MapPin, Home, ChevronRight, Building, SlidersHorizontal } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import logo from "@/assets/logo-memoralis.svg";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicObituaryCard, type PublicObituary } from "@/components/obituaries/PublicObituaryCard";
import { fetchObituaryCounts } from "@/hooks/useObituaryCounts";
import { getActiveTag, hasUpcomingMass, isFlowerOrderOpen, type CeremonyEvent } from "@/lib/ceremony-utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 12;

const TAG_OPTIONS = [
  { label: "Todos", value: "all" },
  { label: "Funeral", value: "Funeral" },
  { label: "Missa 7º Dia", value: "Missa 7º Dia" },
  { label: "Missa 30º Dia", value: "Missa 30º Dia" },
  { label: "Missa 1 Ano", value: "Missa 1 Ano" },
];

export default function ObituaryArchive() {
  const [searchParams] = useSearchParams();
  const [obituaries, setObituaries] = useState<PublicObituary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState(searchParams.get("nome") || "");
  const initialLocality = searchParams.get("localidade") || "";
  const initialFuneraria = searchParams.get("funeraria") || "";
  const [localityText, setLocalityText] = useState(initialLocality);
  const [funerariaText, setFunerariaText] = useState(initialFuneraria);
  const [selectedLocality, setSelectedLocality] = useState<string>(initialLocality || "all");
  const [selectedFreguesia, setSelectedFreguesia] = useState<string>("all");
  const [selectedDistrito, setSelectedDistrito] = useState<string>("all");
  const [selectedFuneraria, setSelectedFuneraria] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState("recent");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);
  const [freguesias, setFreguesias] = useState<string[]>([]);
  const [distritos, setDistritos] = useState<string[]>([]);
  const [funerariasList, setFunerariasList] = useState<{ id: string; nome_comercial: string }[]>([]);

  useEffect(() => {
    loadObituaries(true);
  }, [searchName, selectedLocality, selectedFreguesia, selectedDistrito, selectedFuneraria, selectedTag, sortBy, localityText, funerariaText]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    const [locRes, fregRes, distRes, funRes] = await Promise.all([
      supabase.from("obituaries").select("locality").eq("is_public", true).not("locality", "is", null),
      supabase.from("obituaries").select("freguesia").eq("is_public", true).not("freguesia", "is", null),
      supabase.from("obituaries").select("distrito").eq("is_public", true).not("distrito", "is", null),
      supabase.from("obituaries").select("funeraria_id, funerarias(nome_comercial)").eq("is_public", true),
    ]);

    if (locRes.data) {
      const locs = [...new Set(locRes.data.map(d => d.locality).filter(Boolean) as string[])].sort();
      setLocalities(locs);
      // If URL came with ?localidade=..., try to match an existing locality (case-insensitive)
      if (initialLocality) {
        const match = locs.find(l => l.toLowerCase() === initialLocality.toLowerCase());
        if (match) {
          setSelectedLocality(match);
          setLocalityText("");
        }
      }
    }
    if (fregRes.data) {
      setFreguesias([...new Set(fregRes.data.map(d => d.freguesia).filter(Boolean) as string[])].sort());
    }
    if (distRes.data) {
      setDistritos([...new Set(distRes.data.map(d => d.distrito).filter(Boolean) as string[])].sort());
    }
    if (funRes.data) {
      const funerariaMap = new Map<string, string>();
      funRes.data.forEach((d: any) => {
        if (d.funeraria_id && d.funerarias?.nome_comercial) {
          funerariaMap.set(d.funeraria_id, d.funerarias.nome_comercial);
        }
      });
      const list = Array.from(funerariaMap.entries()).map(([id, nome_comercial]) => ({ id, nome_comercial })).sort((a, b) => a.nome_comercial.localeCompare(b.nome_comercial));
      setFunerariasList(list);
      if (initialFuneraria) {
        const match = list.find(f => f.nome_comercial.toLowerCase() === initialFuneraria.toLowerCase());
        if (match) {
          setSelectedFuneraria(match.id);
          setFunerariaText("");
        }
      }
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
      const useFunerariaJoin = funerariaText.trim().length > 0;
      const funerariaSelect = useFunerariaJoin
        ? "funerarias!inner(nome_comercial, slug, servico_flores_ativo, flores_limite_horas)"
        : "funerarias(nome_comercial, slug, servico_flores_ativo, flores_limite_horas)";
      let query = supabase
        .from("obituaries")
        .select(`id, slug, display_name, birth_date, death_date, locality, freguesia, distrito, photo_url, funeraria_id, ${funerariaSelect}`, { count: "exact" })
        .eq("is_public", true);

      if (searchName.trim()) {
        query = query.ilike("display_name", `%${searchName.trim()}%`);
      }
      if (selectedLocality !== "all") {
        query = query.eq("locality", selectedLocality);
      }
      if (localityText.trim()) {
        query = query.ilike("locality", `%${localityText.trim()}%`);
      }
      if (selectedFreguesia !== "all") {
        query = query.eq("freguesia", selectedFreguesia);
      }
      if (selectedDistrito !== "all") {
        query = query.eq("distrito", selectedDistrito);
      }
      if (selectedFuneraria !== "all") {
        query = query.eq("funeraria_id", selectedFuneraria);
      }
      if (useFunerariaJoin) {
        query = query.ilike("funerarias.nome_comercial", `%${funerariaText.trim()}%`);
      }

      if (sortBy === "recent") {
        query = query.order("death_date", { ascending: false, nullsFirst: false });
      } else if (sortBy === "oldest") {
        query = query.order("death_date", { ascending: true, nullsFirst: false });
      } else if (sortBy === "name") {
        query = query.order("display_name", { ascending: true });
      }

      if (selectedTag === "all") {
        query = query.range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);
      }

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
          servico_flores_ativo: (o as any).funerarias?.servico_flores_ativo ?? false,
          flores_limite_horas: (o as any).funerarias?.flores_limite_horas ?? 4,
          ceremony_events: eventsMap[o.id] || [],
        }));

        if (sortBy === "recent") {
          const boosted = obits.filter((o) => hasUpcomingMass(eventsMap[o.id] || []));
          const rest = obits.filter((o) => !hasUpcomingMass(eventsMap[o.id] || []));
          obits = [...boosted, ...rest];
        }
      }

      const filteredObits = selectedTag === "all"
        ? obits
        : obits.filter((o) => (o as any).active_tag === selectedTag);

      if (selectedTag === "all") {
        if (reset) {
          setObituaries(filteredObits);
        } else {
          setObituaries(prev => [...prev, ...filteredObits]);
        }
        setTotalCount(count || 0);
      } else {
        setObituaries(filteredObits);
        setTotalCount(filteredObits.length);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    loadObituaries(false);
  };

  const hasMore = selectedTag === "all" && obituaries.length < totalCount;

  // Filter by tag client-side
  const displayedObituaries = selectedTag === "all"
    ? obituaries
    : obituaries.filter(o => (o as any).active_tag === selectedTag);

  // Debounce search
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => setSearchName(value), 400);
    setSearchTimeout(timeout);
  };

  const activeFilterCount = [selectedLocality, selectedFreguesia, selectedDistrito, selectedFuneraria].filter(v => v !== "all").length;
  const clearAdvancedFilters = () => {
    setSelectedLocality("all");
    setSelectedFreguesia("all");
    setSelectedDistrito("all");
    setSelectedFuneraria("all");
    setLocalityText("");
    setFunerariaText("");
  };

  const advancedFiltersBody = (
    <>
      <Select value={selectedLocality} onValueChange={setSelectedLocality}>
        <SelectTrigger>
          <MapPin className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
          <SelectValue placeholder="Localidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as localidades</SelectItem>
          {localities.map(loc => (
            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedFreguesia} onValueChange={setSelectedFreguesia}>
        <SelectTrigger>
          <MapPin className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
          <SelectValue placeholder="Freguesia" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as freguesias</SelectItem>
          {freguesias.map(f => (
            <SelectItem key={f} value={f}>{f}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedDistrito} onValueChange={setSelectedDistrito}>
        <SelectTrigger>
          <MapPin className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
          <SelectValue placeholder="Distrito" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os distritos</SelectItem>
          {distritos.map(d => (
            <SelectItem key={d} value={d}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedFuneraria} onValueChange={setSelectedFuneraria}>
        <SelectTrigger>
          <Building className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
          <SelectValue placeholder="Funerária" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as funerárias</SelectItem>
          {funerariasList.map(f => (
            <SelectItem key={f.id} value={f.id}>{f.nome_comercial}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );

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
          {/* Mobile: search + filter trigger */}
          <div className="flex gap-2 md:hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
              <Input
                placeholder="Pesquisar por nome..."
                className="pl-10"
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center border-2 border-background">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] flex flex-col">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-1 py-4 space-y-3">
                  {advancedFiltersBody}
                </div>
                <SheetFooter className="flex-row gap-2 sm:flex-row sm:justify-stretch">
                  <Button variant="outline" className="flex-1" onClick={clearAdvancedFilters}>
                    Limpar
                  </Button>
                  <SheetClose asChild>
                    <Button className="flex-1">Ver resultados</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop: full grid */}
          <div className="hidden md:grid md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
              <Input
                placeholder="Pesquisar por nome..."
                className="pl-10"
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            {advancedFiltersBody}
          </div>

          {/* Tag pills + counter + sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex sm:flex-wrap gap-2 overflow-x-auto sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0 w-full sm:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {TAG_OPTIONS.map(tag => (
                <Button
                  key={tag.value}
                  variant={selectedTag === tag.value ? "default" : "outline"}
                  size="sm"
                  className="rounded-full shrink-0"
                  onClick={() => setSelectedTag(tag.value)}
                >
                  {tag.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                {loading ? "A carregar..." : `${selectedTag === "all" ? totalCount : displayedObituaries.length} resultado${(selectedTag === "all" ? totalCount : displayedObituaries.length) !== 1 ? "s" : ""}`}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigos</SelectItem>
                  <SelectItem value="name">Nome A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            {Array(5).fill(null).map((_, i) => (
              <Skeleton key={i} className="h-96 w-full rounded-lg" />
            ))}
          </div>
        ) : displayedObituaries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">Nenhum obituário encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            {displayedObituaries.map((obit) => (
              <PublicObituaryCard key={obit.id} obit={obit} />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && selectedTag === "all" && (
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
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
              <h4 className="font-archivo font-semibold mb-4">Diretórios</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/obituarios" className="opacity-80 hover:opacity-100">Obituários</Link></li>
                <li><Link to="/funerarias" className="opacity-80 hover:opacity-100">Funerárias</Link></li>
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
              <p className="text-sm opacity-80">info@memoralis.pt</p>
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
