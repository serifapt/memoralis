import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Eye, 
  MessageSquare, 
  Flame,
  ArrowUpDown
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-memoralis.png";

const obituaries = Array(8).fill({
  name: "Zé Manuel Osório",
  birthYear: "1970",
  deathYear: "2025",
  age: 55,
  location: "Couto - Arcos de Valdevez",
  category: "Funeral",
  agency: "Funerária S. João",
  views: 678,
  messages: 5,
  candles: 1,
  image: "/placeholder.svg"
});

const periodFilters = [
  { label: "Todos", value: "all" },
  { label: "Funeral", value: "funeral" },
  { label: "Missa 7º dia", value: "7day" },
  { label: "Missa 30º dia", value: "30day" },
  { label: "Missa Anual", value: "annual" }
];

export default function Obituaries() {
  const [selectedPeriod, setSelectedPeriod] = useState("all");

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
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary">Início</Link>
              <Link to="/obituaries" className="text-sm text-foreground hover:text-primary">Obituário</Link>
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Início</Link>
          <span>›</span>
          <span className="text-foreground">Obituário</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-archivo font-bold text-foreground mb-8">
          Obituário
        </h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
            <Input 
              placeholder="Nome" 
              className="pl-10"
            />
          </div>
          
          <Select>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Localidade" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="lisboa">Lisboa</SelectItem>
              <SelectItem value="porto">Porto</SelectItem>
              <SelectItem value="coimbra">Coimbra</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Freguesia" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="freguesia1">Freguesia 1</SelectItem>
              <SelectItem value="freguesia2">Freguesia 2</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Distrito" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="viana">Viana do Castelo</SelectItem>
              <SelectItem value="braga">Braga</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Funerária" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="sjoao">Funerária S. João</SelectItem>
              <SelectItem value="other">Outras</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Period Filters and Results */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {periodFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedPeriod === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(filter.value)}
                className="rounded-full"
              >
                {filter.label}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              96 resultados
            </span>
            <Select defaultValue="popular">
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Obituaries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {obituaries.map((obit, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                    {obit.birthYear} - {obit.deathYear} | {obit.age} Anos
                  </p>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{obit.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Agência
                  </p>
                  <p className="text-sm text-foreground font-medium">
                    {obit.agency}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    asChild
                  >
                    <Link to={`/obituario/${index + 1}`}>Condolências</Link>
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90"
                    asChild
                  >
                    <Link to={`/obituario/${index + 1}`}>Enviar Flores</Link>
                  </Button>
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

        {/* Load More */}
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
                <img src={logo} alt="Memoralis" className="h-8" />
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
                  →
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
}
