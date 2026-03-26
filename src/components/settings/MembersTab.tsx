import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Shield, Edit3, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

interface Member {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: { full_name: string | null; } | null;
  email?: string;
}

interface MembersTabProps {
  funerariaId: string;
}

export function MembersTab({ funerariaId }: MembersTabProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor">("editor");
  const [inviting, setInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
    loadCurrentUser();
  }, [funerariaId]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("funeraria_members")
        .select("id, user_id, role, created_at")
        .eq("funeraria_id", funerariaId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles for each member
      const memberIds = (data || []).map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", memberIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const enriched = (data || []).map((m) => ({
        ...m,
        profile: profileMap.get(m.user_id) || null,
      }));

      setMembers(enriched);
    } catch (err) {
      console.error("Error loading members:", err);
      toast.error("Erro ao carregar membros");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Introduza o email do utilizador");
      return;
    }

    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-funeraria-member", {
        body: {
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
          funeraria_id: funerariaId,
          full_name: inviteName.trim() || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(data.message || "Utilizador convidado com sucesso");
      setInviteEmail("");
      setInviteName("");
      setInviteRole("editor");
      setShowInviteForm(false);
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Erro ao convidar utilizador");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async () => {
    if (!memberToDelete) return;

    try {
      const { error } = await supabase
        .from("funeraria_members")
        .delete()
        .eq("id", memberToDelete.id);

      if (error) throw error;

      toast.success("Membro removido com sucesso");
      setMemberToDelete(null);
      setDeleteDialogOpen(false);
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover membro");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("funeraria_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;
      toast.success("Permissão atualizada");
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar permissão");
    }
  };

  const roleLabel = (role: string) => role === "admin" ? "Administrador" : "Editor";
  const roleBadgeColor = (role: string) =>
    role === "admin" ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-700";

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-archivo font-semibold text-foreground">
            Utilizadores da Funerária
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Gerir quem tem acesso ao painel da funerária
          </p>
        </div>
        <Button onClick={() => setShowInviteForm(!showInviteForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Convidar Utilizador
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card className="p-4 mb-6 border-dashed">
          <h4 className="font-semibold mb-3">Convidar Novo Utilizador</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invite-email">Email *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="email@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="invite-name">Nome</Label>
              <Input
                id="invite-name"
                placeholder="Nome completo"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="invite-role">Permissão</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "editor")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador — acesso total</SelectItem>
                  <SelectItem value="editor">Editor — sem configurações e orçamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleInvite} disabled={inviting}>
              {inviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Convidar
            </Button>
            <Button variant="outline" onClick={() => setShowInviteForm(false)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Members List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : members.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum membro encontrado.</p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const isCurrentUser = member.user_id === currentUserId;
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {member.role === "admin" ? (
                      <Shield className="w-4 h-4 text-primary" />
                    ) : (
                      <Edit3 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {member.profile?.full_name || "Sem nome"}
                      {isCurrentUser && (
                        <span className="text-muted-foreground ml-1">(você)</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCurrentUser ? (
                    <Badge className={roleBadgeColor(member.role)}>
                      {roleLabel(member.role)}
                    </Badge>
                  ) : (
                    <Select
                      value={member.role}
                      onValueChange={(v) => handleRoleChange(member.id, v)}
                    >
                      <SelectTrigger className="w-[160px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {!isCurrentUser && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setMemberToDelete(member);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro?</AlertDialogTitle>
            <AlertDialogDescription>
              O utilizador {memberToDelete?.profile?.full_name || ""} perderá acesso ao painel da funerária.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-destructive text-destructive-foreground">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
