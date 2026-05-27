import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import { CARE_PLANS } from "@/lib/care-plans";
import { useCemeteriesCascade } from "@/hooks/useCemeteriesCascade";

const schema = z.object({
  name: z.string().trim().min(2, "Indique o seu nome").max(120),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  locality: z.string().trim().max(120).optional().or(z.literal("")),
  parish: z.string().trim().max(120).optional().or(z.literal("")),
  cemetery_name: z.string().trim().min(2, "Indique o cemitério").max(180),
  plan_code: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export function CareInterestDialog({ trigger }: { trigger: React.ReactNode }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { localities, parishesFor, cemeteriesFor } = useCemeteriesCascade({ activeOnly: false });
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    locality: "",
    parish: "",
    cemetery_name: "",
    plan_code: "",
    message: "",
  });
  const [localityMode, setLocalityMode] = useState<"select" | "manual">("select");
  const [parishMode, setParishMode] = useState<"select" | "manual">("select");
  const [cemeteryMode, setCemeteryMode] = useState<"select" | "manual">("select");

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const parishes = form.locality && localityMode === "select" ? parishesFor(form.locality) : [];
  const cems = form.locality && localityMode === "select" ? cemeteriesFor(form.locality, parishMode === "select" ? form.parish : "") : [];

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Verifique os dados",
        description: parsed.error.issues[0]?.message ?? "Campos inválidos",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("care_interest_leads").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        locality: parsed.data.locality || null,
        parish: parsed.data.parish || null,
        freguesia: parsed.data.parish || null,
        cemetery_name: parsed.data.cemetery_name,
        plan_code: parsed.data.plan_code || null,
        message: parsed.data.message || null,
      });
      if (error) throw error;
      setDone(true);
    } catch (e) {
      toast({
        title: "Não foi possível registar",
        description: e instanceof Error ? e.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setDone(false);
    setForm({
      name: "",
      email: "",
      phone: "",
      locality: "",
      parish: "",
      cemetery_name: "",
      plan_code: "",
      message: "",
    });
    setLocalityMode("select");
    setParishMode("select");
    setCemeteryMode("select");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        {done ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle>Pedido registado</DialogTitle>
            <DialogDescription className="text-base">
              Obrigado! Vamos contactá-lo assim que o serviço estiver disponível no cemitério indicado.
            </DialogDescription>
            <Button onClick={() => setOpen(false)} className="mt-2">Fechar</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Avise-me quando estiver disponível</DialogTitle>
              <DialogDescription>
                Deixe os seus dados e nós contactamo-lo assim que o serviço estiver ativo no cemitério.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ci-name">Nome *</Label>
                  <Input id="ci-name" value={form.name} onChange={(e) => update("name", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ci-email">Email *</Label>
                  <Input id="ci-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ci-phone">Telefone</Label>
                <Input id="ci-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Localidade *</Label>
                {localityMode === "select" && localities.length > 0 ? (
                  <Select
                    value={form.locality}
                    onValueChange={(v) => {
                      if (v === "__manual") {
                        setLocalityMode("manual");
                        setForm((f) => ({ ...f, locality: "", parish: "", cemetery_name: "" }));
                        setParishMode("manual");
                        setCemeteryMode("manual");
                      } else {
                        setForm((f) => ({ ...f, locality: v, parish: "", cemetery_name: "" }));
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Escolher localidade" /></SelectTrigger>
                    <SelectContent>
                      {localities.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      <SelectItem value="__manual">Outra / não está na lista</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="Localidade" value={form.locality} onChange={(e) => update("locality", e.target.value)} />
                )}
              </div>

              {form.locality && (
                <div className="space-y-1.5">
                  <Label>Freguesia</Label>
                  {parishMode === "select" && parishes.length > 0 ? (
                    <Select
                      value={form.parish || "__all"}
                      onValueChange={(v) => {
                        if (v === "__manual") {
                          setParishMode("manual");
                          setCemeteryMode("manual");
                          setForm((f) => ({ ...f, parish: "", cemetery_name: "" }));
                        } else {
                          setForm((f) => ({ ...f, parish: v === "__all" ? "" : v, cemetery_name: "" }));
                        }
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Escolher freguesia" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all">Todas / não sei</SelectItem>
                        {parishes.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        <SelectItem value="__manual">Outra</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input placeholder="Freguesia" value={form.parish} onChange={(e) => update("parish", e.target.value)} />
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Cemitério *</Label>
                {cemeteryMode === "select" && cems.length > 0 ? (
                  <Select
                    value={form.cemetery_name}
                    onValueChange={(v) => {
                      if (v === "__manual") {
                        setCemeteryMode("manual");
                        update("cemetery_name", "");
                      } else update("cemetery_name", v);
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Escolher cemitério" /></SelectTrigger>
                    <SelectContent>
                      {cems.map((c) => (
                        <SelectItem key={c.id} value={c.nome}>
                          {c.nome}{c.freguesia ? ` — ${c.freguesia}` : ""}
                        </SelectItem>
                      ))}
                      <SelectItem value="__manual">Outro / não está na lista</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="Nome do cemitério" value={form.cemetery_name} onChange={(e) => update("cemetery_name", e.target.value)} />
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Plano de interesse</Label>
                <Select value={form.plan_code} onValueChange={(v) => update("plan_code", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARE_PLANS.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        {p.name} — {p.price}€/mês
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ci-message">Mensagem</Label>
                <Textarea
                  id="ci-message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={submit} disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Registar interesse
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}