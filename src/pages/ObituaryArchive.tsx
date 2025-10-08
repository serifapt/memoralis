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
import { Search, MapPin, Eye, MessageSquare, Flame, Home, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "@/assets/logo-memoralis.png";
import { PublicHeader } from "@/components/layout/PublicHeader";

const mockObituaries = Array(8).fill(null).map((_, index) => ({
  id: index + 1,
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
}));

const periodFilters = [
  { id: "all", label: "Todos" },
  { id: "funeral", label: "Funeral" },
  { id: "mass-7", label: "Missa 7º dia" },
  { id: "mass-30", label: "Missa 30º dia" },
  { id: "mass-annual", label: "Missa Anual" }
];

export default function ObituaryArchive() {
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground flex items-center gap-1">
            <Home className="w-4 h-4" />
            Início
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Obituário</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-archivo font-bold text-foreground mb-8">
          Obituário
        </h1>

        {/* Filters Section */}
        <div className="space-y-4 mb-8">
          {/* Top Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <SelectValue placeholder="Freguesia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="couto">Couto</SelectItem>
                <SelectItem value="oreira">Oreira</SelectItem>
                <SelectItem value="vila-fonche">Vila Fonche</SelectItem>
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
                <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Funerária" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sao-joao">Funerária S. João</SelectItem>
                <SelectItem value="santa-maria">Funerária Santa Maria</SelectItem>
                <SelectItem value="paz-eterna">Paz Eterna</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Period Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {periodFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedPeriod === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(filter.id)}
                className="rounded-full"
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Results Count and Sort */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              96 resultados
            </p>
            <Select defaultValue="popular">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigos</SelectItem>
                <SelectItem value="name">Nome A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Obituaries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {mockObituaries.map((obit) => (
            <Link key={obit.id} to={`/obituario/${obit.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
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
                    <p className="text-xs text-muted-foreground">
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
                    >
                      Condolências
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      Enviar Flores
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
            </Link>
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
