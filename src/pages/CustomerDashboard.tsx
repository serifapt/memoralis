import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  useCustomerProfile,
  useMemorialLocations,
  useCareSubscriptions,
  useOpenCustomerPortal,
} from "@/hooks/useCareService";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CARE_STATUS_LABELS } from "@/lib/care-status";
import {
  Heart,
  Loader2,
  MapPin,
  Calendar,
  Phone,
  LogOut,
  Plus,
  FileText,
  Info,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { CareSiteHeader } from "@/components/care/CareSiteHeader";

const MOLONI_ENABLED = false; // server flag — will turn on once MOLONI_CLIENT_ID is set

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  const { data: customer, isLoading: loadingCustomer } = useCustomerProfile();
  const { data: locations } = useMemorialLocations(customer?.id);
  const { data: subscriptions } = useCareSubscriptions(customer?.id);
  const openPortal = useOpenCustomerPortal();

  const { data: visits } = useQuery({
    queryKey: ["customer-visits", customer?.id],
    enabled: !!customer?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_tasks")
        .select(`
          *,
          care_subscriptions!inner ( id, customer_id, memorial_location_id ),
          service_task_media ( id, type, file_url )
        `)
        .eq("care_subscriptions.customer_id", customer!.id)
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthChecked(true);
      if (!session) navigate("/care/auth?redirect=/account/care");
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/care");
  };

  if (!authChecked || loadingCustomer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Ainda não tem um plano</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-base">
            <p>Para aceder à sua área pessoal, comece por aderir a um dos nossos planos.</p>
            <Button asChild size="lg" className="w-full text-base">
              <Link to="/care/aderir">Aderir agora</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group subscriptions by memorial location
  const locationsWithSub = (locations || []).map((loc) => ({
    location: loc,
    sub: subscriptions?.find((s) => s.memorial_location_id === loc.id),
    visits: (visits || []).filter(
      (v: any) => v.care_subscriptions?.memorial_location_id === loc.id
    ),
  }));

  return (
    <div className="min-h-screen bg-muted/20 text-[16px] leading-relaxed">
      <CareSiteHeader />

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Greeting */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif">
              Olá, {customer.name.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground mt-1 text-base">
              Bem-vindo à sua área pessoal Memoralis Care.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="default" size="lg" className="text-base">
              <a href="tel:+351210000000">
                <HelpCircle className="w-5 h-5 mr-2" /> Pedir Ajuda
              </a>
            </Button>
            <Button variant="outline" size="lg" onClick={handleLogout} className="text-base">
              <LogOut className="w-5 h-5 mr-2" /> Sair
            </Button>
          </div>
        </section>

        {locationsWithSub.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <Heart className="w-10 h-10 text-primary mx-auto" />
              <p className="text-lg">Ainda não tem nenhuma campa registada.</p>
              <Button asChild size="lg">
                <Link to="/care/aderir">
                  <Plus className="w-5 h-5 mr-2" /> Adicionar uma campa
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {locationsWithSub.map(({ location, sub, visits }) => (
              <Card key={location.id} className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-2xl font-serif">
                        {location.names_on_grave || location.cemetery_name}
                      </CardTitle>
                      <p className="text-muted-foreground mt-1 text-base flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {location.cemetery_name}
                        {location.grave_number && ` • Campa ${location.grave_number}`}
                      </p>
                    </div>
                    {sub && (
                      <Badge variant="outline" className="text-sm py-1 px-3">
                        {CARE_STATUS_LABELS[sub.status] || sub.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="info">
                    <TabsList className="grid grid-cols-3 w-full max-w-md h-12">
                      <TabsTrigger value="info" className="text-base">
                        <Info className="w-4 h-4 mr-2" /> Informação
                      </TabsTrigger>
                      <TabsTrigger value="visits" className="text-base">
                        <Calendar className="w-4 h-4 mr-2" /> Visitas
                      </TabsTrigger>
                      <TabsTrigger value="invoices" className="text-base">
                        <FileText className="w-4 h-4 mr-2" /> Faturas
                      </TabsTrigger>
                    </TabsList>

                    {/* INFO */}
                    <TabsContent value="info" className="pt-6 space-y-4 text-base">
                      <InfoRow label="Plano" value={sub?.care_plans?.name || "—"} />
                      <InfoRow
                        label="Periodicidade"
                        value={sub?.billing_period === "yearly" ? "Anual" : "Mensal"}
                      />
                      {sub?.current_period_end && (
                        <InfoRow
                          label="Próxima cobrança"
                          value={format(new Date(sub.current_period_end), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                        />
                      )}
                      {location.cemetery_address && (
                        <InfoRow label="Morada" value={location.cemetery_address} />
                      )}
                      {location.section && (
                        <InfoRow label="Secção" value={location.section} />
                      )}
                      {location.notes && (
                        <div>
                          <p className="text-muted-foreground text-sm">Notas</p>
                          <p className="whitespace-pre-line">{location.notes}</p>
                        </div>
                      )}
                      {sub && sub.status === "active" && (
                        <Button
                          variant="outline"
                          onClick={() => openPortal.mutate()}
                          disabled={openPortal.isPending}
                          className="text-base"
                        >
                          {openPortal.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <ExternalLink className="w-4 h-4 mr-2" />
                          )}
                          Gerir pagamento
                        </Button>
                      )}
                    </TabsContent>

                    {/* VISITS */}
                    <TabsContent value="visits" className="pt-6">
                      {visits.length === 0 ? (
                        <p className="text-muted-foreground text-base py-6 text-center">
                          Ainda não há visitas registadas. Receberá um email assim que a primeira for concluída.
                        </p>
                      ) : (
                        <ol className="space-y-6">
                          {visits.map((v: any) => (
                            <li key={v.id} className="border-l-2 border-primary/40 pl-4">
                              <p className="font-medium text-lg">
                                {v.completed_at
                                  ? format(new Date(v.completed_at), "d 'de' MMMM 'de' yyyy", { locale: pt })
                                  : "Visita agendada"}
                              </p>
                              {v.technician_notes && (
                                <p className="text-muted-foreground mt-1">{v.technician_notes}</p>
                              )}
                              {v.service_task_media?.length > 0 && (
                                <div className="flex gap-3 flex-wrap mt-3">
                                  {v.service_task_media.map((m: any) => (
                                    <a
                                      key={m.id}
                                      href={m.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block w-28 h-28 rounded-lg overflow-hidden border relative hover:opacity-90"
                                    >
                                      <img src={m.file_url} alt={m.type} className="w-full h-full object-cover" />
                                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs text-center py-1">
                                        {m.type === "before" ? "Antes" : m.type === "after" ? "Depois" : ""}
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </li>
                          ))}
                        </ol>
                      )}
                    </TabsContent>

                    {/* INVOICES */}
                    <TabsContent value="invoices" className="pt-6">
                      {!MOLONI_ENABLED ? (
                        <div className="text-center py-8 space-y-2">
                          <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
                          <p className="text-lg font-medium">Em breve</p>
                          <p className="text-muted-foreground text-base">
                            As suas faturas estarão disponíveis aqui muito em breve.
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Sem faturas a apresentar.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}

            <div className="text-center pt-2">
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/care/aderir">
                  <Plus className="w-5 h-5 mr-2" /> Adicionar outra campa
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Contact card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-lg font-medium">Precisa de ajuda?</p>
              <p className="text-muted-foreground">A nossa equipa fala consigo em português, sem pressas.</p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="lg" variant="default" className="text-base">
                <a href="tel:+351210000000">
                  <Phone className="w-5 h-5 mr-2" /> 21 000 00 00
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
      <span className="text-muted-foreground sm:w-44 text-sm">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}