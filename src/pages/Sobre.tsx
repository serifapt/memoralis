import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Heart, Users, Shield, Award, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import logo from "@/assets/logo-memoralis.png";
import heroImage from "@/assets/sobre-hero.jpg";

const Sobre = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-primary/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wider">Inovação com Sensibilidade</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in leading-tight">
            Sobre a <span className="text-primary">Memoralis</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto font-light leading-relaxed mb-8 animate-fade-in">
            Transformamos a forma como honramos memórias, oferecendo dignidade e apoio 
            às famílias nos momentos mais delicados da vida
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Button size="lg" className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 group" asChild>
              <Link to="/funeraria/register">
                Comece Agora
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-6 text-lg bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white" 
              asChild
            >
              <Link to="/contactos">Saber Mais</Link>
            </Button>
          </div>
          
          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">100+</div>
              <div className="text-sm md:text-base text-white/80">Funerárias Parceiras</div>
            </div>
            <div className="text-center border-x border-white/20">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">5000+</div>
              <div className="text-sm md:text-base text-white/80">Famílias Apoiadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm md:text-base text-white/80">Suporte Disponível</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Nossa Missão</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Transformar a Gestão de Memórias
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              A Memoralis nasceu com o propósito de transformar a forma como honramos e preservamos 
              a memória daqueles que partiram. Acreditamos que cada vida merece ser celebrada com 
              dignidade, respeito e carinho.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 border-2 hover:border-primary/50 transition-colors">
              <CheckCircle2 className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Apoio às Famílias</h3>
              <p className="text-muted-foreground leading-relaxed">
                Num momento de perda, as famílias enfrentam não só a dor emocional, mas também 
                a complexidade de organizar cerimónias e gerir documentação. Simplificamos estes 
                processos, permitindo que se concentrem no que realmente importa.
              </p>
            </Card>
            
            <Card className="p-8 border-2 hover:border-primary/50 transition-colors">
              <CheckCircle2 className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Parceria com Profissionais</h3>
              <p className="text-muted-foreground leading-relaxed">
                Trabalhamos em estreita colaboração com funerárias em todo o país, oferecendo 
                uma plataforma digital moderna que facilita a gestão de obituários, cerimónias 
                e toda a documentação necessária, com máximo profissionalismo.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Nossos Valores</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Princípios que nos Guiam
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Empatia</h3>
              <p className="text-muted-foreground leading-relaxed">
                Compreendemos profundamente a dor da perda e oferecemos apoio com sensibilidade, 
                respeito e humanidade em cada interação.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Segurança</h3>
              <p className="text-muted-foreground leading-relaxed">
                Protegemos os dados e memórias das famílias com os mais elevados padrões de 
                segurança e privacidade digital.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Comunidade</h3>
              <p className="text-muted-foreground leading-relaxed">
                Fortalecemos laços entre famílias e profissionais, criando uma rede de apoio 
                mútuo e solidariedade.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Excelência</h3>
              <p className="text-muted-foreground leading-relaxed">
                Comprometemo-nos com a máxima qualidade em cada detalhe do nosso serviço e 
                plataforma tecnológica.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Nossa Plataforma</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Soluções Integradas e Eficientes
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tecnologia avançada ao serviço de profissionais e famílias
            </p>
          </div>
          
          <div className="space-y-6 max-w-5xl mx-auto">
            <Card className="p-8 md:p-10 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Para Famílias</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                    Oferecemos às famílias um espaço digital seguro e acessível para consultar obituários, 
                    informações sobre cerimónias e partilhar memórias. Uma experiência intuitiva que respeita 
                    a sensibilidade do momento, disponível 24 horas por dia.
                  </p>
                  <div className="flex items-center text-primary font-medium">
                    <span>Acesso simplificado</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-8 md:p-10 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Para Funerárias</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                    Plataforma completa de gestão que centraliza obituários, documentação, organização de 
                    cerimónias e comunicação com famílias. Automatize processos, reduza erros e eleve o 
                    padrão de serviço ao cliente com ferramentas profissionais.
                  </p>
                  <div className="flex items-center text-primary font-medium">
                    <span>Gestão profissional</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-8 md:p-10 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Tecnologia com Sensibilidade</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                    Combinamos inovação tecnológica de ponta com profundo respeito pela dimensão humana. 
                    Cada funcionalidade é desenvolvida considerando a delicadeza do contexto e a importância 
                    de cada memória preservada.
                  </p>
                  <div className="flex items-center text-primary font-medium">
                    <span>Inovação humanizada</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Comece Hoje</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Junte-se à Memoralis
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Faça parte da nossa rede de profissionais dedicados a oferecer o melhor serviço 
            às famílias portuguesas em momentos de despedida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="px-8 py-6 text-lg" asChild>
              <Link to="/funeraria/register">
                Registar Funerária
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg" asChild>
              <Link to="/contactos">Entre em Contacto</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-8">
            Tem dúvidas? A nossa equipa está disponível para ajudar.
          </p>
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
                <li><Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">Início</Link></li>
                <li><Link to="/sobre" className="opacity-80 hover:opacity-100 transition-opacity">Sobre</Link></li>
                <li><Link to="/blog" className="opacity-80 hover:opacity-100 transition-opacity">Blog</Link></li>
                <li><Link to="/contactos" className="opacity-80 hover:opacity-100 transition-opacity">Contactos</Link></li>
                <li><Link to="/admin/auth" className="opacity-60 hover:opacity-80 text-xs transition-opacity">Admin</Link></li>
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
