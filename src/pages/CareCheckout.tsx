import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Loader2, MapPin, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  useCustomerProfile, 
  useMemorialLocations, 
  useCreateCustomerProfile,
  useCreateMemorialLocation,
  useCreateCareCheckout
} from "@/hooks/useCareService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CareCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planPriceId = searchParams.get('plan');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  
  // Location form
  const [locationForm, setLocationForm] = useState({
    cemetery_name: '',
    cemetery_address: '',
    section: '',
    grave_number: '',
    notes: ''
  });

  const { data: customer, isLoading: loadingCustomer, refetch: refetchCustomer } = useCustomerProfile();
  const { data: locations, isLoading: loadingLocations } = useMemorialLocations(customer?.id);
  
  const createProfile = useCreateCustomerProfile();
  const createLocation = useCreateMemorialLocation();
  const createCheckout = useCreateCareCheckout();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user?.email) {
        setProfileForm(prev => ({ ...prev, email: session.user.email || '' }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!planPriceId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Plano não selecionado</CardTitle>
            <CardDescription>Por favor selecione um plano primeiro.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/care/plans">Ver Planos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthenticated === null || loadingCustomer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Autenticação Necessária</CardTitle>
            <CardDescription>
              Para continuar com a subscrição, precisa de criar uma conta ou entrar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to={`/care/auth?redirect=/care/checkout?plan=${planPriceId}`}>
                Entrar ou Registar
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/care/plans">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar aos Planos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Create customer profile
  if (!customer) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-md mx-auto">
          <Link to="/care/plans" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar aos Planos
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Complete o Seu Perfil</CardTitle>
              <CardDescription>
                Precisamos de alguns dados para continuar com a sua subscrição.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsCreatingProfile(true);
                  await createProfile.mutateAsync(profileForm);
                  refetchCustomer();
                  setIsCreatingProfile(false);
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isCreatingProfile}>
                  {isCreatingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Continuar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 3: Select or create memorial location
  const handleCheckout = async () => {
    if (!selectedLocation || !planPriceId) return;
    
    await createCheckout.mutateAsync({
      care_plan_price_id: planPriceId,
      memorial_location_id: selectedLocation
    });
  };

  const handleAddLocation = async () => {
    if (!customer?.id) return;
    
    setIsAddingLocation(true);
    await createLocation.mutateAsync({
      customer_id: customer.id,
      cemetery_name: locationForm.cemetery_name,
      cemetery_address: locationForm.cemetery_address || undefined,
      section: locationForm.section || undefined,
      grave_number: locationForm.grave_number || undefined,
      notes: locationForm.notes || undefined
    });
    setLocationForm({ cemetery_name: '', cemetery_address: '', section: '', grave_number: '', notes: '' });
    setIsAddingLocation(false);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/care/plans" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar aos Planos
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Selecione o Local Memorial</CardTitle>
            <CardDescription>
              Escolha ou adicione a campa que deseja incluir na sua subscrição.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingLocations ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <>
                {locations && locations.length > 0 && (
                  <div className="space-y-3">
                    {locations.map((loc) => (
                      <div
                        key={loc.id}
                        onClick={() => setSelectedLocation(loc.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedLocation === loc.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-muted-foreground/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
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
                      </div>
                    ))}
                  </div>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Novo Local
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Local Memorial</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddLocation(); }} className="space-y-4">
                      <div>
                        <Label htmlFor="cemetery_name">Nome do Cemitério *</Label>
                        <Input
                          id="cemetery_name"
                          value={locationForm.cemetery_name}
                          onChange={(e) => setLocationForm(prev => ({ ...prev, cemetery_name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cemetery_address">Morada</Label>
                        <Input
                          id="cemetery_address"
                          value={locationForm.cemetery_address}
                          onChange={(e) => setLocationForm(prev => ({ ...prev, cemetery_address: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="section">Secção</Label>
                          <Input
                            id="section"
                            value={locationForm.section}
                            onChange={(e) => setLocationForm(prev => ({ ...prev, section: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="grave_number">Nº Campa</Label>
                          <Input
                            id="grave_number"
                            value={locationForm.grave_number}
                            onChange={(e) => setLocationForm(prev => ({ ...prev, grave_number: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notas</Label>
                        <Textarea
                          id="notes"
                          value={locationForm.notes}
                          onChange={(e) => setLocationForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Informações adicionais para localizar a campa..."
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isAddingLocation}>
                        {isAddingLocation && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Adicionar
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}

            <Button 
              onClick={handleCheckout} 
              className="w-full" 
              size="lg"
              disabled={!selectedLocation || createCheckout.isPending}
            >
              {createCheckout.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Continuar para Pagamento
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
