import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar, Heart, Star, Eye, MessageSquare, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-memoralis.svg";
import heroImage from "@/assets/hero-memorial.jpg";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicObituaryCard, type PublicObituary } from "@/components/obituaries/PublicObituaryCard";
import { fetchObituaryCounts } from "@/hooks/useObituaryCounts";
import { getActiveTag, hasUpcomingMass, type CeremonyEvent } from "@/lib/ceremony-utils";

const funeralHomes = Array(6).fill({
  name: "Funerária S. João",
  location: "Lisboa, Portugal",
  rating: 4.8,
  reviews: 245
});

const articles = [
  {
    title: "What is lorem ipsum simply text of explained",
    category: "CATEGORY",
    image: "/placeholder.svg"
  },
  {
    title: "Types of lorem ipsum",
    category: "CATEGORY",
    image: "/placeholder.svg"
  },
  {
    title: "How to transform your home on a budget",
    category: "CATEGORY",
    image: "/placeholder.svg"
  }
];

export default function Home() {
  const [obituaries, setObituaries] = useState<PublicObituary[]>([]);
  const [loadingObits, setLoadingObits] = useState(true);

  useEffect(() => {
    const loadObituaries = async () => {
      // Load recent obituaries
      const { data } = await supabase
        .from("obituaries")
        .select("id, display_name, birth_date, death_date, locality, freguesia, photo_url, funerarias(nome_comercial, slug)")
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input 
                      placeholder="Nome" 
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input 
                      placeholder="Localização" 
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input 
                      placeholder="Funerária" 
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
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
            <Button variant="ghost" size="sm">
              Ver todos →
            </Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingObits ? (
              Array(4).fill(null).map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-lg" />)
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
              Mantenha a memória viva com uma homenagem duradoura.
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Create your account</h4>
                  <p className="text-sm text-muted-foreground">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Add your property</h4>
                  <p className="text-sm text-muted-foreground">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Receive your quotly</h4>
                  <p className="text-sm text-muted-foreground">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-semibold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Connect with potential clients</h4>
                  <p className="text-sm text-muted-foreground">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              Criar Obituário
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Funeral Home Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-archivo font-bold text-primary-foreground">
              Destaques
            </h2>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-primary-foreground/90">
              Ver todos →
            </Button>
          </div>
          <Card className="overflow-hidden">
            <img 
              src="/placeholder.svg" 
              alt="Funerária S. João"
              className="w-full h-64 object-cover"
            />
            <CardContent className="p-6">
              <h3 className="text-2xl font-archivo font-bold text-foreground mb-4">
                Funerária S. João
              </h3>
              <Button className="bg-primary hover:bg-primary/90">
                Ver Mais
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Funeral Homes Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-archivo font-bold text-foreground">
            Funerárias
          </h2>
          <Button variant="ghost" size="sm">
            Ver todos →
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {funeralHomes.map((home, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl font-archivo font-bold">SJ</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-archivo font-semibold text-foreground mb-1">
                      {home.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {home.location}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm font-semibold">{home.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({home.reviews} avaliações)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Articles Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-archivo font-bold text-foreground">
              Últimos Artigos
            </h2>
            <Button variant="ghost" size="sm">
              Ver todos →
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-6">
                  <span className="text-xs text-primary font-semibold mb-2 block">
                    {article.category}
                  </span>
                  <h3 className="font-archivo font-semibold text-foreground mb-4">
                    {article.title}
                  </h3>
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Ler Mais →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-foreground))] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <img src={logo} alt="Memoralis" className="h-8" />
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
