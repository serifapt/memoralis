import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, User, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const clients = [
  {
    id: 1,
    name: "Carlos Santos",
    relationship: "Filho",
    deceased: "Maria Silva Santos",
    phone: "+351 912 345 678",
    email: "carlos.santos@email.pt",
    obituaryId: 1,
  },
  {
    id: 2,
    name: "Rita Costa",
    relationship: "Esposa",
    deceased: "João Pedro Costa",
    phone: "+351 923 456 789",
    email: "rita.costa@email.pt",
    obituaryId: 2,
  },
];

export default function Clients() {
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
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Pesquisar por nome, telefone ou email..."
            className="pl-10"
          />
        </div>
      </Card>

      {/* Clients List */}
      <div className="space-y-4">
        {clients.map((client) => (
          <Card key={client.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-archivo font-semibold text-foreground">
                      {client.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {client.relationship} de {client.deceased}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/obituaries/${client.obituaryId}#informacao-familia`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{client.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
