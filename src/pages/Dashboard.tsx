import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, FileText, Calendar, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    name: "Obituários Ativos",
    value: "24",
    icon: FileText,
    change: "+3 este mês",
    changeType: "positive",
  },
  {
    name: "Cerimónias Agendadas",
    value: "8",
    icon: Calendar,
    change: "Próximos 7 dias",
    changeType: "neutral",
  },
  {
    name: "Clientes Registados",
    value: "156",
    icon: Users,
    change: "+12 este mês",
    changeType: "positive",
  },
  {
    name: "Taxa de Satisfação",
    value: "98%",
    icon: TrendingUp,
    change: "+2% vs. anterior",
    changeType: "positive",
  },
];

const recentObituaries = [
  {
    id: 1,
    name: "Maria Silva Santos",
    date: "15/01/2025",
    ceremony: "17/01/2025 - 10:00",
    status: "active",
  },
  {
    id: 2,
    name: "João Pedro Costa",
    date: "14/01/2025",
    ceremony: "16/01/2025 - 15:00",
    status: "active",
  },
  {
    id: 3,
    name: "Ana Beatriz Oliveira",
    date: "13/01/2025",
    ceremony: "15/01/2025 - 11:00",
    status: "completed",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-archivo font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao sistema Memoralis
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => navigate("/obituaries/new")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Obituário
        </Button>
      </div>

      {/* Quick Search */}
      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Pesquisar por nome, família ou cerimónia..."
            className="pl-10"
          />
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-3xl font-archivo font-bold text-foreground mt-2">
                  {stat.value}
                </p>
                <p
                  className={`text-xs mt-2 ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Obituaries */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-archivo font-semibold text-foreground">
            Obituários Recentes
          </h2>
          <Button variant="ghost" size="sm">
            Ver Todos
          </Button>
        </div>
        <div className="space-y-4">
          {recentObituaries.map((obituary) => (
            <div
              key={obituary.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div>
                <h3 className="font-medium text-foreground">{obituary.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Falecimento: {obituary.date}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-foreground">
                  Cerimónia: {obituary.ceremony}
                </p>
                <span
                  className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                    obituary.status === "active"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {obituary.status === "active" ? "Ativo" : "Concluído"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
