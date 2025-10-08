import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Facebook, 
  MessageCircle, 
  Mail, 
  Link as LinkIcon, 
  Printer,
  MapPin,
  Calendar,
  Clock,
  Heart,
  ThumbsUp,
  ChevronLeft
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import logo from "@/assets/logo-memoralis.png";

const events = [
  {
    type: "Velório",
    date: "15/10/2025",
    time: "18:00",
    location: "Casa Mortuária do AVV",
    hasMap: true
  },
  {
    type: "Cerimónia",
    date: "16/10/2025",
    time: "18:00",
    location: "Casa Mortuária do AVV",
    hasMap: true
  },
  {
    type: "Funeral",
    date: "16/10/2025",
    time: "18:00",
    location: "Casa Mortuária do AVV",
    hasMap: true
  },
  {
    type: "Cremação",
    date: "16/10/2025",
    time: "18:00",
    location: "Casa Mortuária do AVV",
    hasMap: true
  },
  {
    type: "Missa 7º Dia",
    date: "16/10/2025",
    time: "18:00",
    location: "Casa Mortuária do AVV",
    hasMap: true
  },
  {
    type: "Missa 30º Dia",
    date: "16/10/2025",
    time: "18:00",
    location: "Casa Mortuária do AVV",
    hasMap: true
  }
];

const condolences = [
  {
    id: 1,
    author: "Randy W.",
    date: "November 15, 2024",
    message: "From start to finish, this cooperation was incredibly smooth. The pricing was quite reasonable, and the task was completed efficiently and with a high level of cleanliness. I'm delighted that we chose Mike over the other companies we considered based on quotes.",
    likes: 5,
    dislikes: 0
  },
  {
    id: 2,
    author: "Randy W.",
    date: "November 15, 2024",
    message: "From start to finish, this cooperation was incredibly smooth. The pricing was quite reasonable, and the task was completed efficiently and with a high level of cleanliness. I'm delighted that we chose Mike over the other companies we considered based on quotes.",
    likes: 5,
    dislikes: 0
  },
  {
    id: 3,
    author: "Randy W.",
    date: "November 15, 2024",
    message: "From start to finish, this cooperation was incredibly smooth. The pricing was quite reasonable, and the task was completed efficiently and with a high level of cleanliness. I'm delighted that we chose Mike over the other companies we considered based on quotes.",
    likes: 6,
    dislikes: 0
  }
];

const relatedObituaries = Array(4).fill({
  name: "Zé Manuel Osório",
  dates: "1930 - 2025 | 94 Anos",
  location: "Oreira - Arcos de Valdevez",
  views: 378,
  likes: 5,
  comments: 17,
  image: "/placeholder.svg"
});

