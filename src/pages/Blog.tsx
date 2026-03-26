import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, ArrowRight, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicHeader } from "@/components/layout/PublicHeader";
import logo from "@/assets/logo-memoralis.svg";

const featuredArticle = {
  title: "Como Preparar uma Cerimónia Memorial Significativa",
  excerpt: "Um guia completo para criar uma homenagem que verdadeiramente honre a memória do seu ente querido.",
  category: "Guias",
  date: "15 Jan 2025",
  author: "Maria Silva",
  image: "/placeholder.svg",
  readTime: "8 min"
};

const articles = [
  {
    id: 1,
    title: "A Importância das Tradições Funerárias em Portugal",
    excerpt: "Exploramos as tradições que tornam as cerimónias portuguesas únicas e significativas.",
    category: "Cultura",
    date: "14 Jan 2025",
    author: "João Santos",
    image: "/placeholder.svg",
    readTime: "6 min"
  },
  {
    id: 2,
    title: "Como Escrever um Obituário Memorável",
    excerpt: "Dicas práticas para criar um texto que capture a essência de uma vida vivida.",
    category: "Guias",
    date: "12 Jan 2025",
    author: "Ana Costa",
    image: "/placeholder.svg",
    readTime: "5 min"
  },
  {
    id: 3,
    title: "O Papel da Música nas Cerimónias de Despedida",
    excerpt: "Como a música pode proporcionar conforto e criar momentos emocionantes.",
    category: "Cerimónias",
    date: "10 Jan 2025",
    author: "Pedro Alves",
    image: "/placeholder.svg",
    readTime: "7 min"
  },
  {
    id: 4,
    title: "Luto Digital: Partilhar Memórias Online",
    excerpt: "O impacto das plataformas digitais no processo de luto contemporâneo.",
    category: "Tecnologia",
    date: "8 Jan 2025",
    author: "Sofia Ribeiro",
    image: "/placeholder.svg",
    readTime: "6 min"
  },
  {
    id: 5,
    title: "Escolher a Funerária Certa: Guia Completo",
    excerpt: "Fatores importantes a considerar ao selecionar serviços funerários.",
    category: "Guias",
    date: "5 Jan 2025",
    author: "Carlos Fernandes",
    image: "/placeholder.svg",
    readTime: "10 min"
  },
  {
    id: 6,
    title: "Flores em Cerimónias: Significado e Escolha",
    excerpt: "O simbolismo das flores e como escolher arranjos apropriados.",
    category: "Cerimónias",
    date: "3 Jan 2025",
    author: "Isabel Martins",
    image: "/placeholder.svg",
    readTime: "5 min"
  }
];

const categories = ["Todos", "Guias", "Cultura", "Cerimónias", "Tecnologia", "Apoio"];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-archivo font-bold text-foreground mb-6">
              Blog Memoralis
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Guias, reflexões e recursos para apoiar em momentos de despedida
            </p>
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input 
                  placeholder="Pesquisar artigos..." 
                  className="pl-12 h-12"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="container mx-auto px-4 py-16">
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="aspect-[16/10] md:aspect-auto">
              <img 
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-8 md:p-12 flex flex-col justify-center">
              <Badge className="w-fit mb-4">{featuredArticle.category}</Badge>
              <h2 className="text-3xl font-archivo font-bold text-foreground mb-4">
                {featuredArticle.title}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {featuredArticle.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{featuredArticle.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{featuredArticle.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{featuredArticle.readTime}</span>
                </div>
              </div>
              <Link to="/blog/como-preparar-cerimonia-memorial">
                <Button className="w-fit group">
                  Ler Artigo
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </div>
        </Card>
      </section>

      {/* Categories Filter */}
      <section className="container mx-auto px-4 pb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "Todos" ? "default" : "outline"}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link key={article.id} to="/blog/como-preparar-cerimonia-memorial">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
                <div className="aspect-[16/10] overflow-hidden">
                  <img 
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <Badge className="mb-3">{article.category}</Badge>
                  <h3 className="text-xl font-archivo font-bold text-foreground mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{article.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  <div className="text-primary font-medium group-hover:gap-3 flex items-center gap-2 transition-all">
                    Ler mais
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Load More */}
      <section className="container mx-auto px-4 pb-16">
        <div className="text-center">
          <Button variant="outline" size="lg">
            Carregar Mais Artigos
          </Button>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-archivo font-bold text-foreground mb-4">
              Subscreva a Nossa Newsletter
            </h2>
            <p className="text-muted-foreground mb-8">
              Receba artigos, guias e recursos diretamente no seu email
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                type="email"
                placeholder="O seu email" 
                className="flex-1"
              />
              <Button>Subscrever</Button>
            </div>
          </div>
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
                <li><Link to="/" className="opacity-80 hover:opacity-100">Início</Link></li>
                <li><Link to="/sobre" className="opacity-80 hover:opacity-100">Sobre</Link></li>
                <li><Link to="/blog" className="opacity-80 hover:opacity-100">Blog</Link></li>
                <li><Link to="/contactos" className="opacity-80 hover:opacity-100">Contactos</Link></li>
                <li><Link to="/admin/auth" className="opacity-60 hover:opacity-80 text-xs">Admin</Link></li>
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
}
