import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Building2, Palette, Users, Bell, Flower, Loader2 } from "lucide-react";
import { useFlowerService } from "@/hooks/useFlowerService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CompanyData {
  nome_comercial: string;
  nif: string;
  telefone: string;
  email: string;
  morada: string;
}

export default function Settings() {
  const { isFlowerServiceActive, funerariaId, toggleFlowerService } = useFlowerService();
  const [companyData, setCompanyData] = useState<CompanyData>({
    nome_comercial: "", nif: "", telefone: "", email: "", morada: "",
  });
  const [saving, setSaving] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(true);

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("funerarias")
        .select("nome_comercial, nif, telefone, email, morada")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setCompanyData({
          nome_comercial: data.nome_comercial || "",
          nif: data.nif || "",
          telefone: data.telefone || "",
          email: data.email || "",
          morada: data.morada || "",
        });
      }
    } catch (err) {
      console.error("Error loading company data:", err);
    } finally {
      setLoadingCompany(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!funerariaId) {
      toast.error("Funerária não encontrada");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("funerarias")
        .update({
          nome_comercial: companyData.nome_comercial,
          nif: companyData.nif,
          telefone: companyData.telefone,
          email: companyData.email,
          morada: companyData.morada,
        })
        .eq("id", funerariaId);

      if (error) throw error;
      toast.success("Dados da empresa guardados com sucesso");
    } catch (err) {
      console.error("Error saving:", err);
      toast.error("Erro ao guardar os dados");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFlowerService = async () => {
    const success = await toggleFlowerService();
    if (success) {
      toast.success(isFlowerServiceActive ? "Serviço de flores desativado" : "Serviço de flores ativado");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-archivo font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerir preferências e dados da empresa</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company"><Building2 className="w-4 h-4 mr-2" />Empresa</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="w-4 h-4 mr-2" />Marca</TabsTrigger>
          <TabsTrigger value="services"><Flower className="w-4 h-4 mr-2" />Serviços</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Utilizadores</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card className="p-6">
            <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">Informações da Empresa</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input
                    id="company-name"
                    value={companyData.nome_comercial}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, nome_comercial: e.target.value }))}
                    placeholder="Casa Funerária..."
                    disabled={loadingCompany}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input
                    id="nif"
                    value={companyData.nif}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, nif: e.target.value }))}
                    placeholder="000000000"
                    disabled={loadingCompany}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Morada</Label>
                <Input
                  id="address"
                  value={companyData.morada}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, morada: e.target.value }))}
                  placeholder="Rua..."
                  disabled={loadingCompany}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={companyData.telefone}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="+351..."
                    disabled={loadingCompany}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contacto@..."
                    disabled={loadingCompany}
                  />
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleSaveCompany} disabled={saving || loadingCompany}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Guardar Alterações
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card className="p-6">
            <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">Personalização da Marca</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Logótipo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">Arraste o logótipo ou clique para selecionar</p>
                  <Button variant="outline" className="mt-4">Selecionar Ficheiro</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor Principal</Label>
                <div className="flex gap-4 items-center">
                  <Input type="color" defaultValue="#968550" className="w-20 h-10" />
                  <span className="text-sm text-muted-foreground">#968550</span>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90">Guardar Alterações</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card className="p-6">
            <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">Serviços Opcionais</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Flower className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Catálogo de Flores</p>
                    <p className="text-sm text-muted-foreground">Permita que visitantes enviem flores para os funerais</p>
                  </div>
                </div>
                <Switch checked={isFlowerServiceActive} onCheckedChange={handleToggleFlowerService} disabled={!funerariaId} />
              </div>
              {isFlowerServiceActive && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    O serviço de flores está ativo. Aceda ao <strong>Catálogo de Flores</strong> no menu lateral para gerir os seus produtos.
                  </p>
                </div>
              )}
              {!funerariaId && (
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <p className="text-sm text-destructive">Não foi possível carregar os dados da funerária. Por favor, recarregue a página.</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-archivo font-semibold text-foreground">Utilizadores do Sistema</h3>
              <Button variant="outline">Adicionar Utilizador</Button>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Gestão de utilizadores será implementada em breve.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">Preferências de Notificações</h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Configurações de notificações serão implementadas em breve.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
