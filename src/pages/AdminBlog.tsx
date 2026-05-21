import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ExternalLink, Search, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Row = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  status: string;
  is_featured: boolean;
  published_at: string | null;
  updated_at: string;
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
};

export default function AdminBlog() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [toDelete, setToDelete] = useState<Row | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, category, status, is_featured, published_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) toast.error("Erro ao carregar artigos");
    setRows((data || []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    const s = q.trim().toLowerCase();
    return !s || r.title.toLowerCase().includes(s) || r.slug.toLowerCase().includes(s);
  });

  const handleDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", toDelete.id);
    if (error) { toast.error("Erro ao eliminar"); return; }
    toast.success("Artigo eliminado");
    setToDelete(null);
    load();
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-archivo font-bold">Blog</h1>
          <p className="text-sm text-muted-foreground">Crie, edite e publique artigos do blogue.</p>
        </div>
        <Button onClick={() => navigate("/admin/blog/new")}>
          <Plus className="w-4 h-4 mr-2" /> Novo artigo
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Pesquisar..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Card className="divide-y">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array(4).fill(null).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Nenhum artigo.</div>
        ) : filtered.map((r) => (
          <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium truncate">{r.title}</span>
                {r.is_featured && <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />}
                <Badge variant={r.status === "published" ? "default" : "secondary"}>
                  {r.status === "published" ? "Publicado" : "Rascunho"}
                </Badge>
                {r.category && <Badge variant="outline">{r.category}</Badge>}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                /blog/{r.slug} · {r.status === "published" ? `publicado ${formatDate(r.published_at)}` : `atualizado ${formatDate(r.updated_at)}`}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {r.status === "published" && (
                <Button asChild variant="ghost" size="icon" title="Ver">
                  <Link to={`/blog/${r.slug}`} target="_blank"><ExternalLink className="w-4 h-4" /></Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" title="Editar" onClick={() => navigate(`/admin/blog/${r.id}`)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Eliminar" onClick={() => setToDelete(r)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </Card>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar artigo?</AlertDialogTitle>
            <AlertDialogDescription>
              "{toDelete?.title}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}