export default function ObituaryDetail() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Memoralis" className="h-8" />
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary">Início</Link>
              <Link to="/obituario" className="text-sm text-foreground hover:text-primary">Obituário</Link>
              <Link to="/funerarias" className="text-sm text-muted-foreground hover:text-primary">Funerárias</Link>
              <Link to="/sobre" className="text-sm text-muted-foreground hover:text-primary">Sobre</Link>
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary">Blog</Link>
              <Link to="/contactos" className="text-sm text-muted-foreground hover:text-primary">Contactos</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth">Registar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">Início</Link>
            <ChevronLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
            <Link to="/" className="text-muted-foreground hover:text-primary">Obituário</Link>
            <ChevronLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
            <span className="text-foreground">José Manuel Osório</span>
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
                  {/* Photo */}
                  <div>
                    <img 
                      src="/placeholder.svg" 
                      alt="José Manuel Osório"
                      className="w-full aspect-[3/4] object-cover rounded-lg"
                    />
                  </div>

                  {/* Info */}
                  <div>
                    <h1 className="text-3xl font-archivo font-bold text-foreground mb-2">
                      José Manuel Osório
                    </h1>
                    <p className="text-muted-foreground mb-1">
                      1930 - 2025 | 94 anos
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground mb-6">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Oreira - Arcos de Valdevez</span>
                    </div>

                    {/* Share & Actions */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="text-sm font-medium text-foreground">Partilhar</span>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Facebook className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <LinkIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline">Condolências</Button>
                      <Button className="bg-primary hover:bg-primary/90">
                        Enviar Flores
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Family Message */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-archivo font-semibold text-foreground mb-4">
                  Mensagem da Família
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Sua Família anuncia o falecimento e convida a todos os parentes e amigos para o seu Velório e 
                  com a intenção de informar os amigos, que por falta de tempo não foi possível avisar Pessoalmente 
                  convidamos para assistir na Igreja de Santa Maria de Aires Pessoal de Fortuna - Vésperas, 
                  segundo após o Jantar os confiando de Mesa no Corpo Presente.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Antecipadamente, a Família agradece de (Pé neste)
                </p>
              </CardContent>
            </Card>

            {/* Events */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">{event.type}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{event.date} - {event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                          {event.hasMap && (
                            <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                              Ver no mapa
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
                  <Button variant="outline" className="flex-1 sm:flex-none hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Clock className="w-4 h-4 mr-2" />
                    Receber e-mail de aviso
                  </Button>
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    <Calendar className="w-4 h-4 mr-2" />
                    Adicionar ao Calendário
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Condolence Form */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-archivo font-semibold text-foreground mb-6">
                  Envie Mensagem de Condolências
                </h2>
                <form className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Nome *
                      </label>
                      <Input placeholder="Michael" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Email *
                      </label>
                      <Input type="email" placeholder="m.williams@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Mensagem *
                    </label>
                    <Textarea 
                      placeholder="Sentidas condolências..."
                      rows={5}
                    />
                  </div>
                  <Button className="bg-primary hover:bg-primary/90">
                    Enviar mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Condolences List */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-archivo font-semibold text-foreground mb-6">
                  Mensagens de Condolências
                </h2>
                <div className="space-y-6">
                  {condolences.map((condolence) => (
                    <div key={condolence.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground">{condolence.author}</h4>
                          <p className="text-sm text-muted-foreground">{condolence.date}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {condolence.message}
                      </p>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{condolence.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                          <ThumbsUp className="w-4 h-4 rotate-180" />
                          <span>{condolence.dislikes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-border">
                  <Button variant="outline" size="sm">1</Button>
                  <Button variant="ghost" size="sm">2</Button>
                  <Button variant="ghost" size="sm">3</Button>
                  <Button variant="ghost" size="sm">4</Button>
                  <span className="text-muted-foreground">...</span>
                  <Button variant="ghost" size="sm">36</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funeral Home Card */}
            <Card className="sticky top-24">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-20 h-20 bg-foreground rounded mb-4 flex items-center justify-center">
                    <span className="text-background font-bold text-xl">SJ</span>
                  </div>
                  <h3 className="font-archivo font-bold text-foreground text-2xl">
                    FUNERÁRIA<br />S. JOÃO
                  </h3>
                </div>

                <h4 className="font-semibold text-foreground text-center mb-6 text-lg">
                  Funerária S. João
                </h4>

                <div className="space-y-4 text-center mb-6">
                  <div>
                    <p className="font-semibold text-foreground mb-2">Contactos</p>
                    <p className="text-foreground text-sm">962 766 625</p>
                    <p className="text-foreground text-sm">258 515 233</p>
                    <p className="text-foreground text-sm mt-2">funeraria.s.joao@gmail.com</p>
                    <p className="text-foreground text-sm">funerariasjoan.pt</p>
                  </div>
                </div>

                <div className="space-y-2 text-center mb-8">
                  <p className="font-semibold text-foreground mb-2">Morada</p>
                  <p className="text-foreground text-sm">
                    Rua da Cêpa, E.N. 303 - Nº 43 AB
                  </p>
                  <p className="text-foreground text-sm">
                    4970-446 Arcos de Valdevez
                  </p>
                </div>

                <Button className="w-full bg-[hsl(var(--footer-bg))] hover:bg-[hsl(var(--footer-bg))]/90 text-white py-6 text-base">
                  Ir para página
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Obituaries */}
        <section className="mt-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-archivo font-bold text-foreground">
              Outros óbitos
            </h2>
            <Button variant="ghost" size="sm">
              Ver todos →
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedObituaries.map((obit, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={obit.image} 
                    alt={obit.name}
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/90 flex items-center justify-center hover:bg-background">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-archivo font-semibold text-foreground mb-1">
                    {obit.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {obit.dates}
                  </p>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{obit.location}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>👁 {obit.views}</span>
                    <span>❤️ {obit.likes}</span>
                    <span>💬 {obit.comments}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-foreground))] py-12 mt-16">
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
              <h4 className="font-archivo font-semibold mb-4">Obituário</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="opacity-80 hover:opacity-100">Velório</Link></li>
                <li><Link to="/" className="opacity-80 hover:opacity-100">Missa 7º dia</Link></li>
                <li><Link to="/" className="opacity-80 hover:opacity-100">Funeral</Link></li>
                <li><Link to="/" className="opacity-80 hover:opacity-100">Nova Ritual</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-archivo font-semibold mb-4">Funerárias</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="opacity-80 hover:opacity-100">Lisboa</Link></li>
                <li><Link to="/" className="opacity-80 hover:opacity-100">Procure no mapa</Link></li>
                <li><Link to="/" className="opacity-80 hover:opacity-100">Receba sua quotação</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-archivo font-semibold mb-4">Memoralis</h4>
              <ul className="space-y-2 text-sm mb-4">
                <li><Link to="/" className="opacity-80 hover:opacity-100">Ajuda</Link></li>
                <li><Link to="/" className="opacity-80 hover:opacity-100">Contactos</Link></li>
                <li><Link to="/" className="opacity-80 hover:opacity-100">Suporte</Link></li>
              </ul>
              <h4 className="font-archivo font-semibold mb-4">Subscrever newsletter</h4>
              <div className="flex gap-2">
                <Input 
                  placeholder="Digite seu endereço de e-mail" 
                  className="bg-background/10 border-background/20 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button className="w-full mt-2 bg-primary hover:bg-primary/90">
                Subscrever
              </Button>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm opacity-80">
            <p>Política de devoluir - Contacte-nos</p>
            <p>© Todos os direitos reservados 2025 - Feito by <span className="font-semibold">BeePix</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
