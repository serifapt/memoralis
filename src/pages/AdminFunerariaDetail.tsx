import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EnhancedChatButton } from "@/components/chat/EnhancedChatButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, CheckCircle, XCircle, Download } from "lucide-react";

export default function AdminFunerariaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [funeraria, setFuneraria] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRequestChangesDialog, setShowRequestChangesDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const [userEmail, setUserEmail] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const { data: funerariaData, error: funerariaError } = await supabase
        .from("funerarias")
        .select("*")
        .eq("id", id)
        .single();

      if (funerariaError) throw funerariaError;
      setFuneraria(funerariaData);

      // Fetch user email from profiles
      if (funerariaData?.user_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", funerariaData.user_id)
          .maybeSingle();
        
        // Get email from auth (via edge function or stored separately)
        // For now we'll show user_id info
      }

      const { data: docsData, error: docsError } = await supabase
        .from("funeraria_docs")
        .select("*")
        .eq("funeraria_id", id);

      if (docsError) throw docsError;
      setDocuments(docsData || []);

      const { data: logsData, error: logsError } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("entidade", "funeraria")
        .eq("entidade_id", id)
        .order("created_at", { ascending: false });

      if (logsError) throw logsError;
      setAuditLogs(logsData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da funerária",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error: updateError } = await supabase
        .from("funerarias")
        .update({ status: "ativo" })
        .eq("id", id);

      if (updateError) throw updateError;

      const { error: logError } = await supabase
        .from("audit_logs")
        .insert({
          actor_id: user.id,
          entidade: "funeraria",
          entidade_id: id,
          acao: "approved",
          detalhes: { status: "ativo" },
        });

      if (logError) throw logError;

      // Send activation email notification
      try {
        await supabase.functions.invoke("notify-funeraria-activation", {
          body: { funeraria_id: id },
        });
      } catch (emailError) {
        console.error("Erro ao enviar notificação de ativação:", emailError);
      }

      toast({
        title: "Funerária aprovada",
        description: "A conta foi ativada com sucesso e a funerária foi notificada por email",
      });

      setShowApproveDialog(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error: updateError } = await supabase
        .from("funerarias")
        .update({
          status: "rejeitado",
          motivo_rejeicao: motivo,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      const { error: logError } = await supabase
        .from("audit_logs")
        .insert({
          actor_id: user.id,
          entidade: "funeraria",
          entidade_id: id,
          acao: "rejected",
          detalhes: { motivo },
        });

      if (logError) throw logError;

      toast({
        title: "Funerária rejeitada",
        description: "O registo foi rejeitado",
      });

      setShowRejectDialog(false);
      setMotivo("");
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRequestChanges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      if (!selectedDoc) throw new Error("Selecione um documento");

      // Find selected document type
      const selectedDocument = documents.find((d) => d.id === selectedDoc);
      const documentType = selectedDocument ? getTipoLabel(selectedDocument.tipo) : "Documento";

      const { error: updateError } = await supabase
        .from("funeraria_docs")
        .update({
          estado_validacao: "invalido",
          observacoes: motivo,
        })
        .eq("id", selectedDoc);

      if (updateError) throw updateError;

      const { error: logError } = await supabase
        .from("audit_logs")
        .insert({
          actor_id: user.id,
          entidade: "funeraria_doc",
          entidade_id: selectedDoc,
          acao: "request_changes",
          detalhes: { motivo, document_type: documentType },
        });

      if (logError) throw logError;

      // Send email notification via edge function
      try {
        await supabase.functions.invoke("notify-funeraria-correction", {
          body: {
            funeraria_id: id,
            document_type: documentType,
            motivo,
          },
        });
      } catch (emailError) {
        console.error("Erro ao enviar notificação:", emailError);
      }

      toast({
        title: "Correção solicitada",
        description: "A funerária foi notificada por email",
      });

      setShowRequestChangesDialog(false);
      setSelectedDoc(null);
      setMotivo("");
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadDocument = async (doc: any) => {
    if (!doc.ficheiro_path) return;

    try {
      const { data, error } = await supabase.storage
        .from("funeraria-docs")
        .download(doc.ficheiro_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.ficheiro_path.split("/").pop() || "document";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao descarregar documento",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <p>A carregar...</p>
    );
  }

  if (!funeraria) {
    return (
      <p>Funerária não encontrada</p>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{funeraria.nome_comercial}</h1>
            <Badge className="mt-2">{funeraria.status}</Badge>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/funerarias")}>
            Voltar
          </Button>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Dados Básicos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            <div>
              <p className="text-sm text-muted-foreground">Data de Registo</p>
              <p className="font-medium">
                {new Date(funeraria.created_at).toLocaleDateString("pt-PT")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Atualização</p>
              <p className="font-medium">
                {new Date(funeraria.updated_at).toLocaleDateString("pt-PT")}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <h3 className="text-lg font-semibold mb-3">Declarações e Confirmações</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Representação Legal</p>
              <Badge variant={funeraria.declaro_representacao_legal ? "default" : "secondary"}>
                {funeraria.declaro_representacao_legal ? "Confirmado" : "Não confirmado"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Termos e Condições</p>
              <Badge variant={funeraria.aceito_termos ? "default" : "secondary"}>
                {funeraria.aceito_termos ? "Aceites" : "Não aceites"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Serviço de Flores</p>
              <Badge variant={funeraria.servico_flores_ativo ? "default" : "outline"}>
                {funeraria.servico_flores_ativo ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>

          {funeraria.motivo_rejeicao && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Motivo de Rejeição</p>
                <p className="text-destructive font-medium">{funeraria.motivo_rejeicao}</p>
              </div>
            </>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Documentos</h2>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{getTipoLabel(doc.tipo)}</p>
                    {doc.numero_documento && (
                      <p className="text-sm text-muted-foreground">Nº {doc.numero_documento}</p>
                    )}
                    {doc.codigo_acesso && (
                      <p className="text-sm text-muted-foreground">
                        Código: {maskCodigo(doc.codigo_acesso)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                  {doc.ficheiro_path && (
                    <Button size="sm" variant="outline" onClick={() => downloadDocument(doc)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {funeraria.status === "pendente" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ações</h2>
            <div className="flex gap-3">
              <Button onClick={() => setShowApproveDialog(true)} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovar e Ativar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRequestChangesDialog(true)}
                className="flex-1"
              >
                Pedir Correção
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectDialog(true)}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Histórico de Auditoria</h2>
          {auditLogs.length === 0 ? (
            <p className="text-muted-foreground">Sem histórico</p>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="text-sm">
                  <span className="font-medium">{log.acao}</span> -{" "}
                  {new Date(log.created_at).toLocaleString("pt-PT")}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Funerária</DialogTitle>
            <DialogDescription>
              Tem a certeza que deseja aprovar e ativar esta funerária?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove}>Aprovar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Funerária</DialogTitle>
            <DialogDescription>
              Indique o motivo da rejeição
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Motivo *</Label>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Descreva o motivo da rejeição..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!motivo.trim()}>
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog open={showRequestChangesDialog} onOpenChange={setShowRequestChangesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pedir Correção</DialogTitle>
            <DialogDescription>
              Selecione o documento e indique o que precisa ser corrigido
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Documento *</Label>
              <Select value={selectedDoc} onValueChange={setSelectedDoc}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um documento" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {getTipoLabel(doc.tipo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Motivo *</Label>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Descreva o que precisa ser corrigido..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRequestChangesDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRequestChanges}
              disabled={!selectedDoc || !motivo.trim()}
            >
              Enviar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {funeraria && (
        <EnhancedChatButton funerariaId={funeraria.id} userType="admin" />
      )}
    </>
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

function maskCodigo(codigo: string) {
  if (codigo.length <= 4) return codigo;
  return "XXXX-XXXX-" + codigo.slice(-4);
}
