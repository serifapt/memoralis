import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar, Heart, Star, Flower2, Sparkles, Building2, Church, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { HeroSearchInput, type SearchResult } from "@/components/search/HeroSearchInput";
import logo from "@/assets/logo-memoralis.svg";
import heroImage from "@/assets/hero-memorial.jpg";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicObituaryCard, type PublicObituary } from "@/components/obituaries/PublicObituaryCard";
import { fetchObituaryCounts } from "@/hooks/useObituaryCounts";
import { getActiveTag, hasUpcomingMass, isFlowerOrderOpen, type CeremonyEvent } from "@/lib/ceremony-utils";
import type { FunerariaCardData, FunerariaStats } from "@/components/funerarias/PublicFunerariaCard";
import { getFunerariaImage } from "@/lib/funeraria-utils";
import { fetchFunerariaStats } from "@/hooks/useFunerariaStats";

type BlogArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  cover_image_url: string | null;
};

const services = [
  { icon: Heart, title: "Obituários", description: "Crie e partilhe homenagens digitais com elegância e dignidade.", href: "/obituarios" },
  { icon: Sparkles, title: "Memoralis Care", description: "Manutenção contínua de campas e jazigos com relatórios fotográficos.", href: "/care" },
  { icon: Flower2, title: "Envio de Flores", description: "Encomende flores diretamente para a cerimónia através das funerárias parceiras.", href: "/obituarios" },
  { icon: Building2, title: "Diretório de Funerárias", description: "Encontre funerárias por localidade em todo o país.", href: "/funerarias" },
  { icon: Flower2, title: "Diretório de Floristas", description: "Em breve: floristas locais para acompanhar momentos de despedida.", href: "/floristas" },
  { icon: Church, title: "Missas por Paróquia", description: "Em breve: informação de missas em paróquias a nível nacional.", href: "/missas" },
];

