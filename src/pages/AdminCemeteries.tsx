import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Pencil, Plus, Trash2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CemeteryPicker } from "@/components/care/CemeteryPicker";

type Row = {
  id: string;
  nome: string;
  municipio: string;
  freguesia: string | null;
  morada: string | null;
  lat: number | null;
  lng: number | null;
  ativo: boolean;
};

const empty = {
  id: "",
  nome: "",
  municipio: "",
  freguesia: "",
  morada: "",
  lat: null as number | null,
  lng: null as number | null,
  ativo: true,
};

export default function AdminCemeteries() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<typeof empty>(empty);
  const [saving, setSaving] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cemeteries")
      .select("id,nome,municipio,freguesia,morada,lat,lng,ativo")
      .order("municipio")
      .order("nome");
    if (error) toast({ title: "Erro a carregar", description: error.message, variant: "destructive" });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm(empty);
    setImportUrl("");
    setOpen(true);
  };

  const openEdit = (r: Row) => {
    setForm({
      id: r.id,
      nome: r.nome,
      municipio: r.municipio,
      freguesia: r.freguesia ?? "",
      morada: r.morada ?? "",
      lat: r.lat != null ? Number(r.lat) : null,
      lng: r.lng != null ? Number(r.lng) : null,
      ativo: r.ativo,
    });
    setImportUrl("");
    setOpen(true);
  };

  const handleImport = async () => {
    const url = importUrl.trim();
    if (!url) {
      toast({ title: "Cole o link do Google Maps", variant: "destructive" });
      return;
    }
    setImporting(true);
    const { data, error } = await supabase.functions.invoke("import-google-maps-place", {
      body: { url },
    });
    setImporting(false);
    if (error || !data || (data as { error?: string }).error) {
      toast({
        title: "Não foi possível importar",
        description: (data as { error?: string })?.error || error?.message || "Verifique o link e tente novamente.",
        variant: "destructive",
      });
      return;
    }
    const d = data as {
      name?: string | null; lat?: number; lng?: number;
      morada?: string; freguesia?: string; municipio?: string;
    };
    setForm((f) => ({
      ...f,
      nome: f.nome || d.name || f.nome,
      municipio: d.municipio || f.municipio,
      freguesia: d.freguesia || f.freguesia,
      morada: d.morada || f.morada,
      lat: typeof d.lat === "number" ? d.lat : f.lat,
      lng: typeof d.lng === "number" ? d.lng : f.lng,
    }));
    toast({ title: "Dados importados", description: "Reveja os campos antes de guardar." });
  };

  const save = async () => {
    if (!form.nome.trim() || !form.municipio.trim()) {
      toast({ title: "Nome e Localidade são obrigatórios", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      nome: form.nome.trim(),
      municipio: form.municipio.trim(),
      freguesia: form.freguesia.trim() || null,
      morada: form.morada.trim() || null,
      lat: form.lat,
      lng: form.lng,
      ativo: form.ativo,
    };
    const { error } = form.id
      ? await supabase.from("cemeteries").update(payload).eq("id", form.id)
      : await supabase.from("cemeteries").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Erro a guardar", description: error.message, variant: "destructive" });
      return;
    }
    setOpen(false);
    await load();
    toast({ title: form.id ? "Cemitério atualizado" : "Cemitério adicionado" });
  };

  const remove = async (r: Row) => {
    if (!confirm(`Eliminar cemitério "${r.nome}"?`)) return;
    const { error } = await supabase.from("cemeteries").delete().eq("id", r.id);
    if (error) {
      toast({ title: "Erro a eliminar", description: error.message, variant: "destructive" });
      return;
    }
    await load();
  };

  const toggleActive = async (r: Row) => {
    const { error } = await supabase.from("cemeteries").update({ ativo: !r.ativo }).eq("id", r.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    await load();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Cemitérios</h1>
          <p className="text-sm text-muted-foreground">
            Gerir cemitérios onde o serviço Memoralis Care está ativo. A localização no mapa é definida com um clique.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> Adicionar cemitério
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">Sem cemitérios. Adicione o primeiro.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Freguesia</TableHead>
                <TableHead>Localidade</TableHead>
                <TableHead>Pino</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.nome}</TableCell>
                  <TableCell>{r.freguesia ?? "—"}</TableCell>
                  <TableCell>{r.municipio}</TableCell>
                  <TableCell>
                    {r.lat != null && r.lng != null ? (
                      <Badge variant="secondary" className="gap-1">
                        <MapPin className="w-3 h-3" /> {Number(r.lat).toFixed(3)}, {Number(r.lng).toFixed(3)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sem pino</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleActive(r)}
                      className="inline-flex items-center"
                      title="Alternar estado"
                    >
                      <Badge variant={r.ativo ? "default" : "outline"}>
                        {r.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(r)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar cemitério" : "Novo cemitério"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="rounded-md border border-dashed bg-muted/30 p-3 space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" /> Importar do Google Maps
              </Label>
              <p className="text-xs text-muted-foreground">
                Cole um link partilhado (share.google, maps.app.goo.gl ou google.com/maps) para preencher automaticamente nome, morada, localidade e pin no mapa.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://share.google/..."
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  disabled={importing}
                />
                <Button type="button" onClick={handleImport} disabled={importing || !importUrl.trim()}>
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Importar"}
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Localidade (município) *</Label>
                <Input value={form.municipio} onChange={(e) => setForm({ ...form, municipio: e.target.value })} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Freguesia</Label>
                <Input value={form.freguesia} onChange={(e) => setForm({ ...form, freguesia: e.target.value })} />
              </div>
              <div className="space-y-1.5 flex flex-col">
                <Label>Ativo</Label>
                <div className="flex items-center h-10">
                  <Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
                  <span className="ml-3 text-sm text-muted-foreground">
                    {form.ativo ? "Visível para clientes" : "Oculto"}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Morada</Label>
              <Input value={form.morada} onChange={(e) => setForm({ ...form, morada: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Localização no mapa</Label>
              <p className="text-xs text-muted-foreground">
                Clique no mapa para colocar o pino. {form.lat != null && form.lng != null ? `(${form.lat.toFixed(5)}, ${form.lng.toFixed(5)})` : "Sem pino"}
              </p>
              <CemeteryPicker
                lat={form.lat}
                lng={form.lng}
                onChange={(lat, lng) => setForm({ ...form, lat, lng })}
              />
              {(form.lat != null || form.lng != null) && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                  onClick={() => setForm({ ...form, lat: null, lng: null })}
                >
                  Remover pino
                </button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}