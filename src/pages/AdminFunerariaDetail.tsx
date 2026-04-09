import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { FileText, CheckCircle, XCircle, Download, Save, Eye, Loader2 } from "lucide-react";

export default function AdminFunerariaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [funeraria, setFuneraria] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editNomeComercial, setEditNomeComercial] = useState("");
  const [editNif, setEditNif] = useState("");
  const [editResponsavel, setEditResponsavel] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [savingData, setSavingData] = useState(false);

  // Credentials states
  const [userEmail, setUserEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingCredentials, setSavingCredentials] = useState(false);

  // Document validation
  const [validatingDocId, setValidatingDocId] = useState<string | null>(null);

  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRequestChangesDialog, setShowRequestChangesDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const { data: funerariaData, error: funerariaError } = await supabase
        .from("funerarias")
        .select("*")
        .eq("id", id)
        .single();

      if (funerariaError) throw funerariaError;
      setFuneraria(funerariaData);

      // Set edit fields
      setEditNomeComercial(funerariaData.nome_comercial || "");
      setEditNif(funerariaData.nif || "");
      setEditResponsavel(funerariaData.responsavel_nome || "");
      setEditTelefone(funerariaData.telefone || "");

      // Fetch user email
      if (funerariaData?.user_id) {
        try {
          const { data: emailData } = await supabase.functions.invoke("get-member-emails", {
            body: { user_ids: [funerariaData.user_id], funeraria_id: id },
          });
          if (emailData?.emails?.[funerariaData.user_id]) {
            setUserEmail(emailData.emails[funerariaData.user_id]);
            setNewEmail(emailData.emails[funerariaData.user_id]);
          }
        } catch (e) {
          console.error("Erro ao buscar email:", e);
        }
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

  const handleSaveData = async () => {
    setSavingData(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-update-funeraria", {
        body: {
          funeraria_id: id,
          nome_comercial: editNomeComercial,
          nif: editNif,
          responsavel_nome: editResponsavel,
          telefone: editTelefone,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Dados atualizados", description: "Os dados da funerária foram guardados" });
      loadData();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setSavingData(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!newEmail && !newPassword) return;
    setSavingCredentials(true);
    try {
      const body: any = { funeraria_id: id };
      if (newEmail && newEmail !== userEmail) body.email = newEmail;
      if (newPassword) body.password = newPassword;

      const { data, error } = await supabase.functions.invoke("admin-update-funeraria", {
        body,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Credenciais atualizadas", description: "As credenciais de acesso foram atualizadas" });
      setNewPassword("");
      loadData();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setSavingCredentials(false);
    }
  };

  const handleValidateDoc = async (docId: string) => {
    setValidatingDocId(docId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("funeraria_docs")
        .update({ estado_validacao: "valido", observacoes: null })
        .eq("id", docId);

      if (error) throw error;

      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        entidade: "funeraria_doc",
        entidade_id: docId,
        acao: "validated",
        detalhes: { estado: "valido" },
      });

      toast({ title: "Documento validado" });
      loadData();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setValidatingDocId(null);
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

      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        entidade: "funeraria",
        entidade_id: id,
        acao: "approved",
        detalhes: { status: "ativo" },
      });

      try {
        await supabase.functions.invoke("notify-funeraria-activation", {
          body: { funeraria_id: id },
        });
      } catch (emailError) {
        console.error("Erro ao enviar notificação:", emailError);
      }

      toast({
        title: "Funerária aprovada",
        description: "A conta foi ativada com sucesso e a funerária foi notificada por email",
      });

      setShowApproveDialog(false);
      loadData();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error: updateError } = await supabase
        .from("funerarias")
        .update({ status: "rejeitado", motivo_rejeicao: motivo })
        .eq("id", id);

      if (updateError) throw updateError;

      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        entidade: "funeraria",
        entidade_id: id,
        acao: "rejected",
        detalhes: { motivo },
      });

      toast({ title: "Funerária rejeitada", description: "O registo foi rejeitado" });
      setShowRejectDialog(false);
      setMotivo("");
      loadData();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleRequestChanges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      if (!selectedDoc) throw new Error("Selecione um documento");

      const selectedDocument = documents.find((d) => d.id === selectedDoc);
      const documentType = selectedDocument ? getTipoLabel(selectedDocument.tipo) : "Documento";

      const { error: updateError } = await supabase
        .from("funeraria_docs")
        .update({ estado_validacao: "invalido", observacoes: motivo })
        .eq("id", selectedDoc);

      if (updateError) throw updateError;

      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        entidade: "funeraria_doc",
        entidade_id: selectedDoc,
        acao: "request_changes",
        detalhes: { motivo, document_type: documentType },
      });

      try {
        await supabase.functions.invoke("notify-funeraria-correction", {
          body: { funeraria_id: id, document_type: documentType, motivo },
        });
      } catch (emailError) {
        console.error("Erro ao enviar notificação:", emailError);
      }

      toast({ title: "Correção solicitada", description: "A funerária foi notificada por email" });
      setShowRequestChangesDialog(false);
      setSelectedDoc(null);
      setMotivo("");
      loadData();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
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
      toast({ title: "Erro", description: "Erro ao descarregar documento", variant: "destructive" });
    }
  };

  if (loading) return <p>A carregar...</p>;
  if (!funeraria) return <p>Funerária não encontrada</p>;

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

        {/* Editar Dados */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Editar Dados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome Comercial</Label>
              <Input
                value={editNomeComercial}
                onChange={(e) => setEditNomeComercial(e.target.value)}
              />
            </div>
            <div>
              <Label>NIF</Label>
              <Input
                value={editNif}
                onChange={(e) => setEditNif(e.target.value)}
              />
            </div>
            <div>
              <Label>Responsável</Label>
              <Input
                value={editResponsavel}
                onChange={(e) => setEditResponsavel(e.target.value)}
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={editTelefone}
                onChange={(e) => setEditTelefone(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveData} disabled={savingData}>
              {savingData ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Dados
            </Button>
          </div>
        </Card>

        {/* Credenciais de Acesso */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Credenciais de Acesso</h2>
          {userEmail && (
            <p className="text-sm text-muted-foreground mb-4">
              Email atual: <span className="font-medium text-foreground">{userEmail}</span>
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Novo email de acesso"
              />
            </div>
            <div>
              <Label>Nova Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Deixe vazio para manter"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSaveCredentials}
              disabled={savingCredentials || (!newPassword && newEmail === userEmail)}
            >
              {savingCredentials ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Atualizar Credenciais
            </Button>
          </div>
        </Card>

        {/* Info extra read-only */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Declarações e Datas</h2>
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

        {/* Documentos */}
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
                    {doc.observacoes && (
                      <p className="text-sm text-destructive mt-1">{doc.observacoes}</p>
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
                  {doc.estado_validacao !== "valido" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleValidateDoc(doc.id)}
                      disabled={validatingDocId === doc.id}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      {validatingDocId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Validar
                        </>
                      )}
                    </Button>
                  )}
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

        {/* Ações de aprovação */}
        {funeraria.status === "pendente" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ações</h2>
            <div className="flex gap-3">
              <Button onClick={() => setShowApproveDialog(true)} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovar e Ativar
              </Button>
              <Button variant="outline" onClick={() => setShowRequestChangesDialog(true)} className="flex-1">
                Pedir Correção
              </Button>
              <Button variant="destructive" onClick={() => setShowRejectDialog(true)} className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
            </div>
          </Card>
        )}

        {/* Auditoria */}
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
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancelar</Button>
            <Button onClick={handleApprove}>Aprovar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Funerária</DialogTitle>
            <DialogDescription>Indique o motivo da rejeição</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Motivo *</Label>
              <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Descreva o motivo da rejeição..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!motivo.trim()}>Rejeitar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog open={showRequestChangesDialog} onOpenChange={setShowRequestChangesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pedir Correção</DialogTitle>
            <DialogDescription>Selecione o documento e indique o que precisa ser corrigido</DialogDescription>
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
                    <SelectItem key={doc.id} value={doc.id}>{getTipoLabel(doc.tipo)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Motivo *</Label>
              <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Descreva o que precisa ser corrigido..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestChangesDialog(false)}>Cancelar</Button>
            <Button onClick={handleRequestChanges} disabled={!selectedDoc || !motivo.trim()}>Enviar Pedido</Button>
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
