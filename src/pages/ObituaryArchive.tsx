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
import logo from "@/assets/logo-memoralis.png";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicObituaryCard, type PublicObituary } from "@/components/obituaries/PublicObituaryCard";

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

      if (reset) {
        setObituaries((data as unknown as PublicObituary[]) || []);
      } else {
        setObituaries(prev => [...prev, ...((data as unknown as PublicObituary[]) || [])]);
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

  const getYear = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try { return new Date(dateStr).getFullYear().toString(); } catch { return "—"; }
  };

  const getAge = (birth: string | null, death: string | null) => {
    if (!birth || !death) return null;
    try {
      const [bY, bM, bD] = birth.split("-").map(Number);
      const [dY, dM, dD] = death.split("-").map(Number);
      let age = dY - bY;
      if (dM < bM || (dM === bM && dD < bD)) age--;
      return age;
    } catch { return null; }
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
            {obituaries.map((obit) => {
              const age = getAge(obit.birth_date, obit.death_date);
              const locationStr = [obit.freguesia, obit.locality].filter(Boolean).join(" - ");
              return (
                <Link key={obit.id} to={`/obituario/${obit.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img
                        src={obit.photo_url || obituaryPlaceholder}
                        alt={obit.display_name}
                        className="w-full aspect-[3/4] object-cover"
                      />
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-archivo font-bold text-foreground text-lg mb-1">
                          {obit.display_name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          {getYear(obit.birth_date)} - {getYear(obit.death_date)}{age !== null ? ` | ${age} Anos` : ""}
                        </p>
                        {locationStr && (
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">{locationStr}</span>
                          </div>
                        )}
                        {obit.funerarias && (
                          <Link
                            to={obit.funerarias.slug ? `/funerarias/${obit.funerarias.slug}` : "#"}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Building2 className="w-3 h-3" />
                            <span className="text-xs hover:underline">{obit.funerarias.nome_comercial}</span>
                          </Link>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Condolências
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Enviar Flores
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
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
