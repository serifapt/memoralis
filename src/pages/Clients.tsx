import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  FileText,
  Receipt,
  MoreVertical,
  Pencil,
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useClients, Client } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState as useStateHook } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ClientWithRelations extends Client {
  obituaries?: { id: string; display_name: string }[];
  quotes?: { id: string; quote_number: number; status: string }[];
}

export default function Clients() {
  const { clients, loading, createClient, updateClient, deleteClient } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientWithRelations | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newClientDialogOpen, setNewClientDialogOpen] = useState(false);
  const [clientRelations, setClientRelations] = useState<{ obituaries: any[]; quotes: any[] }>({ obituaries: [], quotes: [] });
  
  const [formData, setFormData] = useState({
    full_name: "",
    relationship_degree: "",
    email: "",
    phone: "",
    nif: "",
    niss: "",
    nationality_place: "",
    iban: "",
    address: "",
    city: "",
    postal_code: "",
    notes: "",
  });

  const filteredClients = clients.filter(client => 
    searchQuery === "" ||
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone?.includes(searchQuery) ||
    client.nif?.includes(searchQuery)
  );

  const loadClientRelations = async (clientId: string) => {
    // Load obituaries where this client is responsible
    const { data: obituaries } = await supabase
      .from("obituaries")
      .select("id, display_name")
      .eq("responsible_client_id", clientId);

    // Load quotes for this client
    const { data: quotes } = await supabase
      .from("budget_quotes")
      .select("id, quote_number, status")
      .eq("client_id", clientId);

    setClientRelations({
      obituaries: obituaries || [],
      quotes: quotes || [],
    });
  };

  const handleViewClient = async (client: Client) => {
    setSelectedClient(client);
    await loadClientRelations(client.id);
    setDetailDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      full_name: client.full_name,
      relationship_degree: client.relationship_degree || "",
      email: client.email || "",
      phone: client.phone || "",
      nif: client.nif || "",
      niss: client.niss || "",
      nationality_place: client.nationality_place || "",
      iban: client.iban || "",
      address: client.address || "",
      city: client.city || "",
      postal_code: client.postal_code || "",
      notes: client.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveClient = async () => {
    if (selectedClient) {
      await updateClient(selectedClient.id, formData);
    } else {
      await createClient(formData);
    }
    setEditDialogOpen(false);
    setNewClientDialogOpen(false);
    resetForm();
  };

  const handleDeleteClient = async () => {
    if (selectedClient) {
      await deleteClient(selectedClient.id);
      setDeleteDialogOpen(false);
      setSelectedClient(null);
    }
  };

  const handleNewClient = () => {
    setSelectedClient(null);
    resetForm();
    setNewClientDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      relationship_degree: "",
      email: "",
      phone: "",
      nif: "",
      niss: "",
      nationality_place: "",
      iban: "",
      address: "",
      city: "",
      postal_code: "",
      notes: "",
    });
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-archivo font-bold text-foreground">
            Clientes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão de famílias e contactos
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleNewClient}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Pesquisar por nome, telefone, email ou NIF..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Clients List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">A carregar...</div>
        </div>
      ) : filteredClients.length === 0 ? (
        <Card className="p-12 text-center">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Tente outra pesquisa" : "Adicione o seu primeiro cliente"}
          </p>
          {!searchQuery && (
            <Button onClick={handleNewClient}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-archivo font-semibold text-foreground">
                        {client.full_name}
                      </h3>
                      {client.relationship_degree && (
                        <p className="text-sm text-muted-foreground">
                          {client.relationship_degree}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewClient(client)}>
                        Ver Detalhes
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClient(client)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setSelectedClient(client);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{client.email}</span>
                      </div>
                    )}
                    {client.nif && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>NIF: {client.nif}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Client Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedClient?.full_name}</DialogTitle>
            <DialogDescription>Informações do cliente</DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {selectedClient.email && (
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{selectedClient.email}</p>
                  </div>
                )}
                {selectedClient.phone && (
                  <div>
                    <Label className="text-muted-foreground">Telefone</Label>
                    <p>{selectedClient.phone}</p>
                  </div>
                )}
                {selectedClient.nif && (
                  <div>
                    <Label className="text-muted-foreground">NIF</Label>
                    <p>{selectedClient.nif}</p>
                  </div>
                )}
                {selectedClient.niss && (
                  <div>
                    <Label className="text-muted-foreground">NISS</Label>
                    <p>{selectedClient.niss}</p>
                  </div>
                )}
                {selectedClient.iban && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">IBAN</Label>
                    <p>{selectedClient.iban}</p>
                  </div>
                )}
                {(selectedClient.address || selectedClient.city) && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Morada</Label>
                    <p>
                      {[selectedClient.address, selectedClient.city, selectedClient.postal_code]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
              </div>

              {/* Related Obituaries */}
              {clientRelations.obituaries.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Processos de Óbito
                  </h3>
                  <div className="space-y-2">
                    {clientRelations.obituaries.map((obit) => (
                      <Link 
                        key={obit.id} 
                        to={`/obituaries/${obit.id}/edit`}
                        className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      >
                        {obit.display_name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Quotes */}
              {clientRelations.quotes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Orçamentos
                  </h3>
                  <div className="space-y-2">
                    {clientRelations.quotes.map((quote) => (
                      <Link 
                        key={quote.id} 
                        to={`/budgets/${quote.id}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <span>Orçamento #{quote.quote_number}</span>
                        <Badge variant="outline">{quote.status}</Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/New Client Dialog */}
      <Dialog open={editDialogOpen || newClientDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEditDialogOpen(false);
          setNewClientDialogOpen(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedClient ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {selectedClient ? "Atualize os dados do cliente" : "Preencha os dados do novo cliente"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship_degree">Grau de Parentesco</Label>
                <Input
                  id="relationship_degree"
                  value={formData.relationship_degree}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationship_degree: e.target.value }))}
                  placeholder="Filho, Esposa..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.pt"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+351 912 345 678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nif">NIF</Label>
                <Input
                  id="nif"
                  value={formData.nif}
                  onChange={(e) => setFormData(prev => ({ ...prev, nif: e.target.value }))}
                  placeholder="123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="niss">NISS</Label>
                <Input
                  id="niss"
                  value={formData.niss}
                  onChange={(e) => setFormData(prev => ({ ...prev, niss: e.target.value }))}
                  placeholder="Número Seg. Social"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality_place">Naturalidade</Label>
                <Input
                  id="nationality_place"
                  value={formData.nationality_place}
                  onChange={(e) => setFormData(prev => ({ ...prev, nationality_place: e.target.value }))}
                  placeholder="Local de nascimento"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                  placeholder="PT50..."
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Morada</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Rua, número..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Localidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Código Postal</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                  placeholder="1234-567"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notas adicionais..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false);
              setNewClientDialogOpen(false);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveClient} disabled={!formData.full_name.trim()}>
              {selectedClient ? "Guardar" : "Criar Cliente"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser revertida. O cliente "{selectedClient?.full_name}" será permanentemente eliminado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
