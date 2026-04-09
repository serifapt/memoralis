import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";
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

export default function AdminFunerarias() {
  const [funerarias, setFunerarias] = useState<any[]>([]);
  const [filter, setFilter] = useState("pendente");
  const [loading, setLoading] = useState(true);
  const [toggleFunerariaId, setToggleFunerariaId] = useState<string | null>(null);
  const [toggleAction, setToggleAction] = useState<"desativar" | "ativar">("desativar");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    loadFunerarias();
  }, [filter]);

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

  const handleToggleStatus = async () => {
    if (!toggleFunerariaId) return;

    try {
      const newStatus = toggleAction === "desativar" ? "desativado" : "ativo";
      
      const { error } = await supabase
        .from("funerarias")
        .update({ status: newStatus })
        .eq("id", toggleFunerariaId);

      if (error) throw error;

      // Log audit
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_logs").insert({
          actor_id: user.id,
          entidade: "funeraria",
          entidade_id: toggleFunerariaId,
          acao: toggleAction === "desativar" ? "desativacao" : "ativacao",
          detalhes: {
            status_anterior: toggleAction === "desativar" ? "ativo" : "desativado",
            status_novo: newStatus
          }
        });
      }

      toast.success(
        toggleAction === "desativar"
          ? "Conta desativada com sucesso"
          : "Conta ativada com sucesso"
      );
      
      setToggleFunerariaId(null);
      loadFunerarias();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status da conta");
    }
  };

  return (
    <>
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
            <TabsTrigger value="correção_pendente">Correção</TabsTrigger>
            <TabsTrigger value="ativo">Ativos</TabsTrigger>
            <TabsTrigger value="desativado">Desativados</TabsTrigger>
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
                  <div className="space-y-2 flex-1">
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
                            : funeraria.status === "desativado"
                            ? "outline"
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
                  <div className="flex gap-2">
                    {(funeraria.status === "ativo" || funeraria.status === "desativado") && (
                      <Button
                        variant={funeraria.status === "ativo" ? "destructive" : "default"}
                        size="sm"
                        onClick={() => {
                          setToggleFunerariaId(funeraria.id);
                          setToggleAction(funeraria.status === "ativo" ? "desativar" : "ativar");
                        }}
                      >
                        {funeraria.status === "ativo" ? (
                          <>
                            <Ban className="h-4 w-4 mr-2" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/funerarias/${funeraria.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!toggleFunerariaId} onOpenChange={() => setToggleFunerariaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleAction === "desativar" ? "Desativar" : "Ativar"} conta
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleAction === "desativar"
                ? "Tem a certeza que deseja desativar esta conta? A funerária não poderá aceder ao sistema."
                : "Tem a certeza que deseja ativar esta conta? A funerária voltará a ter acesso ao sistema."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
