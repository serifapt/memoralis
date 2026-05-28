import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Heart,
  Users,
  Shield,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  Flower2,
  Church,
  ClipboardList,
  FileCheck2,
  Newspaper,
  FolderArchive,
  Calculator,
  BarChart3,
  Calendar,
} from "lucide-react";
import logo from "@/assets/logo-memoralis.svg";
import screenDashboard from "@/assets/screen-dashboard.png";
import screenObituaryEditor from "@/assets/screen-obituary-editor.png";
import screenSsForms from "@/assets/screen-ss-forms.png";
import screenFlowersBudget from "@/assets/screen-flowers-budget.png";

const BrowserFrame = ({
  src,
  alt,
  url = "memoralis.pt/dashboard",
}: {
  src: string;
  alt: string;
  url?: string;
}) => (
  <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-3xl scale-90 -z-10" />
    <div className="relative rounded-xl overflow-hidden border border-border bg-card shadow-2xl">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted border-b border-border">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
        </div>
        <div className="flex-1 mx-3 px-3 py-0.5 rounded-md bg-background/60 text-[10px] text-muted-foreground truncate">
          {url}
        </div>
      </div>
      <img
        src={src}
        alt={alt}
        width={1440}
        height={900}
        loading="lazy"
        className="block w-full h-auto"
      />
    </div>
  </div>
);

const funerariaFeatures = [
  {
    icon: ClipboardList,
    title: "Gestão do processo fúnebre",
    description: "Centralize todo o processo do falecido, do primeiro contacto à cerimónia, num único fluxo.",
  },
  {
    icon: FileCheck2,
    title: "Formulários SS e CGA automáticos",
    description: "9 formulários da Segurança Social e Caixa Geral de Aposentações preenchidos automaticamente.",
  },
  {
    icon: Newspaper,
    title: "Anúncio fúnebre automático",
    description: "Gere anúncios em formato A4 prontos a imprimir ou partilhar nas redes sociais.",
  },
  {
    icon: FolderArchive,
    title: "Arquivo de documentação",
    description: "Mantenha documentos da funerária e de cada falecido organizados e seguros na nuvem.",
  },
  {
    icon: Calculator,
    title: "Orçamentação digital",
    description: "Crie orçamentos profissionais em minutos, converta em obituários e siga o estado em tempo real.",
  },
  {
    icon: Flower2,
    title: "Catálogo de flores",
    description: "Permita que o público envie flores para o funeral diretamente a partir do obituário.",
  },
  {
    icon: BarChart3,
    title: "Eventos e estatísticas",
    description: "Acompanhe próximas cerimónias, visualizações e métricas de engagement num só painel.",
  },
];

