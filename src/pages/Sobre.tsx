import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Users, Shield, Award } from "lucide-react";
import logo from "@/assets/logo-memoralis.png";
import heroImage from "@/assets/sobre-hero.jpg";

const Sobre = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sobre a Memoralis</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            Dignificando memórias, apoiando famílias
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">A Nossa Missão</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A Memoralis nasceu com o propósito de transformar a forma como honramos e preservamos 
              a memória daqueles que partiram. Acreditamos que cada vida merece ser celebrada com 
              dignidade, respeito e carinho.
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-6">
              Num momento de perda, as famílias enfrentam não só a dor emocional, mas também 
              a complexidade de organizar cerimónias e gerir documentação. A Memoralis surge 
              como uma solução integrada que simplifica estes processos, permitindo que as 
              famílias se concentrem no que realmente importa: estar juntas e honrar a memória 
              dos seus entes queridos.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Trabalhamos em estreita colaboração com funerárias em todo o país, oferecendo 
              uma plataforma digital moderna que facilita a gestão de obituários, cerimónias 
              e toda a documentação necessária, sempre com o máximo respeito e profissionalismo.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Os Nossos Valores</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Empatia</h3>
              <p className="text-muted-foreground">
                Compreendemos a dor da perda e oferecemos apoio com sensibilidade e respeito.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Segurança</h3>
              <p className="text-muted-foreground">
                Protegemos os dados e memórias das famílias com os mais altos padrões de segurança.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Comunidade</h3>
              <p className="text-muted-foreground">
                Criamos laços entre famílias e profissionais, fortalecendo o apoio mútuo.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Excelência</h3>
              <p className="text-muted-foreground">
                Comprometemo-nos com a qualidade em cada detalhe do nosso serviço.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">A Nossa Plataforma</h2>
          
          <div className="space-y-8">
            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-2xl font-semibold mb-3">Para Famílias</h3>
              <p className="text-muted-foreground leading-relaxed">
                Acesso fácil a obituários, informações sobre cerimónias e um espaço digital 
                para partilhar memórias e condolências. Tudo num só lugar, disponível a 
                qualquer momento.
              </p>
            </div>
            
            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-2xl font-semibold mb-3">Para Funerárias</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ferramentas completas para gestão de obituários, documentação, cerimónias e 
                comunicação com famílias. Simplifique processos e ofereça um serviço de 
                excelência.
              </p>
            </div>
            
            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-2xl font-semibold mb-3">Tecnologia com Coração</h3>
              <p className="text-muted-foreground leading-relaxed">
                Combinamos inovação tecnológica com sensibilidade humana, criando soluções 
                que respeitam a importância de cada momento e cada memória.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Junte-se à Memoralis
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Se é uma funerária e quer oferecer o melhor serviço às famílias que serve, 
            ou se procura informação sobre um ente querido, estamos aqui para ajudar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/funeraria/register">Registar Funerária</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contactos">Entre em Contacto</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo and Description */}
            <div className="md:col-span-1">
              <img src={logo} alt="Memoralis" className="h-10 mb-4" />
              <p className="text-sm text-muted-foreground">
                Dignificando memórias, apoiando famílias em momentos difíceis.
              </p>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Início
                  </Link>
                </li>
                <li>
                  <Link to="/obituario" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Obituário
                  </Link>
                </li>
                <li>
                  <Link to="/funerarias" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Funerárias
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Recursos */}
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/sobre" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link to="/contactos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contactos
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link to="/funeraria/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Registar Funerária
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Receba atualizações e informações úteis.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="O seu email"
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                />
                <Button size="sm">Subscrever</Button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Memoralis. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Sobre;
