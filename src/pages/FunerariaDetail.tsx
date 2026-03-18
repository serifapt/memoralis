import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  Home,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "@/assets/logo-memoralis.png";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { TestimonialsSection } from "@/components/funeraria/TestimonialsSection";

interface FunerariaData {
  id: string;
  nome_comercial: string;
  telefone: string;
  email: string | null;
  morada: string | null;
  logo_url: string | null;
  descricao: string | null;
  servicos: string[] | null;
  website: string | null;
  telefone_secundario: string | null;
  horario: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  localidade: string | null;
  codigo_postal: string | null;
  cover_image_url: string | null;
}

interface PublicObituary {
  id: string;
  display_name: string;
  birth_date: string | null;
  death_date: string | null;
  locality: string | null;
  photo_url: string | null;
  service_type: string | null;
}

export default function FunerariaDetail() {
  const { id } = useParams();
  const [funeraria, setFuneraria] = useState<FunerariaData | null>(null);
  const [obituaries, setObituaries] = useState<PublicObituary[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) loadFuneraria();
  }, [id]);

  const loadFuneraria = async () => {
    try {
      // Try by UUID first, then by slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id!);
      
      let query = supabase
        .from("funerarias")
        .select("id, nome_comercial, telefone, email, morada, logo_url, descricao, servicos, website, telefone_secundario, horario, facebook_url, instagram_url, linkedin_url, localidade, codigo_postal, cover_image_url, pagina_publica_visivel")
        .eq("pagina_publica_visivel", true);

      if (isUuid) {
        query = query.eq("id", id!);
      } else {
        query = query.eq("slug", id!);
      }

      const { data, error } = await query.maybeSingle();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      setFuneraria(data as unknown as FunerariaData);

      // Load public obituaries for this funeraria
      const { data: obits } = await supabase
        .from("obituaries")
        .select("id, display_name, birth_date, death_date, locality, photo_url, service_type")
        .eq("funeraria_id", data.id)
        .eq("is_public", true)
        .eq("is_completed", true)
        .order("death_date", { ascending: false })
        .limit(8);

      if (obits) setObituaries(obits);
    } catch (err) {
      console.error("Error loading funeraria:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const getAge = (birth: string | null, death: string | null) => {
    if (!birth || !death) return null;
    const b = new Date(birth);
    const d = new Date(death);
    return Math.floor((d.getTime() - b.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !funeraria) {
    return (
      <div className="min-h-screen bg-background font-inter">
        <PublicHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-archivo font-bold text-foreground mb-4">Funerária não encontrada</h1>
          <p className="text-muted-foreground mb-6">Esta página não existe ou não está disponível publicamente.</p>
          <Button asChild><Link to="/">Voltar ao início</Link></Button>
        </div>
      </div>
    );
  }

  const fullAddress = [funeraria.morada, funeraria.codigo_postal, funeraria.localidade].filter(Boolean).join(" | ");

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary flex items-center gap-1">
              <Home className="w-4 h-4" /> Início
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{funeraria.nome_comercial}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header Info */}
        <div className="mb-8">
          <h1 className="text-4xl font-archivo font-bold text-foreground mb-4">{funeraria.nome_comercial}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
            {fullAddress && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{fullAddress}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{funeraria.telefone}</span>
            </div>
            {funeraria.website && (
              <a href={funeraria.website.startsWith("http") ? funeraria.website : `https://${funeraria.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary">
                <Globe className="w-4 h-4" />
                <span>Website</span>
              </a>
            )}
            {funeraria.horario && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Horário: {funeraria.horario.split("\n")[0]}</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        <Card className="overflow-hidden mb-8">
          <div className="grid md:grid-cols-[400px_1fr] gap-4 p-4">
            {/* Logo */}
            <div className="bg-muted rounded-lg flex items-center justify-center p-6 h-[400px] w-full md:w-[400px]">
              {funeraria.logo_url ? (
                <img src={funeraria.logo_url} alt={funeraria.nome_comercial} className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-center">
                  <div className="text-6xl font-archivo font-bold mb-2">{getInitials(funeraria.nome_comercial)}</div>
                  <div className="text-sm font-semibold">{funeraria.nome_comercial}</div>
                </div>
              )}
            </div>
            
            {/* Cover Image */}
            <div className="relative">
              {funeraria.cover_image_url ? (
                <img src={funeraria.cover_image_url} alt={funeraria.nome_comercial} className="w-full h-[400px] object-cover rounded-lg" />
              ) : (
                <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Sem imagem de capa</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* About Section */}
            {funeraria.descricao && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-archivo font-bold text-foreground mb-4">Sobre</h2>
                  <div className="text-muted-foreground space-y-4 leading-relaxed whitespace-pre-line">
                    {funeraria.descricao}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services Section */}
            {funeraria.servicos && funeraria.servicos.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-archivo font-bold text-foreground mb-6">Serviços</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {funeraria.servicos.map((service, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">{service}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-archivo font-bold text-foreground mb-6">Contactos</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {fullAddress && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Morada</h3>
                      <p className="text-sm text-muted-foreground">
                        {funeraria.morada && <>{funeraria.morada}<br /></>}
                        {[funeraria.codigo_postal, funeraria.localidade].filter(Boolean).join(" ")}
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Contactos</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{funeraria.telefone}</p>
                      {funeraria.telefone_secundario && <p>{funeraria.telefone_secundario}</p>}
                      {funeraria.email && <p>{funeraria.email}</p>}
                      {funeraria.website && <p>{funeraria.website}</p>}
                    </div>
                  </div>
                  {funeraria.horario && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Horário</h3>
                      <div className="text-sm text-muted-foreground whitespace-pre-line">
                        {funeraria.horario}
                      </div>
                    </div>
                  )}
                </div>
                {(funeraria.facebook_url || funeraria.instagram_url || funeraria.linkedin_url) && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="font-semibold text-foreground mb-3">Seguir</h3>
                    <div className="flex gap-3">
                      {funeraria.facebook_url && (
                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                          <a href={funeraria.facebook_url} target="_blank" rel="noopener noreferrer"><Facebook className="w-4 h-4" /></a>
                        </Button>
                      )}
                      {funeraria.instagram_url && (
                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                          <a href={funeraria.instagram_url} target="_blank" rel="noopener noreferrer"><Instagram className="w-4 h-4" /></a>
                        </Button>
                      )}
                      {funeraria.linkedin_url && (
                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                          <a href={funeraria.linkedin_url} target="_blank" rel="noopener noreferrer"><Linkedin className="w-4 h-4" /></a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Obituaries */}
            {obituaries.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-archivo font-bold text-foreground">Obituário</h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/obituario">Ver todos →</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {obituaries.map((obit) => {
                    const age = getAge(obit.birth_date, obit.death_date);
                    return (
                      <Link key={obit.id} to={`/obituario/${obit.id}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative">
                            <img
                              src={obit.photo_url || "/placeholder.svg"}
                              alt={obit.display_name}
                              className="w-full aspect-[3/4] object-cover"
                            />
                            {obit.service_type && (
                              <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-0">
                                {obit.service_type}
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-4 space-y-2">
                            <h3 className="font-archivo font-bold text-foreground text-lg">{obit.display_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {obit.birth_date && new Date(obit.birth_date).getFullYear()} - {obit.death_date && new Date(obit.death_date).getFullYear()}
                              {age !== null && ` | ${age} Anos`}
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
                    );
                  })}
                </div>
              </div>
            )}

            {/* Testimonials */}
            <TestimonialsSection funerariaId={funeraria.id} funerariaName={funeraria.nome_comercial} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-archivo font-bold text-foreground mb-6">
                  Contactar {funeraria.nome_comercial}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Preencha o formulário com a sua mensagem.
                </p>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Nome *</label>
                    <Input placeholder="Nome" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Contacto *</label>
                    <Input placeholder="Contacto" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Email *</label>
                    <Input type="email" placeholder="Email" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Mensagem *</label>
                    <Textarea placeholder="Mensagem" rows={5} />
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">Enviar mensagem</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
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
    </div>
  );
}
