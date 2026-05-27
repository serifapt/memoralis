import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CareSiteHeader } from "@/components/care/CareSiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Info, Loader2, Plus, Trash2 } from "lucide-react";
import {
  carePlanPriceByCode,
  commemorativeDateTypes,
} from "@/lib/care-status";
import { CARE_PLANS } from "@/lib/care-plans";
import { useCemeteriesCascade } from "@/hooks/useCemeteriesCascade";
import { CareInterestDialog } from "@/components/care/CareInterestDialog";

type Plan = { id: string; code: string; name: string; description: string | null; includes_json: unknown };
type CommemorativeDate = { type: string; date?: string; note?: string; label?: string };

const MAX_DATES = 3;

const steps = [
  { n: 1, label: "Os seus dados" },
  { n: 2, label: "A campa" },
  { n: 3, label: "O plano" },
  { n: 4, label: "Confirmar" },
];

export default function CareSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [authChecked, setAuthChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const { localities, parishesFor, cemeteriesFor } = useCemeteriesCascade({ activeOnly: true });

  // form state
  const [personal, setPersonal] = useState({ name: "", email: "", phone: "", nif: "" });
  const [locality, setLocality] = useState<string>("");
  const [parish, setParish] = useState<string>("");
  const [grave, setGrave] = useState({
    cemetery_id: "" as string | "",
    cemetery_name: "",
    cemetery_address: "",
    grave_number: "",
    section: "",
    names_on_grave: "",
    notes: "",
  });
  const [planCode, setPlanCode] = useState<string>(
    () => searchParams.get("plano") || "mensal"
  );
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [dates, setDates] = useState<CommemorativeDate[]>([]);
  const [familyMessage, setFamilyMessage] = useState("");

  // auth gate – require logged-in customer
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/care/auth?redirect=/care/aderir");
      } else {
        const u = data.session.user;
        setPersonal((p) => ({
          ...p,
          email: u.email ?? "",
          name: (u.user_metadata?.name as string) ?? p.name,
        }));
        setAuthChecked(true);
      }
    });
  }, [navigate]);

  // load data
  useEffect(() => {
    if (!authChecked) return;
    (async () => {
      const { data: pls } = await supabase
        .from("care_plans")
        .select("id,code,name,description,includes_json")
        .eq("active", true)
        .neq("code", "HOMENAGEM")
        .order("display_order");
      setPlans(pls ?? []);
    })();
  }, [authChecked]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.code === planCode) ?? plans[0],
    [plans, planCode]
  );

  const monthlyPrice = carePlanPriceByCode[planCode] ?? 0;
  const displayPrice = billingPeriod === "yearly" ? monthlyPrice * 12 * 0.9 : monthlyPrice;

  const datesValid = dates.every((d) => {
    if (d.type === "outra") return (d.label ?? "").trim().length > 0 && (d.date ?? "").length > 0;
    const def = commemorativeDateTypes.find((x) => x.value === d.type);
    return def?.hasDate ? (d.date ?? "").length > 0 : true;
  });

  const canNext = () => {
    if (step === 1) return personal.name.trim().length > 1 && /\S+@\S+\.\S+/.test(personal.email);
    if (step === 2) return !!grave.cemetery_id;
    if (step === 3) return !!selectedPlan && datesValid;
    return true;
  };

  const parishes = locality ? parishesFor(locality) : [];
  const filteredCemeteries = locality ? cemeteriesFor(locality, parish) : [];

  const handleLocalityChange = (v: string) => {
    setLocality(v);
    setParish("");
    setGrave((g) => ({ ...g, cemetery_id: "", cemetery_name: "", cemetery_address: "" }));
  };
  const handleParishChange = (v: string) => {
    setParish(v === "__all" ? "" : v);
    setGrave((g) => ({ ...g, cemetery_id: "", cemetery_name: "", cemetery_address: "" }));
  };
  const handleCemeteryChange = (id: string) => {
    const c = filteredCemeteries.find((x) => x.id === id);
    if (!c) return;
    setGrave((g) => ({
      ...g,
      cemetery_id: c.id,
      cemetery_name: `${c.nome}${c.freguesia ? ` — ${c.freguesia}` : ""}, ${c.municipio}`,
      cemetery_address: c.morada ?? "",
    }));
  };

  const addDate = () =>
    setDates((d) =>
      d.length >= MAX_DATES
        ? d
        : [...d, { type: commemorativeDateTypes[0].value, date: "", note: "", label: "" }]
    );
  const removeDate = (i: number) => setDates((d) => d.filter((_, idx) => idx !== i));
  const updateDate = (i: number, patch: Partial<CommemorativeDate>) =>
    setDates((d) => d.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const submit = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("care-signup", {
        body: {
          personal,
          grave: {
            cemetery_id: grave.cemetery_id || null,
            cemetery_name: grave.cemetery_name,
            cemetery_address: grave.cemetery_address,
            grave_number: grave.grave_number,
            section: grave.section,
            names_on_grave: grave.names_on_grave,
            notes: grave.notes,
          },
          plan: {
            care_plan_id: selectedPlan!.id,
            billing_period: billingPeriod,
            commemorative_dates: dates,
            family_message: familyMessage,
          },
        },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);

      toast({
        title: "Pedido enviado",
        description: "Recebemos o seu pedido. Vamos contactá-lo em breve.",
      });
      navigate("/account/care");
    } catch (e) {
      toast({
        title: "Não foi possível enviar",
        description: e instanceof Error ? e.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CareSiteHeader />

      <main className="container mx-auto px-4 py-10 max-w-3xl">
        {/* progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
            <span>
              Passo {step} de {steps.length}
            </span>
            <span className="font-medium text-foreground">{steps[step - 1].label}</span>
          </div>
          <Progress value={(step / steps.length) * 100} className="h-2" />
        </div>

        <Card className="p-6 sm:p-10 text-[16px] leading-relaxed">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Comecemos por si</h2>
                <p className="text-muted-foreground">
                  Precisamos destes dados para o contactar e enviar atualizações sobre a campa.
                </p>
              </div>
              <div className="grid gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">Nome completo</Label>
                  <Input id="name" className="h-12 text-base" value={personal.name}
                    onChange={(e) => setPersonal({ ...personal, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">Email</Label>
                  <Input id="email" type="email" className="h-12 text-base" value={personal.email}
                    onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base">Telefone</Label>
                  <Input id="phone" className="h-12 text-base" value={personal.phone}
                    onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nif" className="text-base">NIF (opcional, para fatura)</Label>
                  <Input id="nif" className="h-12 text-base" value={personal.nif}
                    onChange={(e) => setPersonal({ ...personal, nif: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Onde fica a campa?</h2>
                <p className="text-muted-foreground">
                  Indique-nos o cemitério e, se souber, o número e secção da campa.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-base">Cemitério</Label>
                <Select value={grave.cemetery_id || "__manual"} onValueChange={handleCemeterySelect}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Escolher cemitério" />
                  </SelectTrigger>
                  <SelectContent>
                    {cemeteries.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome} — {c.municipio}
                      </SelectItem>
                    ))}
                    <SelectItem value="__manual">Outro / não está na lista</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!grave.cemetery_id && (
                <div className="space-y-2">
                  <Label className="text-base">Nome do cemitério</Label>
                  <Input className="h-12 text-base" value={grave.cemetery_name}
                    onChange={(e) => setGrave({ ...grave, cemetery_name: e.target.value })} />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-base">Morada do cemitério (opcional)</Label>
                <Input className="h-12 text-base" value={grave.cemetery_address}
                  onChange={(e) => setGrave({ ...grave, cemetery_address: e.target.value })} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base">Número da campa</Label>
                  <Input className="h-12 text-base" value={grave.grave_number}
                    onChange={(e) => setGrave({ ...grave, grave_number: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Secção / talhão</Label>
                  <Input className="h-12 text-base" value={grave.section}
                    onChange={(e) => setGrave({ ...grave, section: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base">Nomes inscritos na campa</Label>
                <Input className="h-12 text-base" placeholder="Ex.: Maria Silva e António Silva"
                  value={grave.names_on_grave}
                  onChange={(e) => setGrave({ ...grave, names_on_grave: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label className="text-base">Notas / referências para a equipa</Label>
                <Textarea rows={3} className="text-base" placeholder="Ex.: campa de pedra branca, ao lado da capela"
                  value={grave.notes}
                  onChange={(e) => setGrave({ ...grave, notes: e.target.value })} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Escolha o plano</h2>
                <p className="text-muted-foreground">
                  Pode mudar o plano mais tarde a qualquer momento.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {plans.map((p) => {
                  const active = p.code === planCode;
                  const info = CARE_PLANS.find((x) => x.code === p.code);
                  return (
                    <div
                      key={p.id}
                      className={`relative rounded-lg border-2 p-4 transition-all ${
                        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setPlanCode(p.code)}
                        className="text-left w-full"
                      >
                        <div className="font-semibold text-lg pr-8">{info?.name ?? p.name}</div>
                        {(info?.freq || p.description) && (
                          <div className="text-sm text-muted-foreground mt-1">{info?.freq ?? p.description}</div>
                        )}
                        <div className="mt-3 text-xl font-bold text-primary">
                          {carePlanPriceByCode[p.code] ?? info?.price ?? "—"} €
                          <span className="text-sm font-normal text-muted-foreground"> / mês</span>
                        </div>
                      </button>
                      {info && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-primary"
                              aria-label="Ver detalhes do plano"
                            >
                              <Info className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-72">
                            <div className="font-semibold mb-2">{info.name}</div>
                            <div className="text-xs text-muted-foreground mb-3">{info.freq} · IVA incluído</div>
                            <ul className="space-y-1.5 text-sm">
                              {info.items.map((it) => (
                                <li key={it} className="flex gap-2">
                                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                  <span className="text-muted-foreground">{it}</span>
                                </li>
                              ))}
                            </ul>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Label className="text-base">Periodicidade de pagamento</Label>
                <Select value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as "monthly" | "yearly")}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual (–10%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Datas comemorativas (opcional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDate}
                    disabled={dates.length >= MAX_DATES}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pode escolher até {MAX_DATES} datas especiais. A equipa coloca um ramo na campa nessas ocasiões — Dia de Todos os Santos, aniversários, ou outras à sua escolha.
                </p>
                {dates.map((d, i) => {
                  const def = commemorativeDateTypes.find((x) => x.value === d.type);
                  const isOutra = d.type === "outra";
                  return (
                    <div key={i} className="rounded-md border border-border p-3 space-y-2">
                      <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
                        <Select value={d.type} onValueChange={(v) => updateDate(i, { type: v, date: "", label: "" })}>
                          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {commemorativeDateTypes.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {def?.hasDate && (
                          <Input type="date" className="h-11" value={d.date ?? ""}
                            onChange={(e) => updateDate(i, { date: e.target.value })} />
                        )}
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeDate(i)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {isOutra && (
                        <Input
                          className="h-11"
                          placeholder="Que data é esta? Ex.: Aniversário de casamento"
                          value={d.label ?? ""}
                          onChange={(e) => updateDate(i, { label: e.target.value })}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Label htmlFor="family-message" className="text-base">Mensagem do familiar (opcional)</Label>
                <Textarea
                  id="family-message"
                  rows={3}
                  className="text-base"
                  placeholder="Uma dedicatória ou indicação que queira partilhar com a nossa equipa."
                  value={familyMessage}
                  onChange={(e) => setFamilyMessage(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Confirme o seu pedido</h2>
                <p className="text-muted-foreground">
                  Reveja os dados. Pode voltar atrás para corrigir.
                </p>
              </div>

              <Section title="Os seus dados">
                <SummaryRow label="Nome" value={personal.name} />
                <SummaryRow label="Email" value={personal.email} />
                {personal.phone && <SummaryRow label="Telefone" value={personal.phone} />}
                {personal.nif && <SummaryRow label="NIF" value={personal.nif} />}
              </Section>

              <Section title="A campa">
                <SummaryRow label="Cemitério" value={grave.cemetery_name} />
                {grave.grave_number && <SummaryRow label="Número" value={grave.grave_number} />}
                {grave.section && <SummaryRow label="Secção" value={grave.section} />}
                {grave.names_on_grave && <SummaryRow label="Nomes na campa" value={grave.names_on_grave} />}
                {grave.notes && <SummaryRow label="Notas" value={grave.notes} />}
              </Section>

              <Section title="Plano escolhido">
                <SummaryRow label="Plano" value={selectedPlan?.name ?? ""} />
                <SummaryRow
                  label="Periodicidade"
                  value={billingPeriod === "monthly" ? "Mensal" : "Anual (–10%)"}
                />
                <SummaryRow
                  label={billingPeriod === "monthly" ? "Valor mensal" : "Valor anual"}
                  value={`${displayPrice.toFixed(2)} €`}
                />
                {dates.length > 0 && (
                  <SummaryRow
                    label="Datas especiais"
                    value={dates
                      .map((d) => {
                        if (d.type === "outra" && d.label) return d.label;
                        return commemorativeDateTypes.find((x) => x.value === d.type)?.label ?? d.type;
                      })
                      .join(", ")}
                  />
                )}
                {familyMessage.trim() && (
                  <SummaryRow label="Mensagem" value={familyMessage} />
                )}
              </Section>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                Ao confirmar, a sua subscrição é registada de imediato. A equipa Memoralis irá rever os dados e contactá-lo a seguir para activar o serviço.
              </div>
            </div>
          )}

          {/* nav buttons */}
          <div className="mt-10 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => (step === 1 ? navigate("/care") : setStep(step - 1))}
              disabled={submitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            {step < 4 ? (
              <Button
                type="button"
                size="lg"
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                className="px-8"
              >
                Continuar <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" size="lg" onClick={submit} disabled={submitting} className="px-8">
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Confirmar pedido
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <div className="space-y-2 text-[15px]">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 py-1 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}