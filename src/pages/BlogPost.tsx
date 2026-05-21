import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, Facebook, Twitter, Linkedin, Link as LinkIcon, ArrowLeft, Heart } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PublicHeader } from "@/components/layout/PublicHeader";
import logo from "@/assets/logo-memoralis.svg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  author: string | null;
  cover_image_url: string | null;
  read_time: string | null;
  published_at: string | null;
};

type RelatedPost = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  cover_image_url: string | null;
  read_time: string | null;
};

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "";
  }
};

// Minimal markdown renderer: headings (##), images ![alt](url), paragraphs.
const renderContent = (md: string) => {
  const blocks = md.split(/\n{2,}/);
  return blocks.map((raw, i) => {
    const block = raw.trim();
    if (!block) return null;
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="text-2xl font-archivo font-bold text-foreground mt-12 mb-6">
          {block.slice(3)}
        </h2>
      );
    }
    if (block.startsWith("# ")) {
      return (
        <h2 key={i} className="text-3xl font-archivo font-bold text-foreground mt-12 mb-6">
          {block.slice(2)}
        </h2>
      );
    }
    const img = block.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (img) {
      return (
        <div key={i} className="my-10 rounded-lg overflow-hidden">
          <img src={img[2]} alt={img[1]} className="w-full" />
        </div>
      );
    }
    return (
      <p key={i} className="text-foreground/80 mb-6 leading-relaxed whitespace-pre-line">
        {block}
      </p>
    );
  });
};

// Old mock kept commented for reference removed below.
const _UNUSED = {
  _: [
      {
        type: "paragraph",
        text: "Preparar uma cerimónia memorial é um momento profundamente pessoal e especial. Oferecemos neste guia completo algumas orientações essenciais para criar uma homenagem que verdadeiramente honre a memória do seu ente querido, desde a escolha do local até aos pequenos detalhes que fazem toda a diferença."
      },
      {
        type: "heading",
        text: "1. Defina o estilo e personalização"
      },
      {
        type: "paragraph",
        text: "O primeiro passo é decidir que tipo de cerimónia melhor reflete a personalidade e os valores da pessoa. Algumas famílias preferem uma cerimónia religiosa tradicional, enquanto outras optam por celebrações mais informais ou temáticas. Considere os gostos pessoais, hobbies e paixões do falecido ao planear cada detalhe."
      },
      {
        type: "paragraph",
        text: "É importante envolver familiares próximos nesta decisão, garantindo que todos se sintam parte do processo de despedida. Uma cerimónia personalizada pode incluir elementos como música favorita, fotografias, vídeos ou até objetos significativos que contam a história de uma vida."
      },
      {
        type: "heading",
        text: "2. Escolha o local com significado"
      },
      {
        type: "paragraph",
        text: "A escolha do local pode ter um impacto profundo no tom da cerimónia. Enquanto muitas famílias optam por locais tradicionais como igrejas ou capelas, outras escolhem espaços ao ar livre, jardins ou locais que tinham significado especial para o falecido."
      },
      {
        type: "image",
        src: "/placeholder.svg",
        alt: "Local de cerimónia memorial"
      },
      {
        type: "paragraph",
        text: "É também importante certificar-se de que o espaço escolhido pode acomodar confortavelmente todos os convidados e possui as facilidades necessárias, como estacionamento, acessibilidade e equipamento de som se necessário."
      },
      {
        type: "heading",
        text: "3. Prepare a ordem de cerimónia"
      },
      {
        type: "paragraph",
        text: "Uma ordem de cerimónia bem estruturada ajuda a guiar os participantes e garante que todos os momentos importantes sejam incluídos. Tipicamente, inclui momentos de silêncio, música, leituras, eulogias e tempo para reflexão."
      },
      {
        type: "paragraph",
        text: "Considere criar um programa impresso que os convidados possam levar consigo como recordação. Este pode incluir fotografias, poemas favoritos, ou mensagens especiais da família."
      },
      {
        type: "heading",
        text: "4. Selecione música e leituras"
      },
      {
        type: "paragraph",
        text: "A música tem o poder de evocar emoções profundas e criar momentos memoráveis. Escolha peças que tinham significado especial para o falecido ou que transmitam a mensagem que a família deseja comunicar."
      },
      {
        type: "image",
        src: "/placeholder.svg",
        alt: "Música em cerimónias"
      },
      {
        type: "paragraph",
        text: "As leituras podem incluir textos religiosos, poemas, trechos literários ou até palavras escritas pela própria família. Certifique-se de que os leitores escolhidos se sentem confortáveis e têm tempo para se preparar."
      }
  ],
};

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, content, category, author, cover_image_url, read_time, published_at")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      setPost((data as BlogPost) || null);

      if (data) {
        const { data: rel } = await supabase
          .from("blog_posts")
          .select("id, slug, title, category, cover_image_url, read_time")
          .eq("status", "published")
          .neq("id", (data as BlogPost).id)
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(3);
        setRelated((rel || []) as RelatedPost[]);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="container mx-auto px-4 py-16 max-w-4xl space-y-6">
          <Skeleton className="h-72 w-full rounded-lg" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
          <Link to="/blog">
            <Button>Voltar ao Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = post.title;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link to="/blog">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Blog
          </Button>
        </Link>
      </div>

      {/* Hero Image */}
      <div className="container mx-auto px-4 mb-8">
        <div className="aspect-[21/9] rounded-lg overflow-hidden bg-muted">
          <img 
            src={post.cover_image_url || "/placeholder.svg"}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8">
            {/* Main Content */}
            <div>
              {/* Article Header */}
              <div className="mb-8">
                {post.category && <Badge className="mb-4">{post.category}</Badge>}
                <h1 className="text-4xl md:text-5xl font-archivo font-bold text-foreground mb-6 leading-tight">
                  {post.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  {post.author && (
                    <div className="flex items-center gap-2"><User className="w-4 h-4" /><span>{post.author}</span></div>
                  )}
                  {post.published_at && (
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{formatDate(post.published_at)}</span></div>
                  )}
                  {post.read_time && <span>{post.read_time} de leitura</span>}
                </div>
              </div>

              {/* Article Body */}
              <div className="prose prose-lg max-w-none">
                {renderContent(post.content || "")}
              </div>
            </div>

            {/* Share Sidebar */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="flex lg:flex-col gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('facebook')}
                  className="rounded-full"
                  aria-label="Partilhar no Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('twitter')}
                  className="rounded-full"
                  aria-label="Partilhar no Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('linkedin')}
                  className="rounded-full"
                  aria-label="Partilhar no LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare('copy')}
                  className="rounded-full"
                  aria-label="Copiar link"
                >
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-archivo font-bold text-foreground mb-8">Outros artigos</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((article) => (
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
                      {article.read_time && <p className="text-sm text-muted-foreground">{article.read_time} de leitura</p>}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-foreground))] py-12 border-t">
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
