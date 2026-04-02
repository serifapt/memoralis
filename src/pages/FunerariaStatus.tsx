import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle, XCircle, FileText, Upload } from "lucide-react";
import logo from "@/assets/logo-memoralis.svg";

export default function FunerariaStatus() {
  const [funeraria, setFuneraria] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadFunerariaData();
  }, []);

  const loadFunerariaData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: funerariaData, error: funerariaError } = await supabase
        .from("funerarias")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (funerariaError) throw funerariaError;
      setFuneraria(funerariaData);

      // Se já está ativo, redirecionar
      if (funerariaData.status === "ativo") {
        navigate("/dashboard");
        return;
      }

      const { data: docsData, error: docsError } = await supabase
        .from("funeraria_docs")
        .select("*")
        .eq("funeraria_id", funerariaData.id);

      if (docsError) throw docsError;
      setDocuments(docsData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>A carregar...</p>
      </div>
    );
  }

  if (!funeraria) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Funerária não encontrada</p>
      </div>
    );
  }

  const statusConfig = {
    pendente: {
      icon: Clock,
      color: "bg-yellow-500",
      label: "Pendente",
      description: "O seu registo está a ser verificado pela nossa equipa.",
    },
    ativo: {
      icon: CheckCircle,
      color: "bg-green-500",
      label: "Ativo",
      description: "A sua conta foi aprovada!",
    },
    rejeitado: {
      icon: XCircle,
      color: "bg-red-500",
      label: "Rejeitado",
      description: funeraria.motivo_rejeicao || "O seu registo foi rejeitado.",
    },
  };

  const config = statusConfig[funeraria.status as keyof typeof statusConfig];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <img src={logo} alt="Memoralis" className="h-10" />
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>

        <Card className="p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`${config.color} p-3 rounded-full`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Estado do Registo</h1>
              <Badge className="mt-1">{config.label}</Badge>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">{config.description}</p>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Dados da Funerária</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome Comercial</p>
                <p className="font-medium">{funeraria.nome_comercial}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NIF</p>
                <p className="font-medium">{funeraria.nif}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Responsável</p>
                <p className="font-medium">{funeraria.responsavel_nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{funeraria.telefone}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos Submetidos
          </h2>

          {documents.length === 0 ? (
            <p className="text-muted-foreground">Nenhum documento submetido</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{getTipoLabel(doc.tipo)}</p>
                      {doc.numero_documento && (
                        <p className="text-sm text-muted-foreground">
                          Nº {doc.numero_documento}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      doc.estado_validacao === "valido"
                        ? "default"
                        : doc.estado_validacao === "invalido"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {getEstadoLabel(doc.estado_validacao)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {funeraria.status === "rejeitado" && (
          <div className="mt-6">
            <Button onClick={() => navigate("/funeraria/register")} className="w-full">
              Corrigir e Reenviar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function getTipoLabel(tipo: string) {
  const labels: Record<string, string> = {
    licenca_atividade: "Licença de Atividade",
    certidao_permanente_upload: "Certidão Permanente (Upload)",
    certidao_permanente_codigo: "Certidão Permanente (Código)",
    inicio_atividade_at: "Início de Atividade AT",
  };
  return labels[tipo] || tipo;
}

function getEstadoLabel(estado: string) {
  const labels: Record<string, string> = {
    por_validar: "Por Validar",
    valido: "Válido",
    invalido: "Inválido",
  };
  return labels[estado] || estado;
}
