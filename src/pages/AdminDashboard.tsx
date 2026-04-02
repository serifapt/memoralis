import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, MessageSquare, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Stats {
  total_funerarias: number;
  pending_funerarias: number;
  active_funerarias: number;
  total_users: number;
  unread_messages: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total_funerarias: 0,
    pending_funerarias: 0,
    active_funerarias: 0,
    total_users: 0,
    unread_messages: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    loadStats();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!roles?.some((r) => r.role === "admin")) {
      navigate("/dashboard");
    }
  };

  const loadStats = async () => {
    try {
      // Total funerárias
      const { count: totalFunerarias } = await supabase
        .from("funerarias")
        .select("*", { count: "exact", head: true });

      // Funerárias pendentes
      const { count: pendingFunerarias } = await supabase
        .from("funerarias")
        .select("*", { count: "exact", head: true })
        .eq("status", "pendente");

      // Funerárias ativas
      const { count: activeFunerarias } = await supabase
        .from("funerarias")
        .select("*", { count: "exact", head: true })
        .eq("status", "ativo");

      // Total utilizadores
      const { count: totalUsers } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true });

      // Mensagens não lidas
      const { count: unreadMessages } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false)
        .eq("sender_type", "funeraria");

      setStats({
        total_funerarias: totalFunerarias || 0,
        pending_funerarias: pendingFunerarias || 0,
        active_funerarias: activeFunerarias || 0,
        total_users: totalUsers || 0,
        unread_messages: unreadMessages || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      name: "Total Funerárias",
      value: stats.total_funerarias.toString(),
      icon: Building2,
      description: `${stats.active_funerarias} ativas`,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      onClick: () => navigate("/admin/funerarias"),
    },
    {
      name: "Pendentes Aprovação",
      value: stats.pending_funerarias.toString(),
      icon: Clock,
      description: "Aguardam validação",
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
      onClick: () => navigate("/admin/funerarias"),
    },
    {
      name: "Total Utilizadores",
      value: stats.total_users.toString(),
      icon: Users,
      description: "Na plataforma",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      onClick: () => navigate("/admin/users"),
    },
    {
      name: "Mensagens Não Lidas",
      value: stats.unread_messages.toString(),
      icon: MessageSquare,
      description: "De funerárias",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      onClick: () => navigate("/admin/chat"),
    },
  ];

  return (
    <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-archivo font-bold text-foreground">
            Painel de Administração
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao sistema de gestão da plataforma Memoralis
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">A carregar estatísticas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat) => (
              <Card 
                key={stat.name} 
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={stat.onClick}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                    <p className="text-3xl font-archivo font-bold text-foreground mt-2">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-archivo font-semibold">
                Ações Rápidas
              </h2>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/admin/funerarias")}
                className="w-full text-left p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Gerir Funerárias</h3>
                    <p className="text-sm text-muted-foreground">
                      Aprovar, rejeitar ou desativar contas
                    </p>
                  </div>
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
              <button
                onClick={() => navigate("/admin/users")}
                className="w-full text-left p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Gerir Utilizadores</h3>
                    <p className="text-sm text-muted-foreground">
                      Ver e gerir roles de utilizadores
                    </p>
                  </div>
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
              <button
                onClick={() => navigate("/admin/chat")}
                className="w-full text-left p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Chat de Suporte</h3>
                    <p className="text-sm text-muted-foreground">
                      Responder a mensagens das funerárias
                    </p>
                  </div>
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-archivo font-semibold">
                Informações do Sistema
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">Funerárias Ativas</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {stats.active_funerarias}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">Aprovações Pendentes</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {stats.pending_funerarias}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              {stats.unread_messages > 0 && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900">
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      Mensagens por responder
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                      {stats.unread_messages}
                    </p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
  );
}
