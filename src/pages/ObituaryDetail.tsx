import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Facebook, MessageCircle, Mail, Link as LinkIcon, Printer, MapPin, Calendar, Clock, Heart, ThumbsUp, ChevronRight, Home, Eye, MessageSquare, Flame, Phone } from "lucide-react";
import { Link, useParams, useLocation } from "react-router-dom";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SendFlowersModal } from "@/components/flowers/SendFlowersModal";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import obituaryPlaceholder from "@/assets/obituary-placeholder.jpg";
import logo from "@/assets/logo-memoralis.png";

interface Obituary {
  id: string;
  display_name: string;
  full_name: string;
  birth_date: string | null;
  death_date: string | null;
  locality: string | null;
  freguesia: string | null;
  photo_url: string | null;
  public_message: string | null;
  hide_condolences: boolean | null;
  funeraria_id: string;
}

interface CeremonyEvent {
  id: string;
  event_type: string;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  map_link: string | null;
}

interface Funeraria {
  id: string;
  nome_comercial: string;
  telefone: string;
  email: string | null;
  morada: string | null;
  logo_url: string | null;
  slug: string | null;
  localidade: string | null;
  codigo_postal: string | null;
}

interface RelatedObituary {
  id: string;
  display_name: string;
  birth_date: string | null;
  death_date: string | null;
  locality: string | null;
  photo_url: string | null;
}

