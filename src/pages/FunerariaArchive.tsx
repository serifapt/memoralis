import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Star, Home, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-memoralis.svg";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { PublicFunerariaCard, type FunerariaCardData } from "@/components/funerarias/PublicFunerariaCard";
import type { FunerariaStats } from "@/components/funerarias/PublicFunerariaCard";
import { fetchFunerariaStats } from "@/hooks/useFunerariaStats";

export default function FunerariaArchive() {
  const [funerarias, setFunerarias] = useState<FunerariaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocality, setSelectedLocality] = useState<string>("all");
  const [selectedDistrito, setSelectedDistrito] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [localities, setLocalities] = useState<string[]>([]);
  const [distritos, setDistritos] = useState<string[]>([]);

  useEffect(() => {
    loadFunerarias();
  }, []);

  const loadFunerarias = async () => {
    try {
      const { data, error } = await supabase
        .from("funerarias")
        .select("id, nome_comercial, localidade, distrito, logo_url, cover_image_url, slug")
        .eq("pagina_publica_visivel", true)
        .order("nome_comercial");

      if (!error && data) {
        setFunerarias(data);
        const uniqueLocalities = [...new Set(data.map(f => f.localidade).filter(Boolean) as string[])].sort();
        const uniqueDistritos = [...new Set(data.map(f => f.distrito).filter(Boolean) as string[])].sort();
        setLocalities(uniqueLocalities);
        setDistritos(uniqueDistritos);
      }
    } catch (err) {
      console.error("Error loading funerarias:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = funerarias.filter((f) => {
    const matchesSearch = f.nome_comercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.localidade && f.localidade.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocality = selectedLocality === "all" || f.localidade === selectedLocality;
    const matchesDistrito = selectedDistrito === "all" || f.distrito === selectedDistrito;
    return matchesSearch && matchesLocality && matchesDistrito;
  });

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
            <span className="text-foreground">Funerárias</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-archivo font-bold text-foreground mb-8">
          Funerárias
        </h1>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
              <Input
                placeholder="Pesquisar por nome..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger>
                <Star className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Avaliação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as avaliações</SelectItem>
                <SelectItem value="5">5 estrelas</SelectItem>
                <SelectItem value="4">4+ estrelas</SelectItem>
                <SelectItem value="3">3+ estrelas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Nenhuma funerária encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filtered.map((home) => (
              <Link key={home.id} to={`/funerarias/${home.slug || home.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={getFunerariaImage(home.cover_image_url, home.logo_url)}
                      alt={home.nome_comercial}
                      className="w-full aspect-[4/3] object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-archivo font-bold text-foreground text-lg">
                      {home.nome_comercial}
                    </h3>
                    {home.localidade && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{home.localidade}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
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
              <p className="text-sm opacity-80">
                Homenagens que eternizam memórias e sentimentos.
              </p>
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
              <p className="text-sm opacity-80">
                Email: info@memoralis.pt
              </p>
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
