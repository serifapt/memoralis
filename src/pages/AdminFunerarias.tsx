import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Eye } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function AdminFunerarias() {
  const [funerarias, setFunerarias] = useState<any[]>([]);
  const [filter, setFilter] = useState("pendente");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    loadFunerarias();
  }, [filter]);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
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

  const loadFunerarias = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("funerarias")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "todos") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFunerarias(data || []);
    } catch (error) {
      console.error("Erro ao carregar funerárias:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Funerárias</h1>
          <p className="text-muted-foreground">
            Aprovar, rejeitar ou pedir correções nos registos
          </p>
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="pendente">Pendentes</TabsTrigger>
            <TabsTrigger value="ativo">Ativos</TabsTrigger>
            <TabsTrigger value="rejeitado">Rejeitados</TabsTrigger>
            <TabsTrigger value="todos">Todos</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <p>A carregar...</p>
        ) : funerarias.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum registo encontrado
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {funerarias.map((funeraria) => (
              <Card key={funeraria.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        {funeraria.nome_comercial}
                      </h3>
                      <Badge
                        variant={
                          funeraria.status === "ativo"
                            ? "default"
                            : funeraria.status === "rejeitado"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {funeraria.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">NIF</p>
                        <p className="font-medium">{funeraria.nif}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Responsável</p>
                        <p className="font-medium">{funeraria.responsavel_nome}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Data</p>
                        <p className="font-medium">
                          {new Date(funeraria.created_at).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/funerarias/${funeraria.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
