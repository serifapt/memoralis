import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  Eye,
  MessageSquare,
  Flame,
  Home,
  ChevronRight,
  ThumbsUp
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import logo from "@/assets/logo-memoralis.png";

const services = [
  "Funerais",
  "Cremação",
  "Auto Funerais",
  "Apoio ao Luto",
  "Furações",
  "Tanatopraxia",
  "Transladações",
  "Florista",
  "Transladações",
  "Apoio Acessórios",
  "Florista"
];

const mockTestimonials = [
  {
    id: 1,
    author: "Randy W.",
    date: "November 15, 2024",
    rating: 5,
    message: "From start to finish, this cooperation was incredibly smooth. The pricing was quite reasonable, and the task was completed efficiently and with a high level of cleanliness. I'm delighted that we chose Mike over the other companies we considered based on quotes.",
    likes: 6,
    dislikes: 0
  },
  {
    id: 2,
    author: "Lora Palmer",
    date: "November 15, 2024",
    rating: 5,
    message: "I was absolutely amazed, very professional. I highly recommend hiring Mike.",
    likes: 13,
    dislikes: 2
  },
  {
    id: 3,
    author: "Melissa Smith",
    date: "November 2, 2024",
    rating: 5,
    message: "We had an outrageous sink leak or an accident problem. I highly recommend this job to just everyone. Their cleanup and give it out clean. Peter was the bomb!",
    likes: 4,
    dislikes: 0
  }
];

const relatedObituaries = Array(4).fill(null).map((_, index) => ({
  id: index + 1,
  name: "Zé Manuel Osório",
  birthDate: "1970",
  deathDate: "2025",
  age: 55,
  location: "Couto - Arcos de Valdevez",
  category: "Funeral",
  agency: "Funerária S. João",
  views: 678,
  messages: 5,
  candles: 1,
  image: "/placeholder.svg"
}));

const ratingDistribution = [
  { stars: 5, count: 11 },
  { stars: 4, count: 0 },
  { stars: 3, count: 0 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 }
];

