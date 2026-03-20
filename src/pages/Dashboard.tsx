import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText, Calendar, Users, TrendingUp, CheckCircle2, Clock, MapPin, GripVertical, Mail, Star, MessageSquareQuote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChatButton } from "@/components/chat/ChatButton";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationBell } from "@/components/layout/NotificationBell";

interface DashboardStats {
  activeProcesses: number;
  scheduledCeremonies: number;
  completedProcesses: number;
  thisMonthNew: number;
}

interface RecentObituary {
  id: string;
  display_name: string;
  death_date: string | null;
  is_completed: boolean;
  created_at: string;
  nextCeremony?: { event_date: string; event_time: string; event_type: string } | null;
}

interface UpcomingCeremony {
  id: string;
  event_type: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  obituary: { display_name: string; id: string } | null;
}

interface ActiveProcess {
  id: string;
  display_name: string;
  created_at: string;
  progress: number;
  stage: string;
}

interface CompletedProcess {
  id: string;
  display_name: string;
  updated_at: string;
  service_price: number | null;
}

function calculateProgress(obit: any): { progress: number; stage: string } {
  const fields = [
    obit.full_name, obit.birth_date, obit.death_date, obit.locality,
    obit.photo_url, obit.public_message, obit.family_name, obit.service_type
  ];
  const filled = fields.filter(f => f != null && f !== "").length;
  const pct = Math.round((filled / fields.length) * 100);
  if (pct < 30) return { progress: pct, stage: "Início" };
  if (pct < 60) return { progress: pct, stage: "Documentação" };
  if (pct < 85) return { progress: pct, stage: "Preparação" };
  return { progress: pct, stage: "Cerimónia" };
}

