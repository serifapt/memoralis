import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { slugify } from "@/lib/slug";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Form = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  cover_image_url: string;
  read_time: string;
  status: "draft" | "published";
  is_featured: boolean;
};

const empty: Form = {
  title: "", slug: "", excerpt: "", content: "", category: "", author: "",
  cover_image_url: "", read_time: "", status: "draft", is_featured: false,
};

export default function AdminBlogEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id && UUID_RE.test(id);
  const [form, setForm] = useState<Form>(empty);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const slugTouched = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      const { data, error } = await supabase
        .from("blog_posts").select("*").eq("id", id!).maybeSingle();
      if (error || !data) {
        toast.error("Artigo não encontrado");
        navigate("/admin/blog");
        return;
      }
      slugTouched.current = true;
      setForm({
        title: data.title || "",
        slug: data.slug || "",
        excerpt: data.excerpt || "",
        content: data.content || "",
        category: data.category || "",
        author: data.author || "",
        cover_image_url: data.cover_image_url || "",
        read_time: data.read_time || "",
        status: (data.status as "draft" | "published") || "draft",
        is_featured: !!data.is_featured,
      });
      setLoading(false);
    })();
  }, [id, isEditing, navigate]);

  const update = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "title" && !slugTouched.current) next.slug = slugify(value as string);
      if (key === "slug") slugTouched.current = true;
      return next;
    });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file, { upsert: false });
    if (error) { toast.error("Erro ao fazer upload"); setUploading(false); return; }
    const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
    update("cover_image_url", data.publicUrl);
    setUploading(false);
    toast.success("Imagem carregada");
  };

  const save = async (publish?: boolean) => {
    if (!form.title.trim()) { toast.error("O título é obrigatório"); return; }
    if (!form.slug.trim()) { toast.error("O slug é obrigatório"); return; }
    const finalStatus = publish ? "published" : form.status;
    const payload: any = {
      title: form.title.trim(),
      slug: slugify(form.slug),
      excerpt: form.excerpt || null,
      content: form.content,
      category: form.category || null,
      author: form.author || null,
      cover_image_url: form.cover_image_url || null,
      read_time: form.read_time || null,
      status: finalStatus,
      is_featured: form.is_featured,
      published_at: finalStatus === "published"
        ? (isEditing && form.status === "published" ? undefined : new Date().toISOString())
        : null,
    };
    if (payload.published_at === undefined) delete payload.published_at;
    setSaving(true);
    const res = isEditing
      ? await supabase.from("blog_posts").update(payload).eq("id", id!).select().maybeSingle()
      : await supabase.from("blog_posts").insert(payload).select().maybeSingle();
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message.includes("duplicate") ? "Já existe um artigo com este slug" : "Erro ao guardar");
      return;
    }
    toast.success(publish ? "Artigo publicado" : "Guardado");
    if (!isEditing && res.data) navigate(`/admin/blog/${res.data.id}`);
    else setForm((f) => ({ ...f, status: finalStatus as Form["status"] }));
  };

  if (loading) {
    return <div className="p-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> A carregar...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button variant="ghost" onClick={() => navigate("/admin/blog")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="flex gap-2">
          {form.status === "published" && form.slug && (
            <Button variant="outline" asChild>
              <a href={`/blog/${form.slug}`} target="_blank" rel="noreferrer"><Eye className="w-4 h-4 mr-2" /> Ver</a>
            </Button>
          )}
          <Button variant="outline" disabled={saving} onClick={() => save(false)}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar rascunho
          </Button>
          <Button disabled={saving} onClick={() => save(true)}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {form.status === "published" ? "Atualizar publicação" : "Publicar"}
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-archivo font-bold">
        {isEditing ? "Editar artigo" : "Novo artigo"}
      </h1>

      <Card className="p-6 space-y-5">
        <div className="space-y-2">
          <Label>Título *</Label>
          <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Como preparar uma cerimónia memorial..." />
        </div>

        <div className="space-y-2">
          <Label>Slug (URL)</Label>
          <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="como-preparar-cerimonia-memorial" />
          <p className="text-xs text-muted-foreground">/blog/{form.slug || "..."}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Input value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Guias" />
          </div>
          <div className="space-y-2">
            <Label>Autor</Label>
            <Input value={form.author} onChange={(e) => update("author", e.target.value)} placeholder="Maria Silva" />
          </div>
          <div className="space-y-2">
            <Label>Tempo de leitura</Label>
            <Input value={form.read_time} onChange={(e) => update("read_time", e.target.value)} placeholder="5 min" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Excerto</Label>
          <Textarea value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} rows={2} placeholder="Resumo curto para listagens..." />
        </div>

        <div className="space-y-2">
          <Label>Imagem de capa</Label>
          <div className="flex items-center gap-3">
            {form.cover_image_url ? (
              <img src={form.cover_image_url} alt="Capa" className="w-32 h-20 rounded object-cover border" />
            ) : (
              <div className="w-32 h-20 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">Sem imagem</div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Carregar imagem
            </Button>
            {form.cover_image_url && (
              <Button type="button" variant="ghost" onClick={() => update("cover_image_url", "")}>Remover</Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Conteúdo (Markdown)</Label>
          <Textarea
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            rows={20}
            className="font-mono text-sm"
            placeholder={`Parágrafo de introdução...\n\n## Subtítulo\n\nOutro parágrafo.\n\n![Legenda](https://...)`}
          />
          <p className="text-xs text-muted-foreground">Use linha em branco entre parágrafos. <code>## título</code> para subtítulos. <code>![alt](url)</code> para imagens.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={form.status} onValueChange={(v) => update("status", v as Form["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-3">
            <Switch id="featured" checked={form.is_featured} onCheckedChange={(v) => update("is_featured", v)} />
            <Label htmlFor="featured" className="cursor-pointer">Artigo em destaque</Label>
          </div>
        </div>
      </Card>
    </div>
  );
}