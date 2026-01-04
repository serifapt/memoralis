import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Loader2, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Settings,
  LogOut,
  Plus,
  ExternalLink,
  Image
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  useCustomerProfile, 
  useMemorialLocations, 
  useCareSubscriptions,
  useOpenCustomerPortal
} from "@/hooks/useCareService";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const { data: customer, isLoading: loadingCustomer } = useCustomerProfile();
  const { data: locations } = useMemorialLocations(customer?.id);
  const { data: subscriptions, isLoading: loadingSubscriptions } = useCareSubscriptions(customer?.id);
  const openPortal = useOpenCustomerPortal();

  // Get service history for customer
  const { data: serviceHistory } = useQuery({
    queryKey: ['service-history', customer?.id],
    queryFn: async () => {
      if (!customer?.id) return [];
      
      const { data, error } = await supabase
        .from('service_tasks')
        .select(`
          *,
          care_subscriptions!inner (
            customer_id,
            care_plans (name),
            memorial_locations (cemetery_name, grave_number)
          ),
          service_task_media (id, type, file_url)
        `)
        .eq('care_subscriptions.customer_id', customer.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!customer?.id
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (!session) {
        navigate('/care/auth?redirect=/account/care');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        navigate('/care/auth?redirect=/account/care');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/care');
  };

  if (isAuthenticated === null || loadingCustomer) {
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
            <CardTitle>Perfil Incompleto</CardTitle>
            <CardDescription>
              Complete a sua subscrição para aceder ao dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/care/plans">Escolher Plano</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "Ativo", variant: "default" },
      trialing: { label: "Período de Teste", variant: "secondary" },
      past_due: { label: "Pagamento Pendente", variant: "destructive" },
      canceled: { label: "Cancelado", variant: "outline" },
      paused: { label: "Pausado", variant: "secondary" }
    };
    const s = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/care" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="font-semibold">Cuidado & Homenagem</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {customer.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">A Minha Conta</h1>

        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subscription">
              <CreditCard className="w-4 h-4 mr-2" />
              Subscrição
            </TabsTrigger>
            <TabsTrigger value="locations">
              <MapPin className="w-4 h-4 mr-2" />
              Locais
            </TabsTrigger>
            <TabsTrigger value="history">
              <Calendar className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Definições
            </TabsTrigger>
          </TabsList>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <div className="grid gap-6">
              {loadingSubscriptions ? (
                <Card>
                  <CardContent className="py-8 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </CardContent>
                </Card>
              ) : subscriptions && subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <Card key={sub.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {sub.care_plans?.name || 'Plano'}
                            {getStatusBadge(sub.status)}
                          </CardTitle>
                          <CardDescription>
                            {sub.memorial_locations?.cemetery_name}
                            {sub.memorial_locations?.grave_number && 
                              ` • Campa ${sub.memorial_locations.grave_number}`
                            }
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-6 text-sm">
                          <div>
                            <p className="text-muted-foreground">Periodicidade</p>
                            <p className="font-medium">
                              {sub.billing_period === 'monthly' ? 'Mensal' : 'Anual'}
                            </p>
                          </div>
                          {sub.current_period_end && (
                            <div>
                              <p className="text-muted-foreground">Próxima Cobrança</p>
                              <p className="font-medium">
                                {format(new Date(sub.current_period_end), "d 'de' MMMM, yyyy", { locale: pt })}
                              </p>
                            </div>
                          )}
                          {sub.cancel_at_period_end && (
                            <Badge variant="outline">Cancelamento agendado</Badge>
                          )}
                        </div>

                        <Separator />

                        <Button 
                          variant="outline" 
                          onClick={() => openPortal.mutate()}
                          disabled={openPortal.isPending}
                        >
                          {openPortal.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <ExternalLink className="w-4 h-4 mr-2" />
                          )}
                          Gerir Subscrição
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      Ainda não tem uma subscrição ativa.
                    </p>
                    <Button asChild>
                      <Link to="/care/plans">Escolher Plano</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Locais Memoriais</CardTitle>
                  <CardDescription>
                    Gerir os locais associados às suas subscrições
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/care/checkout?plan=new">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {locations && locations.length > 0 ? (
                  <div className="space-y-4">
                    {locations.map((loc) => (
                      <div key={loc.id} className="flex items-start gap-3 p-4 border rounded-lg">
                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{loc.cemetery_name}</p>
                          {loc.grave_number && (
                            <p className="text-sm text-muted-foreground">
                              Campa: {loc.grave_number}
                              {loc.section && ` • Secção: ${loc.section}`}
                            </p>
                          )}
                          {loc.cemetery_address && (
                            <p className="text-sm text-muted-foreground">{loc.cemetery_address}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum local registado.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Serviços</CardTitle>
                <CardDescription>
                  Visualize os serviços realizados e as fotografias
                </CardDescription>
              </CardHeader>
              <CardContent>
                {serviceHistory && serviceHistory.length > 0 ? (
                  <div className="space-y-4">
                    {serviceHistory.map((task: any) => (
                      <div key={task.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium">
                              {task.care_subscriptions?.care_plans?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {task.care_subscriptions?.memorial_locations?.cemetery_name}
                              {task.care_subscriptions?.memorial_locations?.grave_number &&
                                ` • Campa ${task.care_subscriptions.memorial_locations.grave_number}`
                              }
                            </p>
                          </div>
                          <Badge variant="outline">
                            {task.completed_at && 
                              format(new Date(task.completed_at), "d MMM yyyy", { locale: pt })
                            }
                          </Badge>
                        </div>
                        
                        {task.technician_notes && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {task.technician_notes}
                          </p>
                        )}

                        {task.service_task_media && task.service_task_media.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {task.service_task_media.map((media: any) => (
                              <a 
                                key={media.id}
                                href={media.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative w-20 h-20 rounded overflow-hidden border hover:opacity-80 transition-opacity"
                              >
                                <img 
                                  src={media.file_url} 
                                  alt={media.type}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5">
                                  {media.type === 'before' ? 'Antes' : media.type === 'after' ? 'Depois' : 'Outro'}
                                </span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Ainda não há serviços concluídos.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Definições da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Nome</Label>
                  <p className="font-medium">{customer.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{customer.email}</p>
                </div>
                {customer.phone && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Telefone</Label>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={className}>{children}</p>;
}
