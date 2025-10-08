import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText, Calendar, Users, TrendingUp, CheckCircle2, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    name: "Processos Ativos",
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
    name: "Processos Concluídos",
    value: "156",
    icon: Users,
    change: "+12 este mês",
    changeType: "positive",
  },
  {
    name: "Novos Processos",
    value: "98%",
    icon: TrendingUp,
    change: "+2% vs. anterior",
    changeType: "positive",
  },
];

const upcomingCeremonies = [
  {
    id: 1,
    name: "Maria Silva Santos",
    day: "17",
    month: "JAN",
    time: "10:00",
    type: "Velório",
    typeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    location: "Capela São João",
    participants: 45,
  },
  {
    id: 2,
    name: "João Pedro Costa",
    day: "16",
    month: "JAN",
    time: "15:00",
    type: "Missa",
    typeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    location: "Igreja Nossa Senhora",
    participants: 32,
  },
  {
    id: 3,
    name: "Ana Beatriz Oliveira",
    day: "15",
    month: "JAN",
    time: "11:00",
    type: "Sepultamento",
    typeColor: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    location: "Cemitério Municipal",
    participants: 28,
  },
];

const completedProcesses = [
  {
    id: 1,
    name: "António Manuel Ferreira",
    date: "10/01/2025",
    paymentDate: "12/01/2025",
    amount: "3.500€",
  },
  {
    id: 2,
    name: "Rosa Maria Gonçalves",
    date: "08/01/2025",
    paymentDate: "10/01/2025",
    amount: "4.200€",
  },
  {
    id: 3,
    name: "Carlos Alberto Sousa",
    date: "05/01/2025",
    paymentDate: "07/01/2025",
    amount: "3.800€",
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
    status: "active",
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
            Funerária S. João
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao Sistema de Gestão Funerária da Memoralis
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

      {/* Two Column Layout for Recent Obituaries and Completed Processes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Completed Processes */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-archivo font-semibold text-foreground">
              Processos Concluídos
            </h2>
            <Button variant="ghost" size="sm">
              Ver Todos
            </Button>
          </div>
          <div className="space-y-4">
            {completedProcesses.map((process) => (
              <div
                key={process.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{process.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Falecimento: {process.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {process.amount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pago em: {process.paymentDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Upcoming Ceremonies - Left Column Only */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-archivo font-semibold text-foreground">
              Próximas Cerimónias
            </h2>
          </div>
          <div className="space-y-4">
            {upcomingCeremonies.map((ceremony) => (
              <div
                key={ceremony.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary/10">
                    <span className="text-2xl font-archivo font-bold text-primary">
                      {ceremony.day}
                    </span>
                    <span className="text-xs text-primary font-medium">
                      {ceremony.month}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">{ceremony.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ceremony.time}
                      </div>
                      <Badge className={ceremony.typeColor}>
                        {ceremony.type}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ceremony.location}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {ceremony.participants} participantes
                  </span>
                  <Button variant="outline" size="sm">
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
