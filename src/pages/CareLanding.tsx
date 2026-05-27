import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Sparkles, MapPin, Camera, ClipboardList, Phone, Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CareSiteHeader } from "@/components/care/CareSiteHeader";
import { CemeteryMap, Cemetery } from "@/components/care/CemeteryMap";

const PLANS = [
  { code: "mensal", name: "Mensal", price: 50, freq: "1 visita por mês", popular: false,
    items: ["Limpeza geral da campa", "2 composições de flores frescas da época (vaso e jarra)", "1 círio branco/vermelho 60LL", "Foto antes/depois"] },
  { code: "quinzenal", name: "Quinzenal", price: 90, freq: "2 visitas por mês", popular: false,
    items: ["Limpeza geral da campa", "2 composições de flores frescas da época (vaso e jarra)", "1 círio branco/vermelho 60LL", "Foto antes/depois"] },
  { code: "semanal", name: "Semanal", price: 160, freq: "4 visitas por mês", popular: true,
    items: ["Limpeza geral da campa", "2 composições de flores frescas da época (vaso e jarra)", "1 círio branco/vermelho 60LL", "Foto antes/depois"] },
  { code: "premium", name: "Premium", price: 200, freq: "4 visitas por mês + extras", popular: false,
    items: ["Limpeza geral da campa + limpeza dos livros da campa", "2 composições de flores frescas da época", "1 círio branco/vermelho 60LL", "Foto antes/depois", "3 datas comemorativas à escolha", "Ramo especial em cada data comemorativa"] },
];

const STEPS = [
  { n: 1, title: "Escolhe o teu plano", icon: ClipboardList, desc: "Seleciona a frequência de visitas que preferires: mensal, quinzenal ou semanal." },
  { n: 2, title: "Indica a campa", icon: MapPin, desc: "Diz-nos em que cemitério está e ajuda-nos a localizar a campa." },
  { n: 3, title: "Nós tratamos de tudo", icon: Sparkles, desc: "A nossa equipa desloca-se, limpa a campa, coloca flores frescas e acende um círio." },
  { n: 4, title: "Recebes a confirmação", icon: Camera, desc: "Enviamos-te uma foto antes e depois de cada visita, para teres sempre a certeza." },
];

const FAQ = [
  { q: "Com que frequência fazem as visitas?", a: "Depende do plano. Mensal: 1 visita/mês; Quinzenal: 2 visitas/mês; Semanal e Premium: 4 visitas/mês." },
  { q: "Como sei que a visita foi feita?", a: "Após cada visita enviamos uma fotografia antes e depois para o email que indicar. Assim tem sempre a certeza que tudo correu bem." },
  { q: "Posso cancelar quando quiser?", a: "Sim. Não existem contratos nem períodos de permanência. Pode cancelar a qualquer momento sem qualquer custo." },
  { q: "O serviço está disponível em todo o país?", a: "Neste momento operamos em cemitérios selecionados. Consulte a lista acima. Estamos a expandir gradualmente — entre em contacto se o seu cemitério não estiver disponível." },
  { q: "Posso escolher as flores?", a: "Utilizamos sempre composições de flores frescas da época. No plano Premium, nas datas comemorativas, colocamos um ramo especial. Se tiver uma preferência específica, contacte-nos." },
  { q: "E se houver algum problema com a campa?", a: "Se detetarmos qualquer problema (danos, infiltrações, etc.) informamos de imediato por email e telefone." },
  { q: "Posso oferecer este serviço a um familiar?", a: "Sim. Basta indicar os dados da campa e um contacto para envio das fotos. Pode subscrever em nome de outra pessoa." },
];

