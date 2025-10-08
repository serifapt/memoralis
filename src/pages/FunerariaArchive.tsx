import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Star, Eye, Map, Home, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-memoralis.png";

const mockFuneralHomes = Array(9).fill(null).map((_, index) => ({
  id: index + 1,
  name: "Funerária S. João",
  rating: 5.0,
  reviewCount: 146,
  location: "Arcos de Valdevez",
  views: 392,
  image: "/placeholder.svg",
  isBookmarked: false
}));

export default function FunerariaArchive() {
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground flex items-center gap-1">
            <Home className="w-4 h-4" />
            Início
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Funerárias</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-archivo font-bold text-foreground mb-8">
          Funerárias
        </h1>

        {/* Filters Section */}
        <div className="space-y-6 mb-12">
          {/* Top Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
              <Input
                placeholder="Nome"
                className="pl-10"
              />
            </div>
            
            <Select>
              <SelectTrigger>
                <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Localidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arcos">Arcos de Valdevez</SelectItem>
                <SelectItem value="ponte-lima">Ponte de Lima</SelectItem>
                <SelectItem value="viana">Viana do Castelo</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Distrito" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viana">Viana do Castelo</SelectItem>
                <SelectItem value="braga">Braga</SelectItem>
                <SelectItem value="porto">Porto</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <Star className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Avaliação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Estrelas</SelectItem>
                <SelectItem value="4">4+ Estrelas</SelectItem>
                <SelectItem value="3">3+ Estrelas</SelectItem>
                <SelectItem value="all">Todas</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-foreground hover:bg-foreground/90 text-background">
              <Map className="w-4 h-4 mr-2" />
              Ver no mapa
            </Button>
          </div>

          {/* Results Count and Sort */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              96 resultados
            </p>
            <Select defaultValue="recent">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="rating">Melhor avaliação</SelectItem>
                <SelectItem value="popular">Mais populares</SelectItem>
                <SelectItem value="name">Nome A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Funeral Homes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mockFuneralHomes.map((home) => (
            <Card key={home.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={home.image}
                  alt={home.name}
                  className="w-full aspect-[4/3] object-cover"
                />
                {/* Carousel dots */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="w-2 h-2 rounded-full bg-muted"></div>
                  <div className="w-2 h-2 rounded-full bg-muted"></div>
                  <div className="w-2 h-2 rounded-full bg-muted"></div>
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-archivo font-bold text-foreground text-lg">
                  {home.name}
                </h3>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="text-sm font-semibold">{home.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({home.reviewCount})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{home.location}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground pt-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{home.views}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        <div className="flex justify-center">
          <Button variant="outline" size="lg">
            Carregar mais
          </Button>
        </div>
      </main>

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
