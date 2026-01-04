import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Flower2, Calendar, ChevronRight } from "lucide-react";

export default function CareLanding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            Cuidado & Homenagem
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Honre a memória dos seus entes queridos
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Serviço de manutenção e cuidado de campas com subscrição mensal ou anual. 
            Mantenha viva a lembrança, mesmo à distância.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/care/plans">
                Ver Planos
                <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/care/auth">
                Entrar na Conta
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Como funciona
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cuidado Regular</h3>
              <p className="text-muted-foreground">
                Limpeza mensal da campa, remoção de ervas e manutenção geral por técnicos profissionais.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flower2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flores Frescas</h3>
              <p className="text-muted-foreground">
                Nos planos superiores, colocação de flores frescas mensais e decoração em datas especiais.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Relatório Fotográfico</h3>
              <p className="text-muted-foreground">
                Receba fotos antes e depois de cada visita, com acesso a todo o histórico de serviços.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Comece hoje
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Escolha o plano ideal e deixe-nos cuidar do memorial dos seus entes queridos.
          </p>
          <Button size="lg" asChild>
            <Link to="/care/plans">
              Escolher Plano
              <ChevronRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Memoralis. Todos os direitos reservados.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <Link to="/sobre" className="hover:text-foreground transition-colors">Sobre</Link>
            <Link to="/contactos" className="hover:text-foreground transition-colors">Contactos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
