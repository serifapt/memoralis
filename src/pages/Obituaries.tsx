import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, Eye, Edit, Download } from "lucide-react";

const obituaries = [
  {
    id: 1,
    name: "Maria Silva Santos",
    birthDate: "12/03/1945",
    deathDate: "15/01/2025",
    ceremony: "17/01/2025 - 10:00",
    location: "Capela São João",
    photo: "/placeholder.svg",
  },
  {
    id: 2,
    name: "João Pedro Costa",
    birthDate: "28/07/1958",
    deathDate: "14/01/2025",
    ceremony: "16/01/2025 - 15:00",
    location: "Igreja Nossa Senhora",
    photo: "/placeholder.svg",
  },
];

export default function Obituaries() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-archivo font-bold text-foreground">
            Obituários
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerir e publicar obituários
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Criar Obituário
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Pesquisar por nome..."
            className="pl-10"
          />
        </div>
      </Card>

      {/* Obituaries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {obituaries.map((obituary) => (
          <Card key={obituary.id} className="overflow-hidden">
            <div className="p-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-archivo font-semibold text-foreground">
                    {obituary.name}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>✝ {obituary.birthDate} - {obituary.deathDate}</p>
                    <p>📍 {obituary.location}</p>
                    <p>🕐 {obituary.ceremony}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