type DashboardCard = {
  id: string;
  title: string;
  icon: any;
  component: React.ReactNode;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [funerariaName, setFunerariaName] = useState("");
  const [funerariaId, setFunerariaId] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ activeProcesses: 0, scheduledCeremonies: 0, completedProcesses: 0, thisMonthNew: 0 });
  const [recentObituaries, setRecentObituaries] = useState<RecentObituary[]>([]);
  const [upcomingCeremonies, setUpcomingCeremonies] = useState<UpcomingCeremony[]>([]);
  const [activeProcesses, setActiveProcesses] = useState<ActiveProcess[]>([]);
  const [completedProcesses, setCompletedProcesses] = useState<CompletedProcess[]>([]);
  const [recentContacts, setRecentContacts] = useState<{ id: string; name: string; email: string; message: string; is_read: boolean; created_at: string }[]>([]);
  const [recentTestimonials, setRecentTestimonials] = useState<{ id: string; author_name: string; rating: number; message: string; status: string; created_at: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [cardOrder, setCardOrder] = useState<string[]>(["obituarios", "proximas-cerimonias", "processos-ativos", "processos-concluidos", "testemunhos-recentes", "contactos-recentes"]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get funeraria
      const { data: funeraria } = await supabase
        .from("funerarias")
        .select("id, nome_comercial")
        .eq("user_id", user.id)
        .single();

      if (!funeraria) return;
      setFunerariaName(funeraria.nome_comercial);
      setFunerariaId(funeraria.id);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const today = now.toISOString().split("T")[0];
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      // Parallel queries
      const [
        { count: activeCount },
        { count: completedCount },
        { count: thisMonthCount },
        { data: ceremoniesNext7 },
        { data: recentObitData },
        { data: upcomingCeremData },
        { data: activeObitData },
        { data: completedObitData },
      ] = await Promise.all([
        supabase.from("obituaries").select("*", { count: "exact", head: true }).eq("funeraria_id", funeraria.id).eq("is_completed", false),
        supabase.from("obituaries").select("*", { count: "exact", head: true }).eq("funeraria_id", funeraria.id).eq("is_completed", true),
        supabase.from("obituaries").select("*", { count: "exact", head: true }).eq("funeraria_id", funeraria.id).gte("created_at", startOfMonth),
        supabase.from("ceremony_events").select("id, event_date, obituary_id").gte("event_date", today).lte("event_date", in7Days),
        supabase.from("obituaries").select("id, display_name, death_date, is_completed, created_at").eq("funeraria_id", funeraria.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("ceremony_events").select("id, event_type, event_date, event_time, location, obituary_id").gte("event_date", today).order("event_date", { ascending: true }).limit(10),
        supabase.from("obituaries").select("id, display_name, created_at, full_name, birth_date, death_date, locality, photo_url, public_message, family_name, service_type").eq("funeraria_id", funeraria.id).eq("is_completed", false).order("created_at", { ascending: false }).limit(5),
        supabase.from("obituaries").select("id, display_name, updated_at, service_price").eq("funeraria_id", funeraria.id).eq("is_completed", true).order("updated_at", { ascending: false }).limit(5),
      ]);

      // Filter ceremonies belonging to this funeraria's obituaries
      const funerariaObits = recentObitData?.map(o => o.id) || [];
      const ceremonyCount = ceremoniesNext7?.filter(c => {
        // We need to check if the ceremony belongs to this funeraria
        // Since we fetched all, filter by obituary ownership
        return true; // RLS already filters
      }).length || 0;

      setStats({
        activeProcesses: activeCount || 0,
        scheduledCeremonies: ceremonyCount,
        completedProcesses: completedCount || 0,
        thisMonthNew: thisMonthCount || 0,
      });

      // Enrich recent obituaries with next ceremony
      const enrichedRecent: RecentObituary[] = [];
      for (const obit of (recentObitData || [])) {
        const { data: nextCeremony } = await supabase
          .from("ceremony_events")
          .select("event_date, event_time, event_type")
          .eq("obituary_id", obit.id)
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(1)
          .maybeSingle();
        enrichedRecent.push({ ...obit, nextCeremony });
      }
      setRecentObituaries(enrichedRecent);

      // Enrich upcoming ceremonies with obituary name
      const enrichedCeremonies: UpcomingCeremony[] = [];
      for (const cer of (upcomingCeremData || [])) {
        const { data: obit } = await supabase
          .from("obituaries")
          .select("display_name, id")
          .eq("id", cer.obituary_id)
          .maybeSingle();
        enrichedCeremonies.push({ ...cer, obituary: obit });
      }
      setUpcomingCeremonies(enrichedCeremonies);

      setActiveProcesses((activeObitData || []).map(o => {
        const { progress, stage } = calculateProgress(o);
        return { id: o.id, display_name: o.display_name, created_at: o.created_at, progress, stage };
      }));

      setCompletedProcesses((completedObitData || []).map(o => ({
        id: o.id, display_name: o.display_name, updated_at: o.updated_at, service_price: o.service_price,
      })));

      // Load recent contacts
      const { data: contactsData } = await supabase
        .from("funeraria_contacts")
        .select("id, name, email, message, is_read, created_at")
        .eq("funeraria_id", funeraria.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentContacts(contactsData || []);

      // Load recent testimonials
      const { data: testimonialsData } = await supabase
        .from("funeraria_testimonials")
        .select("id, author_name, rating, message, status, created_at")
        .eq("funeraria_id", funeraria.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentTestimonials(testimonialsData || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/obituaries?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try { return format(new Date(dateStr), "dd/MM/yyyy", { locale: pt }); } catch { return dateStr; }
  };

  const formatCeremonyDate = (dateStr: string, timeStr: string | null) => {
    try {
      const d = new Date(dateStr);
      const day = format(d, "dd", { locale: pt });
      const month = format(d, "MMM", { locale: pt }).toUpperCase();
      return { day, month, time: timeStr?.substring(0, 5) || "—" };
    } catch {
      return { day: "—", month: "—", time: "—" };
    }
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.stopPropagation();
    setDraggedCard(cardId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedCard || draggedCard === targetCardId) { setDraggedCard(null); return; }
    const newOrder = [...cardOrder];
    const draggedIndex = newOrder.indexOf(draggedCard);
    const targetIndex = newOrder.indexOf(targetCardId);
    if (draggedIndex !== -1 && targetIndex !== -1) {
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedCard);
      setCardOrder(newOrder);
    }
    setDraggedCard(null);
  };

  const handleDragEnd = () => { setDraggedCard(null); };

  const formatCeremonyType = (type: string) => {
    const map: Record<string, string> = {
      velorio: "Velório",
      funeral: "Funeral",
      cremacao: "Cremação",
      missa_7: "Missa 7º Dia",
      missa_30: "Missa 30º Dia",
    };
    return map[type] || type;
  };

  const ceremonyTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t === "velorio") return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400";
    if (t === "missa_7") return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
    if (t === "missa_30") return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400";
    if (t === "funeral") return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
    if (t === "cremacao") return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
    return "bg-muted text-muted-foreground";
  };

  const cards: Record<string, DashboardCard> = {
    "obituarios": {
      id: "obituarios",
      title: "Obituários Recentes",
      icon: FileText,
      component: (
        <div className="space-y-4">
          {recentObituaries.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum obituário registado</p>
          )}
          {recentObituaries.map((obituary) => (
            <div
              key={obituary.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/obituaries/${obituary.id}/edit`)}
            >
              <div>
                <h3 className="font-medium text-foreground">{obituary.display_name}</h3>
                <p className="text-sm text-muted-foreground">
                  Falecimento: {formatDate(obituary.death_date)}
                </p>
              </div>
              <div className="text-right">
                {obituary.nextCeremony ? (
                  <p className="text-sm text-foreground">
                    {formatCeremonyType(obituary.nextCeremony.event_type)}: {formatDate(obituary.nextCeremony.event_date)} - {obituary.nextCeremony.event_time?.substring(0, 5) || ""}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem cerimónia agendada</p>
                )}
                <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                  obituary.is_completed ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                }`}>
                  {obituary.is_completed ? "Concluído" : "Ativo"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    "processos-ativos": {
      id: "processos-ativos",
      title: "Processos Ativos",
      icon: Clock,
      component: (
        <div className="space-y-4">
          {activeProcesses.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum processo ativo</p>
          )}
          {activeProcesses.map((process) => (
            <div
              key={process.id}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/obituaries/${process.id}/edit`)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-foreground">{process.display_name}</h3>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {process.stage}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Início: {formatDate(process.created_at)}
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso</span>
                  <span>{process.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${process.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    "proximas-cerimonias": {
      id: "proximas-cerimonias",
      title: "Próximas Cerimónias",
      icon: Calendar,
      component: (
        <div className="space-y-4">
          {upcomingCeremonies.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma cerimónia agendada</p>
          )}
          {upcomingCeremonies.map((ceremony) => {
            const { day, month, time } = formatCeremonyDate(ceremony.event_date, ceremony.event_time);
            return (
              <div key={ceremony.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary/10">
                    <span className="text-2xl font-archivo font-bold text-primary">{day}</span>
                    <span className="text-xs text-primary font-medium">{month}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">{ceremony.obituary?.display_name || "—"}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {time}
                      </div>
                      <Badge className={ceremonyTypeColor(ceremony.event_type)}>
                        {formatCeremonyType(ceremony.event_type)}
                      </Badge>
                      {ceremony.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {ceremony.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {ceremony.obituary && (
                  <Button variant="outline" size="sm" onClick={() => navigate(`/obituaries/${ceremony.obituary!.id}/edit`)}>
                    Detalhes
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      ),
    },
    "processos-concluidos": {
      id: "processos-concluidos",
      title: "Processos Concluídos",
      icon: CheckCircle2,
      component: (
        <div className="space-y-4">
          {completedProcesses.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum processo concluído</p>
          )}
          {completedProcesses.map((process) => (
            <div
              key={process.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/obituaries/${process.id}`)}
            >
              <div>
                <h3 className="font-medium text-foreground">{process.display_name}</h3>
                <p className="text-sm text-muted-foreground">
                  Concluído: {formatDate(process.updated_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  {process.service_price ? `${process.service_price.toLocaleString("pt-PT")}€` : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    "contactos-recentes": {
      id: "contactos-recentes",
      title: "Contactos Recentes",
      icon: Mail,
      component: (
        <div className="space-y-4">
          {recentContacts.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum contacto recebido</p>
          )}
          {recentContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors ${!contact.is_read ? "bg-primary/5 border-primary/20" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{contact.name}</h3>
                  {!contact.is_read && <Badge className="bg-primary text-primary-foreground text-xs">Novo</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true, locale: pt })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{contact.email}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{contact.message}</p>
            </div>
          ))}
        </div>
      ),
    },
  };

  const viewAllRoutes: Record<string, string> = {
    "obituarios": "/obituaries",
    "proximas-cerimonias": "/ceremonies",
    "processos-ativos": "/obituaries",
    "processos-concluidos": "/obituaries",
    "contactos-recentes": "/dashboard",
  };

  const statItems = [
    { name: "Processos Ativos", value: stats.activeProcesses.toString(), icon: FileText, change: `+${stats.thisMonthNew} este mês`, changeType: "positive" },
    { name: "Cerimónias Agendadas", value: stats.scheduledCeremonies.toString(), icon: Calendar, change: "Próximos 7 dias", changeType: "neutral" },
    { name: "Processos Concluídos", value: stats.completedProcesses.toString(), icon: Users, change: "Total", changeType: "neutral" },
    { name: "Novos este Mês", value: stats.thisMonthNew.toString(), icon: TrendingUp, change: format(new Date(), "MMMM yyyy", { locale: pt }), changeType: "positive" },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-archivo font-bold text-foreground">
            {loading ? <Skeleton className="h-9 w-64" /> : funerariaName || "Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao Sistema de Gestão Funerária da Memoralis
          </p>
        </div>
        <div className="flex items-center gap-3">
          {funerariaId && <NotificationBell funerariaId={funerariaId} />}
          <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate("/obituaries/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Obituário
          </Button>
        </div>
      </div>

      {/* Quick Search */}
      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Pesquisar por nome, família ou cerimónia..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-3xl font-archivo font-bold text-foreground mt-2">
                  {loading ? <Skeleton className="h-9 w-16" /> : stat.value}
                </p>
                <p className={`text-xs mt-2 ${stat.changeType === "positive" ? "text-green-600" : "text-muted-foreground"}`}>
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

      {/* Draggable Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cardOrder.map((cardId) => {
          const card = cards[cardId];
          const IconComponent = card.icon;
          const isDragging = draggedCard === card.id;
          const isDropTarget = draggedCard && draggedCard !== card.id;

          return (
            <Card
              key={card.id}
              className={`p-6 transition-all ${isDragging ? "opacity-50 scale-95" : ""} ${isDropTarget ? "ring-2 ring-primary ring-offset-2" : ""}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, card.id)}
            >
              <div
                className="flex justify-between items-center mb-6 cursor-move"
                draggable
                onDragStart={(e) => handleDragStart(e, card.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                  <IconComponent className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-archivo font-semibold text-foreground">{card.title}</h2>
                </div>
                <Button variant="ghost" size="sm" onMouseDown={(e) => e.stopPropagation()} onClick={() => navigate(viewAllRoutes[cardId] || "/obituaries")}>
                  Ver Todos
                </Button>
              </div>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : (
                <div>{card.component}</div>
              )}
            </Card>
          );
        })}
      </div>

      <ChatButton userType="funeraria" />
    </div>
  );
}