export default function ObituaryDetail() {
  const { id } = useParams();
  const [isFlowersModalOpen, setIsFlowersModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [obituary, setObituary] = useState<Obituary | null>(null);
  const [events, setEvents] = useState<CeremonyEvent[]>([]);
  const [funeraria, setFuneraria] = useState<Funeraria | null>(null);
  const [relatedObituaries, setRelatedObituaries] = useState<RelatedObituary[]>([]);

  const location = useLocation();

  useEffect(() => {
    if (id) loadObituaryData(id);
  }, [id]);

  useEffect(() => {
    if (!loading && obituary && location.hash === '#condolencias') {
      setTimeout(() => {
        document.getElementById('condolencias')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [loading, obituary, location.hash]);

  const [notPublished, setNotPublished] = useState(false);

  const loadObituaryData = async (obituaryId: string) => {
    try {
      setLoading(true);
      setNotPublished(false);

      // Fetch obituary
      const { data: obit, error } = await supabase
        .from("obituaries")
        .select("id, display_name, full_name, birth_date, death_date, locality, freguesia, photo_url, public_message, hide_condolences, funeraria_id")
        .eq("id", obituaryId)
        .maybeSingle();

      if (error || !obit) {
        // Check if user is authenticated owner — the obituary may exist but not be published
        const { data: session } = await supabase.auth.getSession();
        if (session?.session) {
          // Authenticated users can see their own obituaries via RLS
          // If the query returned null, it means either:
          // 1. The obituary doesn't exist at all
          // 2. The user is not the owner AND the obituary isn't published
          // We check if it exists for the owner (funeraria policy covers this)
          const { data: ownObit } = await supabase
            .from("obituaries")
            .select("id, is_public")
            .eq("id", obituaryId)
            .maybeSingle();

          if (ownObit && !ownObit.is_public) {
            setNotPublished(true);
            setLoading(false);
            return;
          }
        }
        console.error("Obituary not found:", error);
        setLoading(false);
        return;
      }
      setObituary(obit);

      // Fetch events, funeraria, and related in parallel
      const [eventsRes, funerariaRes, relatedRes] = await Promise.all([
        supabase.from("ceremony_events").select("id, event_type, event_date, event_time, location, map_link").eq("obituary_id", obit.id).order("event_date", { ascending: true }),
        supabase.from("funerarias").select("id, nome_comercial, telefone, email, morada, logo_url, slug, localidade, codigo_postal").eq("id", obit.funeraria_id).maybeSingle(),
        supabase.from("obituaries").select("id, display_name, birth_date, death_date, locality, photo_url").eq("funeraria_id", obit.funeraria_id).eq("is_public", true).neq("id", obit.id).order("created_at", { ascending: false }).limit(4),
      ]);

      setEvents(eventsRes.data || []);
      setFuneraria(funerariaRes.data);
      setRelatedObituaries(relatedRes.data || []);
    } catch (err) {
      console.error("Error loading obituary:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try { return format(new Date(dateStr), "dd/MM/yyyy", { locale: pt }); } catch { return dateStr; }
  };

  const getYear = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try { return new Date(dateStr).getFullYear().toString(); } catch { return "—"; }
  };

  const getAge = () => {
    if (!obituary?.birth_date || !obituary?.death_date) return null;
    try {
      const [bY, bM, bD] = obituary.birth_date.split("-").map(Number);
      const [dY, dM, dD] = obituary.death_date.split("-").map(Number);
      let age = dY - bY;
      if (dM < bM || (dM === bM && dD < bD)) age--;
      return age;
    } catch { return null; }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      velorio: "Velório",
      missa: "Missa",
      cremacao: "Cremação",
      sepultamento: "Sepultamento",
      funeral: "Funeral",
      outro: "Outro",
    };
    return labels[type] || type;
  };

  const locationStr = [obituary?.freguesia, obituary?.locality].filter(Boolean).join(" - ");
  const age = getAge();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (notPublished) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-archivo font-bold text-foreground mb-4">Obituário não publicado</h1>
          <p className="text-muted-foreground mb-6">Este obituário ainda não foi publicado. Complete e publique-o no dashboard para o tornar visível ao público.</p>
          <Button asChild><Link to="/obituario">Ver todos os obituários</Link></Button>
        </div>
      </div>
    );
  }

  if (!obituary) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-archivo font-bold text-foreground mb-4">Obituário não encontrado</h1>
          <p className="text-muted-foreground mb-6">O obituário que procura não existe ou não está disponível publicamente.</p>
          <Button asChild><Link to="/obituario">Ver todos os obituários</Link></Button>
        </div>
      </div>
    );
  }

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
            <Link to="/obituario" className="text-muted-foreground hover:text-primary">Obituário</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{obituary.display_name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Obituary Header */}
            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-[200px_1fr] gap-6">
                  <div>
                    <img
                      alt={obituary.display_name}
                      className="w-full aspect-[3/4] object-cover rounded-lg"
                      src={obituary.photo_url || obituaryPlaceholder}
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-archivo font-bold text-foreground mb-2">
                      {obituary.display_name}
                    </h1>
                    <p className="text-muted-foreground mb-1">
                      {getYear(obituary.birth_date)} - {getYear(obituary.death_date)}
                      {age !== null && ` | ${age} anos`}
                    </p>
                    {locationStr && (
                      <div className="flex items-center gap-2 text-muted-foreground mb-6">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{locationStr}</span>
                      </div>
                    )}

                    {/* Share */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="text-sm font-medium text-foreground">Partilhar</span>
                      <Button variant="outline" size="icon" className="h-9 w-9"><Facebook className="w-4 h-4" /></Button>
                      <Button variant="outline" size="icon" className="h-9 w-9"><MessageCircle className="w-4 h-4" /></Button>
                      <Button variant="outline" size="icon" className="h-9 w-9"><Mail className="w-4 h-4" /></Button>
                      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigator.clipboard.writeText(window.location.href)}><LinkIcon className="w-4 h-4" /></Button>
                      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => window.print()}><Printer className="w-4 h-4" /></Button>
                    </div>

                    <div className="flex gap-3">
                      {!obituary.hide_condolences && <Button variant="outline" onClick={() => document.getElementById('condolencias')?.scrollIntoView({ behavior: 'smooth' })}>Condolências</Button>}
                      <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsFlowersModalOpen(true)}>
                        Enviar Flores
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Family Message */}
            {obituary.public_message && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-archivo font-semibold text-foreground mb-4">
                    Mensagem da Família
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {obituary.public_message}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Events */}
            {events.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-2">{getEventTypeLabel(event.event_type)}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {event.event_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(event.event_date)}{event.event_time ? ` - ${event.event_time.substring(0, 5)}` : ""}</span>
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.map_link && (
                              <a href={event.map_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                                Ver no mapa
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Condolence Form */}
            {!obituary.hide_condolences && (
              <Card id="condolencias">
                <CardContent className="p-6">
                  <h2 className="text-xl font-archivo font-semibold text-foreground mb-6">
                    Envie Mensagem de Condolências
                  </h2>
                  <form className="space-y-4" onSubmit={handleCondolenceSubmit}>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Nome *</label>
                        <Input placeholder="O seu nome" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Email *</label>
                        <Input type="email" placeholder="email@exemplo.com" value={authorEmail} onChange={(e) => setAuthorEmail(e.target.value)} required />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Mensagem *</label>
                      <Textarea placeholder="Sentidas condolências..." rows={5} value={condolenceMessage} onChange={(e) => setCondolenceMessage(e.target.value)} required />
                    </div>
                    <Button className="bg-primary hover:bg-primary/90" type="submit" disabled={submittingCondolence}>
                      {submittingCondolence ? "A enviar..." : "Enviar mensagem"}
                    </Button>
                  </form>

                  {/* Approved condolences */}
                  {approvedCondolences.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-border space-y-4">
                      <h3 className="text-lg font-archivo font-semibold text-foreground">
                        Mensagens de Condolências ({approvedCondolences.length})
                      </h3>
                      {approvedCondolences.map((c) => (
                        <div key={c.id} className="bg-muted/30 rounded-lg p-4 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground text-sm">{c.author_name}</p>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(c.created_at), "dd/MM/yyyy", { locale: pt })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {funeraria && (() => {
              const fullAddress = [funeraria.morada, funeraria.codigo_postal, funeraria.localidade].filter(Boolean).join(", ");
              const mapsUrl = fullAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}` : null;
              const profileUrl = funeraria.slug ? `/funerarias/${funeraria.slug}` : null;

              return (
                <Card className="sticky top-24">
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                      {funeraria.logo_url ? (
                        <img src={funeraria.logo_url} alt={funeraria.nome_comercial} className="w-48 h-48 object-contain rounded mb-4" />
                      ) : (
                        <div className="w-48 h-48 bg-foreground rounded mb-4 flex items-center justify-center">
                          <span className="text-background font-bold text-4xl">
                            {funeraria.nome_comercial.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-archivo font-bold text-foreground text-center mb-6 text-2xl">
                      {profileUrl ? (
                        <Link to={profileUrl} className="hover:text-primary transition-colors">{funeraria.nome_comercial}</Link>
                      ) : funeraria.nome_comercial}
                    </h3>

                    <div className="space-y-3 mb-6">
                      <p className="font-semibold text-foreground text-center mb-2">Contactos</p>
                      <a href={`tel:${funeraria.telefone}`} className="text-muted-foreground hover:text-primary transition-colors text-sm text-center block">
                        {funeraria.telefone}
                      </a>
                      {funeraria.email && (
                        <a href={`mailto:${funeraria.email}`} className="text-muted-foreground hover:text-primary transition-colors text-sm text-center block">
                          {funeraria.email}
                        </a>
                      )}
                    </div>

                    {fullAddress && (
                      <div className="space-y-2 text-center mb-8">
                        <p className="font-semibold text-foreground mb-2">Morada</p>
                        {mapsUrl ? (
                          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-sm text-center block">
                            {fullAddress}
                          </a>
                        ) : (
                          <p className="text-muted-foreground text-sm text-center">
                            {fullAddress}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        </div>

        {/* Related Obituaries */}
        {relatedObituaries.length > 0 && (
          <section className="mt-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-archivo font-bold text-foreground">Outros óbitos</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/obituario">Ver todos →</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedObituaries.map((obit) => (
                <Link key={obit.id} to={`/obituario/${obit.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img src={obit.photo_url || obituaryPlaceholder} alt={obit.display_name} className="w-full aspect-[3/4] object-cover" />
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-archivo font-bold text-foreground text-lg">{obit.display_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getYear(obit.birth_date)} - {getYear(obit.death_date)}
                      </p>
                      {obit.locality && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">{obit.locality}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

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

      <SendFlowersModal
        open={isFlowersModalOpen}
        onOpenChange={setIsFlowersModalOpen}
        obituaryId={obituary.id}
        obituaryName={obituary.display_name}
        funerariaId={obituary.funeraria_id}
      />
    </div>
  );
}