export default function CareLanding() {
  const { data: cemeteries = [] } = useQuery({
    queryKey: ["cemeteries", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cemeteries")
        .select("id, nome, municipio, morada, lat, lng")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return (data || []) as Cemetery[];
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CareSiteHeader />

      {/* HERO */}
      <section id="inicio" className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-primary/10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Memoralis Care</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight animate-fade-in">
            Cuidamos da campa do seu ente querido,<br className="hidden md:block" /> mesmo à <span className="text-primary">distância</span>.
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto font-light leading-relaxed mb-8 text-muted-foreground animate-fade-in">
            Limpeza, flores e cuidado regular — com foto de cada visita para ter sempre a certeza que está tudo bem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Button size="lg" className="px-6 py-5 group" asChild>
              <a href="#planos">
                Ver os planos
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="px-6 py-5" asChild>
              <a href="#como-funciona">Como funciona</a>
            </Button>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-16 md:py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-3">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Processo</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Como funciona</h2>
            <p className="text-muted-foreground text-lg">
              Quatro passos simples para garantir que a campa do seu ente querido está sempre cuidada.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.n} className="relative p-6 pt-8">
                  <div className="absolute -top-4 left-6 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-bold shadow-md">
                    {s.n}
                  </div>
                  <Icon className="w-8 h-8 text-primary mb-3 mt-1" />
                  <h3 className="text-lg font-semibold mb-2 tracking-tight">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-16 md:py-20 bg-muted/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-3">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Planos</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Escolha o seu plano</h2>
            <p className="text-muted-foreground text-lg">O que melhor se adequa a si.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((p) => (
              <Card key={p.code} className={`relative p-6 flex flex-col ${p.popular ? "border-2 border-primary shadow-lg" : ""}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                    Mais popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2 tracking-tight">{p.name}</h3>
                <div className="mb-1">
                  <span className="text-3xl font-bold">{p.price}€</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">IVA incluído</p>
                <p className="text-sm font-medium text-primary mb-5">{p.freq}</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{it}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full" variant={p.popular ? "default" : "outline"}>
                  <Link to={`/care/aderir?plano=${p.code}`}>Selecionar</Link>
                </Button>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-10">
            Todos os planos podem ser cancelados a qualquer momento. Sem contratos. Sem permanência.
          </p>
        </div>
      </section>

      {/* CEMITÉRIOS */}
      <section id="cemiterios" className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-3">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Cobertura</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Onde atuamos</h2>
            <p className="text-muted-foreground text-lg">
              Operamos nos seguintes cemitérios. Se o cemitério que procura não estiver na lista, fale connosco.
            </p>
          </div>
          <CemeteryMap cemeteries={cemeteries} />
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <a href="#contacto">Não encontra o seu cemitério?</a>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-20 bg-muted/20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-3">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">FAQ</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Perguntas frequentes</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border rounded-lg px-5">
                <AccordionTrigger className="text-left text-base font-medium py-4 hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-3">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Contacto</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Fale connosco</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Estamos disponíveis para esclarecer qualquer dúvida sobre o nosso serviço.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            <Card className="p-6 hover:border-primary transition-colors">
              <a href="mailto:info@memoralis.pt" className="flex flex-col items-center gap-2">
                <Mail className="w-7 h-7 text-primary" />
                <div className="font-semibold">Email</div>
                <div className="text-sm text-muted-foreground">info@memoralis.pt</div>
              </a>
            </Card>
            <Card className="p-6 hover:border-primary transition-colors">
              <a href="tel:+351928282582" className="flex flex-col items-center gap-2">
                <Phone className="w-7 h-7 text-primary" />
                <div className="font-semibold">Telefone</div>
                <div className="text-sm text-muted-foreground">+351 928 282 582</div>
              </a>
            </Card>
          </div>
          <Button asChild size="lg" className="px-6 py-5 group">
            <Link to="/care/aderir">
              Aderir ao serviço
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Memoralis, Lda. Todos os direitos reservados.{" "}
        <Link to="/privacidade" className="underline hover:text-primary">Privacidade</Link>
        {" · "}
        <Link to="/termos" className="underline hover:text-primary">Termos</Link>
      </footer>
    </div>
  );
}
