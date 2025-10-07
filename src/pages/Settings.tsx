import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Palette, Users, Bell } from "lucide-react";

export default function Settings() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-archivo font-bold text-foreground">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerir preferências e dados da empresa
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">
            <Building2 className="w-4 h-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="w-4 h-4 mr-2" />
            Marca
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Utilizadores
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card className="p-6">
            <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">
              Informações da Empresa
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input id="company-name" placeholder="Casa Funerária..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input id="nif" placeholder="000000000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Morada</Label>
                <Input id="address" placeholder="Rua..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" placeholder="+351..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="contacto@..." />
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                Guardar Alterações
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card className="p-6">
            <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">
              Personalização da Marca
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Logótipo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Arraste o logótipo ou clique para selecionar
                  </p>
                  <Button variant="outline" className="mt-4">
                    Selecionar Ficheiro
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor Principal</Label>
                <div className="flex gap-4 items-center">
                  <Input
                    type="color"
                    defaultValue="#968550"
                    className="w-20 h-10"
                  />
                  <span className="text-sm text-muted-foreground">#968550</span>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                Guardar Alterações
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-archivo font-semibold text-foreground">
                Utilizadores do Sistema
              </h3>
              <Button variant="outline">Adicionar Utilizador</Button>
            </div>
            <div className="space-y-3">
              {["admin@memoralis.pt", "gestor@memoralis.pt"].map((email, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{email}</p>
                    <p className="text-xs text-muted-foreground">
                      {i === 0 ? "Administrador" : "Gestor"}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">
              Preferências de Notificações
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configurações de notificações serão implementadas em breve.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
