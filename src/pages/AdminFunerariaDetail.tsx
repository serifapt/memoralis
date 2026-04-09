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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, CheckCircle, XCircle, Download, Save, Loader2, Trash2, Users, Edit } from "lucide-react";

// ── Types ──
interface MemberInfo {
  user_id: string;
  role: string;
  email?: string;
  full_name?: string;
  phone?: string;
}

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

  // Members
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [editingMember, setEditingMember] = useState<MemberInfo | null>(null);
  const [memberEditData, setMemberEditData] = useState({ email: "", full_name: "", phone: "", role: "", password: "" });
  const [savingMember, setSavingMember] = useState(false);

  // Delete
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      setEditNomeComercial(funerariaData.nome_comercial || "");
      setEditNif(funerariaData.nif || "");
      setEditResponsavel(funerariaData.responsavel_nome || "");
      setEditTelefone(funerariaData.telefone || "");

      // Fetch owner email
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

      // Fetch members
      const { data: membersData } = await supabase
        .from("funeraria_members")
        .select("user_id, role")
        .eq("funeraria_id", id);

      if (membersData && membersData.length > 0) {
        const userIds = membersData.map((m) => m.user_id);

        // Get profiles
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", userIds);

        // Get emails
        let emailMap: Record<string, string> = {};
        try {
          const { data: emailData } = await supabase.functions.invoke("get-member-emails", {
            body: { user_ids: userIds, funeraria_id: id },
          });
          emailMap = emailData?.emails || {};
        } catch (e) {
          console.error("Erro ao buscar emails dos membros:", e);
        }

        const enriched: MemberInfo[] = membersData.map((m) => {
          const profile = profiles?.find((p) => p.id === m.user_id);
          return {
            user_id: m.user_id,
            role: m.role,
            email: emailMap[m.user_id] || "",
            full_name: profile?.full_name || "",
            phone: profile?.phone || "",
          };
        });
        setMembers(enriched);
      } else {
        setMembers([]);
      }

      const { data: docsData } = await supabase
        .from("funeraria_docs")
        .select("*")
        .eq("funeraria_id", id);
      setDocuments(docsData || []);

      const { data: logsData } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("entidade", "funeraria")
        .eq("entidade_id", id)
        .order("created_at", { ascending: false });
      setAuditLogs(logsData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({ title: "Erro", description: "Erro ao carregar dados da funerária", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveData = async () => {
    setSavingData(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-update-funeraria", {
        body: { funeraria_id: id, nome_comercial: editNomeComercial, nif: editNif, responsavel_nome: editResponsavel, telefone: editTelefone },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Dados atualizados" });
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
      const { data, error } = await supabase.functions.invoke("admin-update-funeraria", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Credenciais atualizadas" });
      setNewPassword("");
      loadData();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setSavingCredentials(false);
    }
  };

  const handleDeleteFuneraria = async () => {
    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Delete docs first, then members, then funeraria
      await supabase.from("funeraria_docs").delete().eq("funeraria_id", id);
      await supabase.from("funeraria_members").delete().eq("funeraria_id", id);
      const { error } = await supabase.from("funerarias").delete().eq("id", id);
      if (error) throw error;

      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        entidade: "funeraria",
        entidade_id: id!,
        acao: "deleted",
        detalhes: { nome_comercial: funeraria.nome_comercial },
      });

      toast({ title: "Funerária eliminada" });
      navigate("/admin/funerarias");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleEditMember = (member: MemberInfo) => {
    setEditingMember(member);
    setMemberEditData({
      email: member.email || "",
      full_name: member.full_name || "",
      phone: member.phone || "",
      role: member.role,
      password: "",
    });
  };

  const handleSaveMember = async () => {
    if (!editingMember) return;
    setSavingMember(true);
    try {
      const body: any = {
        member_user_id: editingMember.user_id,
        funeraria_id: id,
      };
      if (memberEditData.email && memberEditData.email !== editingMember.email) body.email = memberEditData.email;
      if (memberEditData.password) body.password = memberEditData.password;
      if (memberEditData.full_name !== editingMember.full_name) body.full_name = memberEditData.full_name;
      if (memberEditData.phone !== editingMember.phone) body.phone = memberEditData.phone;
      if (memberEditData.role !== editingMember.role) body.role = memberEditData.role;

      const { data, error } = await supabase.functions.invoke("update-funeraria-member", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Membro atualizado" });
      setEditingMember(null);
      loadData();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setSavingMember(false);
    }
  };

  const handleValidateDoc = async (docId: string) => {
    setValidatingDocId(docId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase.from("funeraria_docs").update({ estado_validacao: "valido", observacoes: null }).eq("id", docId);
      if (error) throw error;
      await supabase.from("audit_logs").insert({ actor_id: user.id, entidade: "funeraria_doc", entidade_id: docId, acao: "validated", detalhes: { estado: "valido" } });
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
      await supabase.from("funerarias").update({ status: "ativo" }).eq("id", id);
      await supabase.from("audit_logs").insert({ actor_id: user.id, entidade: "funeraria", entidade_id: id, acao: "approved", detalhes: { status: "ativo" } });
      try { await supabase.functions.invoke("notify-funeraria-activation", { body: { funeraria_id: id } }); } catch {}
      toast({ title: "Funerária aprovada", description: "Conta ativada e funerária notificada" });
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
      await supabase.from("funerarias").update({ status: "rejeitado", motivo_rejeicao: motivo }).eq("id", id);
      await supabase.from("audit_logs").insert({ actor_id: user.id, entidade: "funeraria", entidade_id: id, acao: "rejected", detalhes: { motivo } });
      toast({ title: "Funerária rejeitada" });
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
      await supabase.from("funeraria_docs").update({ estado_validacao: "invalido", observacoes: motivo }).eq("id", selectedDoc);
      await supabase.from("audit_logs").insert({ actor_id: user.id, entidade: "funeraria", entidade_id: id!, acao: "pedido_correcao", detalhes: { motivo, document_type: documentType, doc_id: selectedDoc } });
      
      const { data: notifyResult, error: notifyError } = await supabase.functions.invoke("notify-funeraria-correction", { body: { funeraria_id: id, document_type: documentType, motivo } });
      if (notifyError) {
        console.error("Erro ao notificar:", notifyError);
        toast({ title: "Correção registada", description: "A correção foi registada mas houve um erro ao notificar a funerária.", variant: "default" });
      } else {
        toast({ title: "Correção solicitada", description: "A funerária foi notificada" });
      }
      
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
      const { data, error } = await supabase.storage.from("funeraria-docs").download(doc.ficheiro_path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.ficheiro_path.split("/").pop() || "document";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Erro", description: "Erro ao descarregar documento", variant: "destructive" });
    }
  };

  if (loading) return <p>A carregar...</p>;
  if (!funeraria) return <p>Funerária não encontrada</p>;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{funeraria.nome_comercial}</h1>
            <Badge className="mt-2">{funeraria.status}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/funerarias")}>
              Voltar
            </Button>
          </div>
        </div>

        {/* Editar Dados */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Editar Dados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome Comercial</Label>
              <Input value={editNomeComercial} onChange={(e) => setEditNomeComercial(e.target.value)} />
            </div>
            <div>
              <Label>NIF</Label>
              <Input value={editNif} onChange={(e) => setEditNif(e.target.value)} />
            </div>
            <div>
              <Label>Responsável</Label>
              <Input value={editResponsavel} onChange={(e) => setEditResponsavel(e.target.value)} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={editTelefone} onChange={(e) => setEditTelefone(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveData} disabled={savingData}>
              {savingData ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Dados
            </Button>
          </div>
        </Card>

        {/* Credenciais de Acesso (owner) */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Credenciais de Acesso (Proprietário)</h2>
          {userEmail && (
            <p className="text-sm text-muted-foreground mb-4">
              Email atual: <span className="font-medium text-foreground">{userEmail}</span>
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Novo email" />
            </div>
            <div>
              <Label>Nova Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Deixe vazio para manter" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveCredentials} disabled={savingCredentials || (!newPassword && newEmail === userEmail)}>
              {savingCredentials ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Atualizar Credenciais
            </Button>
          </div>
        </Card>

        {/* Utilizadores / Membros */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Utilizadores</h2>
          </div>
          {members.length === 0 ? (
            <p className="text-muted-foreground">Sem membros registados</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{member.full_name || "Sem nome"}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.phone && <p className="text-sm text-muted-foreground">{member.phone}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                      {member.role === "admin" ? "Admin" : "Editor"}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => handleEditMember(member)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Declarações e Datas */}
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
              <p className="font-medium">{new Date(funeraria.created_at).toLocaleDateString("pt-PT")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Atualização</p>
              <p className="font-medium">{new Date(funeraria.updated_at).toLocaleDateString("pt-PT")}</p>
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
                    {doc.numero_documento && <p className="text-sm text-muted-foreground">Nº {doc.numero_documento}</p>}
                    {doc.codigo_acesso && <p className="text-sm text-muted-foreground">Código: {maskCodigo(doc.codigo_acesso)}</p>}
                    {doc.observacoes && <p className="text-sm text-destructive mt-1">{doc.observacoes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={doc.estado_validacao === "valido" ? "default" : doc.estado_validacao === "invalido" ? "destructive" : "secondary"}>
                    {getEstadoLabel(doc.estado_validacao)}
                  </Badge>
                  {doc.estado_validacao !== "valido" && (
                    <Button size="sm" variant="outline" onClick={() => handleValidateDoc(doc.id)} disabled={validatingDocId === doc.id}>
                      {validatingDocId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-1" />Validar</>}
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

        {/* Ações */}
        {(funeraria.status === "pendente" || funeraria.status === "correção_pendente") && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ações</h2>
            <div className="flex gap-3">
              <Button onClick={() => setShowApproveDialog(true)} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />Aprovar e Ativar
              </Button>
              <Button variant="outline" onClick={() => setShowRequestChangesDialog(true)} className="flex-1">
                Pedir Correção
              </Button>
              <Button variant="destructive" onClick={() => setShowRejectDialog(true)} className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />Rejeitar
              </Button>
            </div>
          </Card>
        )}

        {/* Histórico de Comunicações */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Histórico de Comunicações e Auditoria</h2>
          {auditLogs.length === 0 ? (
            <p className="text-muted-foreground">Sem histórico</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => {
                const detalhes = log.detalhes as any;
                const isCorrection = log.acao === "pedido_correcao" || log.acao === "request_changes";
                const isRejection = log.acao === "rejected";
                return (
                  <div key={log.id} className={`text-sm border rounded-lg p-3 ${isCorrection ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20" : isRejection ? "border-red-300 bg-red-50 dark:bg-red-950/20" : "border-border"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{getAcaoLabel(log.acao)}</span>
                      <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString("pt-PT")}</span>
                    </div>
                    {detalhes?.document_type && (
                      <p className="text-muted-foreground">Documento: <span className="font-medium text-foreground">{detalhes.document_type}</span></p>
                    )}
                    {(detalhes?.motivo || detalhes?.status) && (
                      <p className="text-muted-foreground mt-1">
                        {detalhes.motivo ? <>Mensagem: <span className="text-foreground">{detalhes.motivo}</span></> : null}
                        {detalhes.status && !detalhes.motivo ? <>Status: <span className="text-foreground">{detalhes.status}</span></> : null}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Dialogs ── */}

      {/* Delete */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar funerária</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar permanentemente <strong>{funeraria.nome_comercial}</strong>? Esta ação não pode ser revertida. Todos os documentos e membros associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFuneraria} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Funerária</DialogTitle>
            <DialogDescription>Tem a certeza que deseja aprovar e ativar esta funerária?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancelar</Button>
            <Button onClick={handleApprove}>Aprovar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Funerária</DialogTitle>
            <DialogDescription>Indique o motivo da rejeição</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Motivo *</Label>
              <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Descreva o motivo..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!motivo.trim()}>Rejeitar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes */}
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
                <SelectTrigger><SelectValue placeholder="Selecione um documento" /></SelectTrigger>
                <SelectContent>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>{getTipoLabel(doc.tipo)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Motivo *</Label>
              <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Descreva..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestChangesDialog(false)}>Cancelar</Button>
            <Button onClick={handleRequestChanges} disabled={!selectedDoc || !motivo.trim()}>Enviar Pedido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Membro</DialogTitle>
            <DialogDescription>Altere os dados e o papel deste utilizador</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={memberEditData.full_name} onChange={(e) => setMemberEditData({ ...memberEditData, full_name: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={memberEditData.email} onChange={(e) => setMemberEditData({ ...memberEditData, email: e.target.value })} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={memberEditData.phone} onChange={(e) => setMemberEditData({ ...memberEditData, phone: e.target.value })} />
            </div>
            <div>
              <Label>Nova Password</Label>
              <Input type="password" value={memberEditData.password} onChange={(e) => setMemberEditData({ ...memberEditData, password: e.target.value })} placeholder="Deixe vazio para manter" />
            </div>
            <div>
              <Label>Papel</Label>
              <Select value={memberEditData.role} onValueChange={(v) => setMemberEditData({ ...memberEditData, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>Cancelar</Button>
            <Button onClick={handleSaveMember} disabled={savingMember}>
              {savingMember ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {funeraria && <EnhancedChatButton funerariaId={funeraria.id} userType="admin" />}
    </>
  );
}

function getAcaoLabel(acao: string) {
  const labels: Record<string, string> = {
    pedido_correcao: "📝 Pedido de Correção",
    request_changes: "📝 Pedido de Correção",
    approved: "✅ Aprovação",
    rejected: "❌ Rejeição",
    validated: "✓ Documento Validado",
    deleted: "🗑️ Eliminação",
    desativacao: "⏸️ Desativação",
    ativacao: "▶️ Ativação",
  };
  return labels[acao] || acao;
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
