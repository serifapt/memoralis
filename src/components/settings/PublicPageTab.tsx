import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, X, Globe, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PublicPageData {
  pagina_publica_visivel: boolean;
  slug: string;
  descricao: string;
  cover_image_url: string;
  telefone_secundario: string;
  website: string;
  localidade: string;
  codigo_postal: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  horario: string;
  servicos: string[];
}

interface PublicPageTabProps {
  funerariaId: string | null;
}

export function PublicPageTab({ funerariaId }: PublicPageTabProps) {
  const [data, setData] = useState<PublicPageData>({
    pagina_publica_visivel: false,
    slug: "",
    descricao: "",
    cover_image_url: "",
    telefone_secundario: "",
    website: "",
    localidade: "",
    codigo_postal: "",
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    horario: "",
    servicos: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [slugConflict, setSlugConflict] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const slugSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (funerariaId) loadData();
  }, [funerariaId]);

  const loadData = async () => {
    try {
      const { data: f } = await supabase
        .from("funerarias")
        .select("pagina_publica_visivel, slug, descricao, cover_image_url, telefone_secundario, website, facebook_url, instagram_url, linkedin_url, horario, servicos, nome_comercial")
        .eq("id", funerariaId!)
        .single();

      if (f) {
        const currentSlug = f.slug || "";
        
        setData({
          pagina_publica_visivel: f.pagina_publica_visivel || false,
          slug: currentSlug,
          descricao: f.descricao || "",
          cover_image_url: f.cover_image_url || "",
          telefone_secundario: f.telefone_secundario || "",
          website: f.website || "",
          localidade: "",
          codigo_postal: "",
          facebook_url: f.facebook_url || "",
          instagram_url: f.instagram_url || "",
          linkedin_url: f.linkedin_url || "",
          horario: f.horario || "",
          servicos: (f.servicos as string[]) || [],
        });
        if (f.cover_image_url) setCoverPreview(f.cover_image_url);

        // Check for slug conflicts
        if (currentSlug) {
          const { data: conflicts } = await supabase
            .from("funerarias")
            .select("id")
            .eq("slug", currentSlug)
            .neq("id", funerariaId!);

          if (conflicts && conflicts.length > 0) {
            setSlugConflict(true);
            setTimeout(() => {
              slugSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 300);
          }
        }
      }
    } catch (err) {
      console.error("Error loading public page data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecione um ficheiro de imagem"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("O ficheiro não pode exceder 5MB"); return; }
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview("");
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!funerariaId) { toast.error("Funerária não encontrada"); return; }

    // Validate slug
    if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
      toast.error("O slug só pode conter letras minúsculas, números e hífens");
      return;
    }

    // Check slug uniqueness before saving
    if (data.slug) {
      const { data: conflicts } = await supabase
        .from("funerarias")
        .select("id")
        .eq("slug", data.slug)
        .neq("id", funerariaId);

      if (conflicts && conflicts.length > 0) {
        toast.error("Este link já está a ser utilizado por outra funerária. Escolha outro.");
        setSlugConflict(true);
        setTimeout(() => {
          slugSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        return;
      }
    }

    setSaving(true);
    try {
      let coverUrl = data.cover_image_url;

      if (coverFile) {
        const ext = coverFile.name.split(".").pop() || "png";
        const fileName = `${funerariaId}/cover_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("funeraria-logos")
          .upload(fileName, coverFile, { contentType: coverFile.type, upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("funeraria-logos").getPublicUrl(fileName);
        coverUrl = urlData.publicUrl;
      }

      if (!coverPreview) coverUrl = "";

      const { error } = await supabase
        .from("funerarias")
        .update({
          pagina_publica_visivel: data.pagina_publica_visivel,
          slug: data.slug || null,
          descricao: data.descricao || null,
          cover_image_url: coverUrl || null,
          telefone_secundario: data.telefone_secundario || null,
          website: data.website || null,
          facebook_url: data.facebook_url || null,
          instagram_url: data.instagram_url || null,
          linkedin_url: data.linkedin_url || null,
          horario: data.horario || null,
        })
        .eq("id", funerariaId);

      if (error) {
        if (error.message.includes("unique") || error.message.includes("duplicate")) {
          toast.error("Este slug já está a ser utilizado por outra funerária");
          return;
        }
        throw error;
      }

      setData(prev => ({ ...prev, cover_image_url: coverUrl }));
      setCoverFile(null);
      setSlugConflict(false);
      toast.success("Página pública guardada com sucesso");
    } catch (err) {
      console.error("Error saving public page:", err);
      toast.error("Erro ao guardar a página pública");
    } finally {
      setSaving(false);
    }
  };

  if (!funerariaId) {
    return (
      <Card className="p-6">
        <p className="text-sm text-destructive">Não foi possível carregar os dados da funerária.</p>
      </Card>
    );
  }

  const publicUrl = data.slug ? `memoralis.pt/funerarias/${data.slug}` : "";

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <Card className="p-6">
        <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">Imagem de Capa</h3>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFileChange} />
        {coverPreview ? (
          <div className="space-y-3">
            <div className="relative">
              <img src={coverPreview} alt="Capa" className="w-full h-48 object-cover rounded-lg border border-border" />
              <button onClick={handleRemoveCover} className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90">
                <X className="w-4 h-4" />
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={() => coverInputRef.current?.click()}>Alterar imagem</Button>
          </div>
        ) : (
          <div onClick={() => coverInputRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Clique para selecionar a imagem de capa</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 5MB</p>
          </div>
        )}
      </Card>

      {/* About */}
      <Card className="p-6">
        <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">Sobre</h3>
        <Textarea
          value={data.descricao}
          onChange={(e) => setData(prev => ({ ...prev, descricao: e.target.value }))}
          placeholder="Descreva a história e missão da sua funerária..."
          rows={6}
          disabled={loading}
        />
      </Card>

      {/* Services */}
      {/* Additional Contacts */}
      <Card className="p-6">
        <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">Contactos Adicionais</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Telefone Secundário</Label>
            <Input value={data.telefone_secundario} onChange={(e) => setData(prev => ({ ...prev, telefone_secundario: e.target.value }))} placeholder="258 515 233" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input value={data.website} onChange={(e) => setData(prev => ({ ...prev, website: e.target.value }))} placeholder="https://funerariasjoan.pt" disabled={loading} />
          </div>
        </div>
      </Card>

      {/* Social Media */}
      <Card className="p-6">
        <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">Redes Sociais</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Facebook</Label>
            <Input value={data.facebook_url} onChange={(e) => setData(prev => ({ ...prev, facebook_url: e.target.value }))} placeholder="https://facebook.com/..." disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label>Instagram</Label>
            <Input value={data.instagram_url} onChange={(e) => setData(prev => ({ ...prev, instagram_url: e.target.value }))} placeholder="https://instagram.com/..." disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn</Label>
            <Input value={data.linkedin_url} onChange={(e) => setData(prev => ({ ...prev, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/..." disabled={loading} />
          </div>
        </div>
      </Card>

      {/* Schedule */}
      <Card className="p-6">
        <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">Horário de Funcionamento</h3>
        <Textarea
          value={data.horario}
          onChange={(e) => setData(prev => ({ ...prev, horario: e.target.value }))}
          placeholder="Seg a Sex 9:00 - 12:30 | 14:30 - 18:00&#10;Sáb 9:00 - 13:00"
          rows={4}
          disabled={loading}
        />
      </Card>

      {/* Visibility & Link — moved to bottom */}
      <Card className="p-6" ref={slugSectionRef}>
        <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">Visibilidade e Link</h3>
        <div className="space-y-4">
          {slugConflict && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                O link atual da sua página já está a ser utilizado por outra funerária. Por favor, defina um novo link personalizado abaixo.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">Página pública visível</p>
              <p className="text-sm text-muted-foreground">Quando ativa, a página da sua funerária fica visível ao público</p>
            </div>
            <Switch
              checked={data.pagina_publica_visivel}
              onCheckedChange={(checked) => setData(prev => ({ ...prev, pagina_publica_visivel: checked }))}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Link personalizado</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">memoralis.pt/funerarias/</span>
              <Input
                id="slug"
                value={data.slug}
                onChange={(e) => {
                  setData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }));
                  setSlugConflict(false);
                }}
                placeholder="funeraria-s-joao"
                disabled={loading}
                className={slugConflict ? "border-destructive" : ""}
              />
            </div>
            {publicUrl && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Globe className="w-4 h-4" />
                <a href={`https://${publicUrl}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                  {publicUrl} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Button className="bg-primary hover:bg-primary/90" onClick={handleSave} disabled={saving || loading}>
        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Guardar Página Pública
      </Button>
    </div>
  );
}
