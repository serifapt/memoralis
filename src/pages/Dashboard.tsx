import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText, Calendar, Users, TrendingUp, CheckCircle2, Clock, MapPin, Eye, MessageCircle, Flame, Image as ImageIcon } from "lucide-react";
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
    birthYear: "1945",
    deathYear: "2025",
    age: 80,
    location: "Lisboa - São Domingos de Benfica",
    agency: "Funerária S. João",
    type: "Funeral",
    views: 456,
    condolences: 12,
    candles: 8,
  },
  {
    id: 2,
    name: "João Pedro Costa",
    birthYear: "1960",
    deathYear: "2025",
    age: 65,
    location: "Porto - Matosinhos",
    agency: "Funerária S. João",
    type: "Missa",
    views: 342,
    condolences: 8,
    candles: 5,
  },
  {
    id: 3,
    name: "Ana Beatriz Oliveira",
    birthYear: "1978",
    deathYear: "2025",
    age: 47,
    location: "Braga - São Vicente",
    agency: "Funerária S. João",
    type: "Velório",
    views: 289,
    condolences: 6,
    candles: 3,
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

      {/* Recent Obituaries */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-archivo font-semibold text-foreground">
              Obituários Recentes
            </h2>
          </div>
          <Button variant="ghost" size="sm">
            Ver Todos
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recentObituaries.map((obituary) => (
            <Card key={obituary.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-archivo font-semibold text-foreground">
                      {obituary.name}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>✝ {obituary.birthYear} - {obituary.deathYear} | {obituary.age} Anos</p>
                      <p>📍 {obituary.location}</p>
                      <p className="text-xs">{obituary.agency}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Condolências
                  </Button>
                  <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                    Enviar Flores
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Two Column Layout for Completed Processes and Upcoming Ceremonies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upcoming Ceremonies */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-archivo font-semibold text-foreground">
                Próximas Cerimónias
              </h2>
            </div>
            <Button variant="ghost" size="sm">
              Ver Todos
            </Button>
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

        {/* Completed Processes */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-archivo font-semibold text-foreground">
                Processos Concluídos
              </h2>
            </div>
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

    </div>
  );
}
