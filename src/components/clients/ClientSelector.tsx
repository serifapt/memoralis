import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClients, Client, ClientFormData } from "@/hooks/useClients";

interface ClientSelectorProps {
  value?: string;
  onChange: (clientId: string, client: Client) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ClientSelector({ value, onChange, placeholder = "Selecionar cliente...", disabled }: ClientSelectorProps) {
  const { clients, searchClients, createClient } = useClients();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClientData, setNewClientData] = useState<ClientFormData>({
    full_name: "",
    email: "",
    phone: "",
    nif: "",
    niss: "",
    relationship_degree: "",
    birth_date: "",
    nationality_place: "",
    iban: "",
    address: "",
    city: "",
    postal_code: "",
    notes: "",
  });

  useEffect(() => {
    if (value) {
      const client = clients.find(c => c.id === value);
      if (client) setSelectedClient(client);
    }
  }, [value, clients]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        const results = await searchClients(searchQuery);
        setSearchResults(results);
      } else {
        setSearchResults(clients.slice(0, 10));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, clients, searchClients]);

  const handleSelect = (client: Client) => {
    setSelectedClient(client);
    onChange(client.id, client);
    setOpen(false);
  };

  const handleCreateClient = async () => {
    if (!newClientData.full_name.trim()) return;
    const client = await createClient(newClientData);
    if (client) {
      handleSelect(client);
      setDialogOpen(false);
      setNewClientData({
        full_name: "", email: "", phone: "", nif: "", niss: "",
        relationship_degree: "", birth_date: "", nationality_place: "",
        iban: "", address: "", city: "", postal_code: "", notes: "",
      });
    }
  };

  const updateField = (field: keyof ClientFormData, value: string) => {
    setNewClientData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedClient ? (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{selectedClient.full_name}</span>
                {selectedClient.nif && (
                  <span className="text-muted-foreground text-xs">({selectedClient.nif})</span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder="Pesquisar cliente..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
              <CommandGroup>
                {(searchQuery.length >= 2 ? searchResults : clients.slice(0, 10)).map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.id}
                    onSelect={() => handleSelect(client)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedClient?.id === client.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{client.full_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {[client.email, client.phone, client.nif].filter(Boolean).join(" • ")}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" disabled={disabled}>
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Crie um novo cliente para associar ao orçamento
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="client-name">Nome Completo *</Label>
                <Input
                  id="client-name"
                  value={newClientData.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  placeholder="Nome do cliente"
                />
              </div>

              {/* Email | Telefone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={newClientData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="email@exemplo.pt"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-phone">Telefone</Label>
                  <Input
                    id="client-phone"
                    value={newClientData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+351 912 345 678"
                  />
                </div>
              </div>

              {/* NIF | NISS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-nif">NIF</Label>
                  <Input
                    id="client-nif"
                    value={newClientData.nif}
                    onChange={(e) => updateField("nif", e.target.value)}
                    placeholder="123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-niss">NISS</Label>
                  <Input
                    id="client-niss"
                    value={newClientData.niss}
                    onChange={(e) => updateField("niss", e.target.value)}
                    placeholder="12345678901"
                  />
                </div>
              </div>

              {/* Grau Parentesco | Data de Nascimento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-relationship">Grau Parentesco</Label>
                  <Input
                    id="client-relationship"
                    value={newClientData.relationship_degree}
                    onChange={(e) => updateField("relationship_degree", e.target.value)}
                    placeholder="Filho, Esposa..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-birth-date">Data de Nascimento</Label>
                  <Input
                    id="client-birth-date"
                    type="date"
                    value={newClientData.birth_date}
                    onChange={(e) => updateField("birth_date", e.target.value)}
                  />
                </div>
              </div>

              {/* Nacionalidade/Naturalidade | IBAN */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-nationality">Nacionalidade/Naturalidade</Label>
                  <Input
                    id="client-nationality"
                    value={newClientData.nationality_place}
                    onChange={(e) => updateField("nationality_place", e.target.value)}
                    placeholder="Portuguesa, Lisboa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-iban">IBAN</Label>
                  <Input
                    id="client-iban"
                    value={newClientData.iban}
                    onChange={(e) => updateField("iban", e.target.value)}
                    placeholder="PT50..."
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="client-address">Endereço</Label>
                <Input
                  id="client-address"
                  value={newClientData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Rua, número, andar"
                />
              </div>

              {/* Localidade | Código Postal */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-city">Localidade</Label>
                  <Input
                    id="client-city"
                    value={newClientData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Lisboa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-postal-code">Código Postal</Label>
                  <Input
                    id="client-postal-code"
                    value={newClientData.postal_code}
                    onChange={(e) => updateField("postal_code", e.target.value)}
                    placeholder="1000-001"
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="client-notes">Notas</Label>
                <Textarea
                  id="client-notes"
                  value={newClientData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateClient} disabled={!newClientData.full_name.trim()}>
              Criar Cliente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