const Sobre = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const validTabs = ["profissional", "publico", "servicos"];
  const hash = location.hash.replace("#", "");
  const initial = validTabs.includes(hash) ? hash : "profissional";
  const [tab, setTab] = useState(initial);

  useEffect(() => {
    const h = location.hash.replace("#", "");
    if (validTabs.includes(h) && h !== tab) {
      setTab(h);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.hash]);

  const handleTabChange = (value: string) => {
    setTab(value);
    navigate(`/sobre#${value}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-primary/10">
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">Inovação com Sensibilidade</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight animate-fade-in leading-tight">
            Sobre a <span className="text-primary">Memoralis</span>
          </h1>
          
          <p className="text-lg md:text-xl max-w-3xl mx-auto font-light leading-relaxed mb-8 animate-fade-in text-muted-foreground">
            Unimos tecnologia e sensibilidade para digitalizar o último adeus, 
            oferecendo às funerárias uma plataforma completa e às famílias um espaço 
            digno e permanente para honrar quem partiu.
          </p>

        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-5xl">
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full max-w-3xl mx-auto grid grid-cols-3 mb-12 h-auto p-1.5 bg-muted">
              <TabsTrigger
                value="profissional"
                className="flex-col gap-1.5 py-3 px-4 h-auto text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Building2 className="w-5 h-5" />
                <span className="hidden sm:inline">Agências Funerárias</span>
                <span className="sm:hidden">Funerárias</span>
              </TabsTrigger>
              <TabsTrigger
                value="publico"
                className="flex-col gap-1.5 py-3 px-4 h-auto text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="w-5 h-5" />
                <span className="hidden sm:inline">Público</span>
                <span className="sm:hidden">Família</span>
              </TabsTrigger>
              <TabsTrigger
                value="servicos"
                className="flex-col gap-1.5 py-3 px-4 h-auto text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Sparkles className="w-5 h-5" />
                <span>Serviços</span>
              </TabsTrigger>
            </TabsList>

            {/* PUBLICO */}
            <TabsContent value="publico" className="space-y-8">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-3">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Para as Famílias</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-primary">
                  Um espaço digno para honrar quem partiu
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Consulte obituários publicados pelas funerárias parceiras, conheça as cerimónias,
                  partilhe condolências e mantenha viva a memória dos seus entes queridos — tudo num
                  só lugar, acessível 24 horas por dia.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
                  <Heart className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Obituários digitais</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Aceda a homenagens com fotografia, biografia, cerimónias e contactos da funerária.
                  </p>
                </Card>
                <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
                  <CheckCircle2 className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Condolências e velas</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Deixe uma mensagem ou acenda uma vela virtual em memória de quem partiu.
                  </p>
                </Card>
                <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
                  <Flower2 className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Envio de flores</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Encomende arranjos florais entregues diretamente nas cerimónias.
                  </p>
                </Card>
              </div>
              <div className="text-center">
                <Button asChild><Link to="/obituarios">Ver Obituários <ArrowRight className="ml-2 w-4 h-4" /></Link></Button>
              </div>
            </TabsContent>

            {/* PROFISSIONAL */}
            <TabsContent value="profissional" className="space-y-32">
              {/* Hero interno + mockup */}
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-3">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Para Funerárias</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight text-primary leading-tight">
                  A plataforma que profissionaliza o seu serviço
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
                  Gestão completa do processo fúnebre, formulários automáticos, orçamentos, anúncios
                  e catálogo de flores — tudo numa única solução pensada para funerárias modernas.
                </p>
              </div>

              {/* Screen principal — Dashboard real */}
              <div className="max-w-5xl mx-auto">
                <BrowserFrame
                  src={screenDashboard}
                  alt="Dashboard Memoralis para funerárias"
                  url="memoralis.pt/dashboard"
                />
              </div>

              {/* Grelha "Tudo num só sítio" */}
              <div id="funcionalidades-funeraria" className="scroll-mt-24">
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Tudo num <span className="text-primary">só sítio</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    As ferramentas essenciais para gerir a sua funerária de ponta a ponta.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {funerariaFeatures.map(({ icon: Icon, title, description }) => (
                    <Card
                      key={title}
                      className="p-6 border-2 hover:border-primary/50 hover:shadow-lg transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">{title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-10">
                <div className="order-2 lg:order-1">
                  <BrowserFrame
                    src={screenObituaryEditor}
                    alt="Editor de obituário com gestão do processo fúnebre"
                    url="memoralis.pt/obituaries/editar"
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <div className="inline-block px-2.5 py-1 bg-primary/10 rounded-full mb-3">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Processo Fúnebre
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight text-primary">
                    Gestão completa do falecido, do início ao fim
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-5">
                    Centralize todos os dados do falecido, família, cerimónias e documentação num
                    único editor com autosave, progresso em tempo real e pré-visualização instantânea.
                  </p>
                  <ul className="space-y-2.5">
                    {[
                      "Editor com autosave e indicador de progresso",
                      "Multi-cerimónias: velório, missa, cortejo, cremação",
                      "Pré-visualização do obituário público antes de publicar",
                    ].map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Zigzag 2 — Formulários SS/CGA */}
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-10">
                <div>
                  <div className="inline-block px-2.5 py-1 bg-primary/10 rounded-full mb-3">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Segurança Social & CGA
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight text-primary">
                    9 formulários preenchidos automaticamente
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-5">
                    Esqueça o preenchimento manual repetitivo. A Memoralis gera automaticamente os
                    formulários da Segurança Social, Caixa Geral de Aposentações e participações de
                    óbito a partir dos dados do processo.
                  </p>
                  <ul className="space-y-2.5">
                    {[
                      "Subsídio de Funeral, Pensão de Sobrevivência e mais 7 formulários",
                      "PDFs prontos a imprimir, assinar e entregar",
                      "Horas poupadas em cada processo",
                    ].map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <BrowserFrame
                    src={screenSsForms}
                    alt="Formulários da Segurança Social e CGA gerados automaticamente"
                    url="memoralis.pt/obituaries/documentos"
                  />
                </div>
              </div>

              {/* Zigzag 3 — Flores + Orçamentação */}
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-10">
                <div className="order-2 lg:order-1">
                  <BrowserFrame
                    src={screenFlowersBudget}
                    alt="Catálogo de flores e orçamentação digital"
                    url="memoralis.pt/budgets"
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <div className="inline-block px-2.5 py-1 bg-primary/10 rounded-full mb-3">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Flores & Orçamentos
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight text-primary">
                    Catálogo de flores e orçamentação digital
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-5">
                    Permita que o público envie flores para o funeral diretamente a partir do
                    obituário e gere orçamentos profissionais que se convertem em obituários com
                    um clique.
                  </p>
                  <ul className="space-y-2.5">
                    {[
                      "Catálogo de flores integrado em cada obituário",
                      "Orçamentos com PDF profissional automático",
                      "Conversão direta de orçamento aceite para novo obituário",
                    ].map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA Agendamento */}
              <div className="text-center max-w-2xl mx-auto py-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Demonstração Gratuita</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                  Quer ver a plataforma em ação?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Agende uma chamada de 15 minutos connosco. Conheça as funcionalidades e tire todas as suas dúvidas.
                </p>
                <Button size="lg" className="px-8 group" asChild>
                  <a
                    href="https://calendar.app.google/oirxZJvVLVSMZ5JN7"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Agendar Demonstração
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </div>

              {/* Banda escura com stats */}
              <div className="relative overflow-hidden rounded-3xl bg-[hsl(var(--footer-bg))] text-white p-10 md:p-14">
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
                <div className="relative text-center max-w-2xl mx-auto mb-10">
                  <h3 className="text-2xl md:text-4xl font-bold tracking-tight">
                    Poupe tempo. Profissionalize o serviço.
                  </h3>
                  <p className="text-white/70 mt-2">
                    Resultados reais que as funerárias parceiras já sentem no dia-a-dia.
                  </p>
                </div>
                <div className="relative grid sm:grid-cols-3 gap-6">
                  {[
                    { value: "9", label: "Formulários SS e CGA preenchidos automaticamente" },
                    { value: "+5h", label: "Poupadas por processo fúnebre" },
                    { value: "100%", label: "Digital, sem papel, sem perdas" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                    >
                      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                      <p className="text-sm text-white/80 leading-relaxed">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA final */}
              <div className="text-center max-w-xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                  Pronto para profissionalizar a sua funerária?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Registo gratuito. Sem cartão de crédito. Comece em minutos.
                </p>
                <Button size="lg" className="px-8 group" asChild>
                  <Link to="/funeraria/register">
                    Registar Funerária
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </TabsContent>

            {/* SERVIÇOS */}
            <TabsContent value="servicos" className="space-y-8">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-3">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Serviços Memoralis</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-primary">
                  Serviços complementares
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Para além da plataforma digital, oferecemos serviços que continuam a homenagem
                  muito depois da despedida.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
                  <Sparkles className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Memoralis Care</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Manutenção contínua de campas e jazigos, com relatórios fotográficos antes e depois.
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/care">Saber mais</Link>
                  </Button>
                </Card>
                <Card className="p-6 border-2 border-dashed">
                  <Flower2 className="w-8 h-8 text-muted-foreground mb-3" />
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">Diretório de Floristas</h3>
                    <Badge variant="secondary" className="text-xs">Brevemente</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Encontre floristas locais para acompanhar momentos de despedida e homenagem.
                  </p>
                </Card>
                <Card className="p-6 border-2 border-dashed">
                  <Church className="w-8 h-8 text-muted-foreground mb-3" />
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">Missas por Paróquia</h3>
                    <Badge variant="secondary" className="text-xs">Brevemente</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Horários e informações de missas em paróquias a nível nacional.
                  </p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-3">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Nossos Valores</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              Princípios que nos Guiam
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
              <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Empatia</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Compreendemos a delicadeza do momento e desenvolvemos cada funcionalidade 
                com respeito, humanidade e a devida sensibilidade.
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
              <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Segurança</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Protegemos os dados e memórias das famílias com os mais elevados padrões de 
                segurança e privacidade digital.
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
              <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Comunidade</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Fortalecemos laços entre famílias e profissionais, criando uma rede de apoio 
                mútuo e solidariedade.
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
              <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Excelência</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Comprometemo-nos com a máxima qualidade em cada detalhe do nosso serviço e 
                plataforma tecnológica.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-3">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Nossa Plataforma</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Soluções Integradas e Eficientes
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Tecnologia avançada ao serviço de profissionais e famílias
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Para Famílias</h3>
              <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                Espaço digital seguro para consultar obituários, informações sobre cerimónias e partilhar 
                memórias. Disponível 24 horas por dia.
              </p>
              <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                <span>Acesso simplificado</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
            
            <Card className="p-6 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Para Funerárias</h3>
              <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                Plataforma completa que centraliza obituários, documentação e comunicação com famílias. 
                Automatize processos e eleve o padrão de serviço.
              </p>
              <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                <span>Gestão profissional</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
            
            <Card className="p-6 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Tecnologia Humanizada</h3>
              <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                Inovação tecnológica com profundo respeito pela dimensão humana. Cada funcionalidade 
                considera a delicadeza do contexto.
              </p>
              <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                <span>Inovação com empatia</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Comece Hoje</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Junte-se à Memoralis
          </h2>
          <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Faça parte da nossa rede de profissionais dedicados a oferecer o melhor serviço 
            às famílias portuguesas em momentos de despedida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="px-6 py-5" asChild>
              <Link to="/funeraria/register">
                Registar Funerária
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-6 py-5" asChild>
              <Link to="/contactos">Entre em Contacto</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Tem dúvidas? A nossa equipa está disponível para ajudar.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-foreground))] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
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
                <li><Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">Início</Link></li>
                <li><Link to="/sobre" className="opacity-80 hover:opacity-100 transition-opacity">Sobre</Link></li>
                <li><Link to="/blog" className="opacity-80 hover:opacity-100 transition-opacity">Blog</Link></li>
                <li><Link to="/contactos" className="opacity-80 hover:opacity-100 transition-opacity">Contactos</Link></li>
                <li><Link to="/admin/auth" className="opacity-60 hover:opacity-80 text-xs transition-opacity">Admin</Link></li>
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
                <li><Link to="/ajuda" className="opacity-80 hover:opacity-100 transition-opacity">Ajuda</Link></li>
                <li><Link to="/privacidade" className="opacity-80 hover:opacity-100 transition-opacity">Privacidade</Link></li>
                <li><Link to="/termos" className="opacity-80 hover:opacity-100 transition-opacity">Termos</Link></li>
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
};

export default Sobre;
