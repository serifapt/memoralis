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

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ci-locality">Localidade</Label>
                  <Input id="ci-locality" value={form.locality} onChange={(e) => update("locality", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ci-parish">Freguesia</Label>
                  <Input id="ci-parish" value={form.parish} onChange={(e) => update("parish", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ci-cemetery">Cemitério *</Label>
                <Input
                  id="ci-cemetery"
                  placeholder="Nome do cemitério"
                  value={form.cemetery_name}
                  onChange={(e) => update("cemetery_name", e.target.value)}
                />
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