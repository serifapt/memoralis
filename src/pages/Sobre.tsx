import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Heart, Users, Shield, Award, CheckCircle2, ArrowRight, Sparkles, Building2, Flower2, Church } from "lucide-react";
import logo from "@/assets/logo-memoralis.svg";

const Sobre = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-primary/10">
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-20">
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Button size="lg" className="px-6 py-5 bg-primary hover:bg-primary/90 group" asChild>
              <Link to="/funeraria/register">
                Comece Agora
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-6 py-5" 
              asChild
            >
              <Link to="/contactos">Saber Mais</Link>
            </Button>
          </div>
          
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-5xl">
          <Tabs defaultValue="publico" className="w-full">
            <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-3 mb-10 h-auto">
              <TabsTrigger value="publico" className="py-3">Público</TabsTrigger>
              <TabsTrigger value="profissional" className="py-3">Agências Funerárias</TabsTrigger>
              <TabsTrigger value="servicos" className="py-3">Serviços</TabsTrigger>
            </TabsList>

            {/* PUBLICO */}
            <TabsContent value="publico" className="space-y-8">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-3">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Para as Famílias</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
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
            <TabsContent value="profissional" className="space-y-8">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-3">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Para Funerárias</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                  A plataforma que profissionaliza o seu serviço
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Gestão completa de obituários, cerimónias, documentação social, orçamentos e
                  comunicação com famílias — tudo numa única solução.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
                  <Building2 className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Página pública dedicada</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Apresente a sua funerária com perfil próprio, obituários ativos e testemunhos.
                  </p>
                </Card>
                <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
                  <Shield className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Documentação automática</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Geração automática de formulários da Segurança Social e participações.
                  </p>
                </Card>
                <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
                  <Award className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Orçamentos e clientes</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Crie orçamentos profissionais e mantenha o histórico de clientes organizado.
                  </p>
                </Card>
              </div>
              <div className="text-center">
                <Button asChild><Link to="/funeraria/register">Registar Funerária <ArrowRight className="ml-2 w-4 h-4" /></Link></Button>
              </div>
            </TabsContent>

            {/* SERVIÇOS */}
            <TabsContent value="servicos" className="space-y-8">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-3">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Serviços Memoralis</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
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
