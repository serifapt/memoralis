import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Sparkles, MapPin, Camera, ClipboardList, Phone, Mail } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground text-[17px] leading-relaxed">
      <CareSiteHeader />

      {/* HERO */}
      <section id="inicio" className="py-20 md:py-28 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="font-playfair text-4xl md:text-6xl font-semibold leading-tight mb-6">
            Cuidamos da campa do seu ente querido,<br className="hidden md:block" /> mesmo à distância.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Um serviço de limpeza, flores e cuidado regular — com foto de cada visita para ter sempre a certeza que está tudo bem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg h-14 px-8">
              <a href="#planos">Ver os planos</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg h-14 px-8">
              <a href="#como-funciona">Como funciona?</a>
            </Button>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-playfair text-3xl md:text-5xl font-semibold text-center mb-4">Como funciona</h2>
          <p className="text-center text-muted-foreground text-lg mb-14 max-w-2xl mx-auto">
            Quatro passos simples para garantir que a campa do seu ente querido está sempre cuidada.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.n} className="relative bg-card border border-border rounded-2xl p-8">
                  <div className="absolute -top-5 left-8 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-md">
                    {s.n}
                  </div>
                  <Icon className="w-10 h-10 text-primary mb-4 mt-2" />
                  <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="font-playfair text-3xl md:text-5xl font-semibold text-center mb-4">Planos</h2>
          <p className="text-center text-muted-foreground text-lg mb-14">Escolha o que melhor se adequa a si.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((p) => (
              <div key={p.code} className={`relative bg-card border-2 rounded-2xl p-6 flex flex-col ${p.popular ? "border-primary shadow-lg" : "border-border"}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                    Mais popular
                  </div>
                )}
                <h3 className="text-2xl font-semibold mb-2">{p.name}</h3>
                <div className="mb-1">
                  <span className="text-4xl font-bold">{p.price}€</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">IVA incluído</p>
                <p className="text-base font-medium text-primary mb-5">{p.freq}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2 text-[15px]">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="w-full h-12 text-base" variant={p.popular ? "default" : "outline"}>
                  <Link to={`/care/aderir?plano=${p.code}`}>Selecionar</Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-10 text-base">
            Todos os planos podem ser cancelados a qualquer momento. Sem contratos. Sem permanência.
          </p>
        </div>
      </section>

      {/* CEMITÉRIOS */}
      <section id="cemiterios" className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="font-playfair text-3xl md:text-5xl font-semibold text-center mb-4">Onde atuamos</h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            Atualmente operamos nos seguintes cemitérios. Se o cemitério que procura não estiver na lista, entre em contacto connosco.
          </p>
          <CemeteryMap cemeteries={cemeteries} />
          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg">
              <a href="#contacto">Não encontra o seu cemitério? Fale connosco</a>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-playfair text-3xl md:text-5xl font-semibold text-center mb-12">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border rounded-xl px-6">
                <AccordionTrigger className="text-left text-lg font-medium py-5 hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-playfair text-3xl md:text-5xl font-semibold mb-4">Fale connosco</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Estamos disponíveis para esclarecer qualquer dúvida sobre o nosso serviço.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            <a href="mailto:info@memoralis.pt" className="bg-card border border-border rounded-2xl p-8 hover:border-primary transition-colors flex flex-col items-center gap-3">
              <Mail className="w-8 h-8 text-primary" />
              <div className="font-semibold text-lg">Email</div>
              <div className="text-muted-foreground">info@memoralis.pt</div>
            </a>
            <a href="tel:+351928282582" className="bg-card border border-border rounded-2xl p-8 hover:border-primary transition-colors flex flex-col items-center gap-3">
              <Phone className="w-8 h-8 text-primary" />
              <div className="font-semibold text-lg">Telefone</div>
              <div className="text-muted-foreground">+351 928 282 582</div>
            </a>
          </div>
          <Button asChild size="lg" className="h-14 px-8 text-lg">
            <Link to="/care/aderir">Aderir ao serviço</Link>
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
