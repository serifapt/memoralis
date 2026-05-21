import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, User, ArrowRight, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicHeader } from "@/components/layout/PublicHeader";
import logo from "@/assets/logo-memoralis.svg";
import { supabase } from "@/integrations/supabase/client";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  author: string | null;
  cover_image_url: string | null;
  read_time: string | null;
  is_featured: boolean;
  published_at: string | null;
};

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "";
  }
};

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, category, author, cover_image_url, read_time, is_featured, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(50);
      setPosts((data || []) as BlogPost[]);
      setLoading(false);
    })();
  }, []);

  const featured = useMemo(() => posts.find((p) => p.is_featured) || posts[0] || null, [posts]);
  const rest = useMemo(() => posts.filter((p) => p.id !== featured?.id), [posts, featured]);
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.category && set.add(p.category));
    return ["Todos", ...Array.from(set)];
  }, [posts]);

  const filtered = rest.filter((p) => {
    const matchCat = activeCategory === "Todos" || p.category === activeCategory;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.excerpt || "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {loading ? (
        <section className="container mx-auto px-4 py-16">
          <Skeleton className="w-full h-80 rounded-lg" />
        </section>
      ) : featured ? (
        <section className="container mx-auto px-4 py-16">
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="aspect-[16/10] md:aspect-auto bg-muted">
                <img
                  src={featured.cover_image_url || "/placeholder.svg"}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                {featured.category && <Badge className="w-fit mb-4">{featured.category}</Badge>}
                <h2 className="text-3xl font-archivo font-bold text-foreground mb-4">{featured.title}</h2>
                {featured.excerpt && (
                  <p className="text-muted-foreground mb-6 leading-relaxed">{featured.excerpt}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 flex-wrap">
                  {featured.author && (
                    <div className="flex items-center gap-2"><User className="w-4 h-4" /><span>{featured.author}</span></div>
                  )}
                  {featured.published_at && (
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{formatDate(featured.published_at)}</span></div>
                  )}
                  {featured.read_time && (
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{featured.read_time}</span></div>
                  )}
                </div>
                <Link to={`/blog/${featured.slug}`}>
                  <Button className="w-fit group">
                    Ler Artigo
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </div>
          </Card>
        </section>
      ) : (
        <section className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Ainda não há artigos publicados.
        </section>
      )}

      {/* Categories Filter */}
      {categories.length > 1 && (
        <section className="container mx-auto px-4 pb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === activeCategory ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(3).fill(null).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-lg" />)
          ) : filtered.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-12">Nenhum artigo encontrado.</p>
          ) : (
            filtered.map((article) => (
              <Link key={article.id} to={`/blog/${article.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={article.cover_image_url || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    {article.category && <Badge className="mb-3">{article.category}</Badge>}
                    <h3 className="text-xl font-archivo font-bold text-foreground mb-3 line-clamp-2">{article.title}</h3>
                    {article.excerpt && (
                      <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                      {article.published_at && (
                        <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /><span>{formatDate(article.published_at)}</span></div>
                      )}
                      {article.read_time && (
                        <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>{article.read_time}</span></div>
                      )}
                    </div>
                    <div className="text-primary font-medium group-hover:gap-3 flex items-center gap-2 transition-all">
                      Ler mais
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
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