export default function Home() {
  const navigate = useNavigate();
  const [obituaries, setObituaries] = useState<PublicObituary[]>([]);
  const [loadingObits, setLoadingObits] = useState(true);
  const [funerarias, setFunerarias] = useState<FunerariaCardData[]>([]);
  const [funerariaStats, setFunerariaStats] = useState<Record<string, FunerariaStats>>({});
  const [loadingFunerarias, setLoadingFunerarias] = useState(true);
  const [featured, setFeatured] = useState<FunerariaCardData | null>(null);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [searchNome, setSearchNome] = useState("");
  const [searchLocal, setSearchLocal] = useState("");
  const [searchFuneraria, setSearchFuneraria] = useState("");

  const searchByName = useCallback(async (query: string): Promise<SearchResult[]> => {
    const { data } = await supabase
      .from("obituaries")
      .select("id, display_name, locality, funeraria_id, funerarias(slug)")
      .eq("is_public", true)
      .ilike("display_name", `%${query}%`)
      .limit(5);
    return (data || []).map((o: any) => ({
      id: o.id,
      label: o.display_name,
      sublabel: o.locality || undefined,
      href: `/obituarios/${o.id}`,
    }));
  }, []);

  const searchByLocation = useCallback(async (query: string): Promise<SearchResult[]> => {
    const { data } = await supabase
      .from("obituaries")
      .select("locality")
      .eq("is_public", true)
      .ilike("locality", `%${query}%`)
      .not("locality", "is", null)
      .limit(20);
    const unique = [...new Set((data || []).map((d: any) => d.locality).filter(Boolean))].slice(0, 5);
    return unique.map((loc) => ({
      id: loc,
      label: loc,
      href: `/obituarios?localidade=${encodeURIComponent(loc)}`,
    }));
  }, []);

  const searchByFuneraria = useCallback(async (query: string): Promise<SearchResult[]> => {
    const { data } = await supabase
      .from("funerarias")
      .select("id, nome_comercial, localidade, slug")
      .eq("pagina_publica_visivel", true)
      .ilike("nome_comercial", `%${query}%`)
      .limit(5);
    return (data || []).map((f: any) => ({
      id: f.id,
      label: f.nome_comercial,
      sublabel: f.localidade || undefined,
      href: `/funerarias/${f.slug || f.id}`,
    }));
  }, []);
  useEffect(() => {
    const loadObituaries = async () => {
      // Load recent obituaries
      const { data } = await supabase
        .from("obituaries")
        .select("id, display_name, birth_date, death_date, locality, freguesia, photo_url, funeraria_id, funerarias(nome_comercial, slug, servico_flores_ativo, flores_limite_horas)")
        .eq("is_public", true)
        .order("death_date", { ascending: false, nullsFirst: false })
        .limit(12);
      let obits = (data as unknown as PublicObituary[]) || [];

      // Load ceremony events for all obituaries
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

        // Boost obituaries with upcoming masses to the top
        const boosted = obits.filter((o) => hasUpcomingMass(eventsMap[o.id] || []));
        const rest = obits.filter((o) => !hasUpcomingMass(eventsMap[o.id] || []));
        obits = [...boosted, ...rest];
      }

      setObituaries(obits);
      setLoadingObits(false);
    };
    loadObituaries();

    const loadFunerarias = async () => {
      const { data } = await supabase
        .from("funerarias")
        .select("id, nome_comercial, localidade, distrito, logo_url, cover_image_url, slug")
        .eq("pagina_publica_visivel", true)
        .order("nome_comercial")
        .limit(6);
      const items = (data || []) as FunerariaCardData[];
      setFunerarias(items);
      if (items.length > 0) {
        const stats = await fetchFunerariaStats(items.map(f => f.id));
        setFunerariaStats(stats);
      }
      setLoadingFunerarias(false);
    };
    loadFunerarias();

    const loadFeatured = async () => {
      const { data } = await supabase
        .from("funerarias")
        .select("id, nome_comercial, localidade, distrito, logo_url, cover_image_url, slug")
        .eq("pagina_publica_visivel", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setFeatured(data as FunerariaCardData);
    };
    loadFeatured();

    const loadArticles = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, category, cover_image_url")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);
      setArticles((data || []) as BlogArticle[]);
    };
    loadArticles();
  }, []);

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-archivo font-bold text-foreground mb-6">
              Homenagens que eternizam memórias e sentimentos.
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Na Memoralis, acreditamos que cada vida merece ser celebrada e recordada com dignidade. 
              Oferecemos uma plataforma completa para criar homenagens inesquecíveis e perpetuar a memória de forma significativa e emotiva.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <HeroSearchInput
                    placeholder="Nome"
                    icon={<Search className="w-5 h-5" />}
                    searchFn={searchByName}
                    value={searchNome}
                    onChange={setSearchNome}
                  />
                </div>
                <div className="flex-1">
                  <HeroSearchInput
                    placeholder="Localização"
                    icon={<MapPin className="w-5 h-5" />}
                    searchFn={searchByLocation}
                    value={searchLocal}
                    onChange={setSearchLocal}
                  />
                </div>
                <div className="flex-1">
                  <HeroSearchInput
                    placeholder="Funerária"
                    icon={<Search className="w-5 h-5" />}
                    searchFn={searchByFuneraria}
                    value={searchFuneraria}
                    onChange={setSearchFuneraria}
                  />
                </div>
              </div>
              <Button
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (searchNome) params.set("nome", searchNome);
                  if (searchLocal) params.set("localidade", searchLocal);
                  if (searchFuneraria) params.set("funeraria", searchFuneraria);
                  navigate(`/obituarios${params.toString() ? `?${params}` : ""}`);
                }}
              >
                Pesquisar
              </Button>
            </div>
          </div>
          <div className="relative">
            <img 
              src={heroImage} 
              alt="Memorial ceremony" 
              className="rounded-lg shadow-lg w-full aspect-[4/5] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Obituários Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-archivo font-bold text-foreground">
              Obituário
            </h2>
            <Link to="/obituarios">
              <Button variant="ghost" size="sm">
                Ver todos →
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loadingObits ? (
              Array(5).fill(null).map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-lg" />)
            ) : obituaries.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full text-center py-8">Nenhum obituário publicado</p>
            ) : (
              obituaries.map((obit) => (
                <PublicObituaryCard key={obit.id} obit={obit} />
              ))
            )}
          </div>
          <div className="flex justify-center mt-8">
            <Button variant="outline" size="lg">
              Carregar mais
            </Button>
          </div>
        </div>
      </section>

      {/* Add Memory Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="/placeholder.svg" 
              alt="Add memory" 
              className="rounded-lg shadow-lg w-full aspect-square object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-archivo font-bold text-foreground mb-4">
              Adicione uma memória especial de quem partiu
            </h2>
            <p className="text-muted-foreground mb-6">
              Mantenha a memória viva com uma homenagem duradoura, criada em parceria com a funerária da sua confiança.
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Contacte a funerária parceira</h4>
                  <p className="text-sm text-muted-foreground">
                    A funerária responsável pelo seu ente querido cria o obituário na plataforma Memoralis.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Personalize a homenagem</h4>
                  <p className="text-sm text-muted-foreground">
                    Fotografia, biografia, cerimónias e contactos — tudo apresentado com dignidade.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Partilhe com familiares e amigos</h4>
                  <p className="text-sm text-muted-foreground">
                    Um link único permite que recebam condolências, acendam velas e enviem flores.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-semibold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Preserve a memória para sempre</h4>
                  <p className="text-sm text-muted-foreground">
                    A homenagem fica disponível no arquivo público para consulta a qualquer momento.
                  </p>
                </div>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link to="/obituarios">Explorar Obituários</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Funeral Home Section */}
      {featured && (
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-archivo font-bold text-primary-foreground">
              Destaques
            </h2>
            <Link to="/funerarias">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-primary-foreground/90 hover:bg-primary-foreground/10">
                Ver todos →
              </Button>
            </Link>
          </div>
          <Card className="overflow-hidden">
            <img
              src={getFunerariaImage(featured.cover_image_url, featured.logo_url)}
              alt={featured.nome_comercial}
              className="w-full h-64 object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
            />
            <CardContent className="p-6">
              <h3 className="text-2xl font-archivo font-bold text-foreground mb-2">
                {featured.nome_comercial}
              </h3>
              {featured.localidade && (
                <p className="text-muted-foreground mb-4 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {featured.localidade}
                </p>
              )}
              <Button className="bg-primary hover:bg-primary/90" asChild>
                <Link to={`/funerarias/${featured.slug || featured.id}`}>Ver Mais</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
      )}

      {/* Serviços Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-archivo font-bold text-foreground mb-3">
            Os nossos serviços
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma completa ao serviço das famílias e profissionais do setor funerário.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.title} to={s.href}>
                <Card className="p-6 h-full hover:shadow-lg hover:border-primary/40 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-archivo font-bold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Funeral Homes Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-archivo font-bold text-foreground">
            Funerárias
          </h2>
          <Link to="/funerarias">
            <Button variant="ghost" size="sm">
              Ver todos →
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingFunerarias ? (
            Array(6).fill(null).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-lg" />)
          ) : funerarias.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-full text-center py-8">Nenhuma funerária disponível</p>
          ) : (
            funerarias.map((f) => {
              const stats = funerariaStats[f.id];
              return (
                <Link key={f.id} to={`/funerarias/${f.slug || f.id}`}>
                  <Card className="flex gap-4 p-4 hover:shadow-lg transition-shadow h-full">
                    <div className="w-[110px] h-[110px] rounded-lg shrink-0 bg-muted/50 flex items-center justify-center overflow-hidden">
                      <img
                        src={f.logo_url || "/placeholder.svg"}
                        alt={f.nome_comercial}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-archivo font-bold text-foreground leading-tight">{f.nome_comercial}</h3>
                      {stats && stats.review_count > 0 && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span className="text-sm font-semibold text-foreground">{stats.avg_rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({stats.review_count})</span>
                        </div>
                      )}
                      {f.localidade && (
                        <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-sm truncate">{f.localidade}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* Articles Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-archivo font-bold text-foreground">
              Últimos Artigos
            </h2>
            <Link to="/blog">
              <Button variant="ghost" size="sm">Ver todos →</Button>
            </Link>
          </div>
          {articles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Em breve novos artigos.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link key={article.id} to={`/blog/${article.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <img
                      src={article.cover_image_url || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                    <CardContent className="p-6">
                      {article.category && (
                        <span className="text-xs text-primary font-semibold mb-2 block uppercase tracking-wider">
                          {article.category}
                        </span>
                      )}
                      <h3 className="font-archivo font-semibold text-foreground mb-3 line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
                      )}
                      <span className="text-primary font-medium text-sm">Ler Mais →</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-foreground))] py-12">
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
                <li><Link to="/admin/auth" className="opacity-60 hover:opacity-80 text-xs">Admin</Link></li>
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
              <h4 className="font-archivo font-semibold mb-4">Newsletter</h4>
              <p className="text-sm opacity-80 mb-4">
                Receba as últimas notícias e atualizações
              </p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Email" 
                  className="bg-background/10 border-background/20 text-foreground placeholder:text-muted-foreground"
                />
                <Button className="bg-primary hover:bg-primary/90">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-sm opacity-80">
            © 2025 Memoralis. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