export default function FunerariaDetail() {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const totalReviews = ratingDistribution.reduce((sum, item) => sum + item.count, 0);
  const averageRating = 4.5;

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Memoralis" className="h-8" />
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link to="/obituario" className="text-sm text-muted-foreground hover:text-primary">Obituário</Link>
              <Link to="/funerarias" className="text-sm text-foreground hover:text-primary">Funerárias</Link>
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
            <Link to="/" className="text-muted-foreground hover:text-primary flex items-center gap-1">
              <Home className="w-4 h-4" />
              Início
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link to="/funerarias" className="text-muted-foreground hover:text-primary">Funerárias</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">Funerária S. João</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header Info */}
        <div className="mb-8">
          <h1 className="text-4xl font-archivo font-bold text-foreground mb-4">
            Funerária S. João
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-primary text-primary" />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
              </div>
              <Badge variant="secondary">Verificado</Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Rua da Cêpa, E.N. 303 - Nº 43 AB | 4970-446 Arcos de Valdevez</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>962 766 625</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>WebSite</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Horário: Seg a Sex 9:00 - 12:30 | 14:30 - 18:00 • Sáb 9:00 - 13:00</span>
            </div>
          </div>
        </div>

        {/* Image Gallery - Full Width */}
        <Card className="overflow-hidden mb-8">
          <div className="grid md:grid-cols-[200px_1fr] gap-4 p-4">
            {/* Logo */}
            <div className="bg-muted rounded-lg flex items-center justify-center p-6 h-[400px]">
              <div className="text-center">
                <div className="text-6xl font-archivo font-bold mb-2">SJ</div>
                <div className="text-sm font-semibold">FUNERÁRIA<br />S. JOÃO</div>
              </div>
            </div>
            
            {/* Main Image */}
            <div className="relative">
              <img 
                src="/placeholder.svg" 
                alt="Funerária S. João"
                className="w-full h-[400px] object-cover rounded-lg"
              />
              {/* Image dots */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {[0, 1, 2, 3].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentImageIndex === index ? 'bg-primary' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Content */}
          <div className="space-y-8">

            {/* About Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-archivo font-bold text-foreground mb-4">
                  Sobre
                </h2>
                <div className="text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    A Agência Funerária S. João, é uma empresa fundada em 1924, com sede na Rua da Cêpa, 
                    E.N. 303 – nº 43 AB, em Arcos de Valdevez.
                  </p>
                  <p>
                    O crescimento da empresa possibilitou a compra de viaturas, aumentou a oferta de serviços e 
                    as facilidades das linhas de crédito da casa tornaram-se principais motores da empresa. 
                    A Agência Funerária S. João, comprometida com a prestação de um serviço de qualidade, 
                    dedicado e atencioso, tem vindo a afirmar-se como uma das principais agências da região.
                  </p>
                  <p>
                    Para Nós, a sua satisfação e conforto são objetivos e primordiais numa fase tão delicada e 
                    triste para si e para família. Dispomos de atendimento personalizado e de apoio psicológico 
                    gratuito através, dedicado e escutador de naturais soluções para si e sua família.
                  </p>
                  <p>
                    A nossa satisfação está também, garantir e cumprir às vontades últimas objetivas.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Services Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-archivo font-bold text-foreground mb-6">
                  Serviços
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-archivo font-bold text-foreground mb-6">
                  Contactos
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Morada</h3>
                    <p className="text-sm text-muted-foreground">
                      Rua da Cêpa, E.N. 303 - Nº 43 AB<br />
                      4970-446 Arcos de Valdevez
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Contactos</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>962 766 625</p>
                      <p>258 515 233</p>
                      <p>funeraria.s.joao@gmail.com</p>
                      <p>funerariasjoan.pt</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Horário</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Seg a Sex 9:00 a.m. - 6:00 p.m.</p>
                      <p>14:30 - 18:00</p>
                      <p>Sábado</p>
                      <p>9:00 - 12:00</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-3">Seguir</h3>
                  <div className="flex gap-3">
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Instagram className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Linkedin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonials Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-archivo font-bold text-foreground">
                    Testemunhos
                  </h2>
                  <Button variant="outline" size="sm">
                    Deixar testemunho
                  </Button>
                </div>

                {/* Rating Overview */}
                <div className="grid md:grid-cols-[200px_1fr] gap-8 mb-8 pb-8 border-b border-border">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-foreground mb-2">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(averageRating)
                              ? 'fill-primary text-primary'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {totalReviews} testemunhos
                    </p>
                  </div>

                  <div className="space-y-2">
                    {ratingDistribution.map((item) => (
                      <div key={item.stars} className="flex items-center gap-3">
                        <span className="text-sm w-4">{item.stars}</span>
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${totalReviews > 0 ? (item.count / totalReviews) * 100 : 0}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonials List */}
                <div className="space-y-6">
                  {mockTestimonials.map((testimonial) => (
                    <div key={testimonial.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground">{testimonial.author}</h4>
                          <p className="text-sm text-muted-foreground">{testimonial.date}</p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < testimonial.rating
                                  ? 'fill-primary text-primary'
                                  : 'text-muted'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {testimonial.message}
                      </p>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{testimonial.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                          <ThumbsUp className="w-4 h-4 rotate-180" />
                          <span>{testimonial.dislikes}</span>
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

            {/* Related Obituaries */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-archivo font-bold text-foreground">
                  Óbituário
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/obituario">Ver todos →</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedObituaries.map((obit) => (
                  <Card key={obit.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={obit.image}
                        alt={obit.name}
                        className="w-full aspect-[3/4] object-cover"
                      />
                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-0">
                        {obit.category}
                      </Badge>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-archivo font-bold text-foreground text-lg mb-1">
                          {obit.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          {obit.birthDate} - {obit.deathDate} | {obit.age} Anos
                        </p>
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">{obit.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{obit.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{obit.messages}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          <span>{obit.candles}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-archivo font-bold text-foreground mb-6">
                  Contactar Funerária S. João
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Preencha o formulário com a sua mensagem.
                </p>
                <form className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Nome *
                    </label>
                    <Input placeholder="Nome" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Contacto *
                    </label>
                    <Input placeholder="Contacto" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Email *
                    </label>
                    <Input type="email" placeholder="Email" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Mensagem *
                    </label>
                    <Textarea placeholder="Mensagem" rows={5} />
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Enviar mensagem
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-4">
                    Receba as nossas informações
                  </h4>
                  <div className="space-y-3">
                    <Input type="email" placeholder="Email" />
                    <div className="flex items-start gap-2">
                      <Checkbox id="terms" />
                      <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight">
                        Concordo em receber informações de novos óbitos, campanhas ou outras informações
                      </label>
                    </div>
                    <Button className="w-full bg-[hsl(var(--footer-bg))] hover:bg-[hsl(var(--footer-bg))]/90 text-[hsl(var(--footer-foreground))]">
                      Enviar
                    </Button>
                  </div>
                </div>
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
              <p className="text-sm opacity-80">
                Homenagens que eternizam memórias e sentimentos.
              </p>
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
              <p className="text-sm opacity-80">
                Email: info@memoralis.pt
              </p>
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
