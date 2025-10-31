import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Building2, User as UserIcon, Trash2 } from "lucide-react";
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

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role?: string;
  funeraria_nome?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filter, setFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    loadUsers();
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

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Get all funerarias
      const { data: funerarias, error: funerariasError } = await supabase
        .from("funerarias")
        .select("user_id, nome_comercial");

      if (funerariasError) throw funerariasError;

      // Get all profiles (which connects to auth.users via id)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id");

      if (profilesError) throw profilesError;

      // Build user list
      const usersMap = new Map<string, UserWithRole>();

      // Add users from user_roles
      userRoles?.forEach((ur) => {
        if (!usersMap.has(ur.user_id)) {
          usersMap.set(ur.user_id, {
            id: ur.user_id,
            email: "",
            created_at: "",
            role: ur.role,
          });
        } else {
          usersMap.get(ur.user_id)!.role = ur.role;
        }
      });

      // Add funeraria info
      funerarias?.forEach((f) => {
        if (usersMap.has(f.user_id)) {
          usersMap.get(f.user_id)!.funeraria_nome = f.nome_comercial;
        }
      });

      // Filter based on selection
      let filteredUsers = Array.from(usersMap.values());
      
      if (filter === "admin") {
        filteredUsers = filteredUsers.filter((u) => u.role === "admin");
      } else if (filter === "funeraria") {
        filteredUsers = filteredUsers.filter((u) => u.role === "funeraria");
      }

      setUsers(filteredUsers);
    } catch (error) {
      console.error("Erro ao carregar utilizadores:", error);
      toast.error("Erro ao carregar utilizadores");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      // Delete user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", deleteUserId);

      if (roleError) throw roleError;

      toast.success("Utilizador removido com sucesso");
      setDeleteUserId(null);
      loadUsers();
    } catch (error) {
      console.error("Erro ao remover utilizador:", error);
      toast.error("Erro ao remover utilizador");
    }
  };

  const getRoleIcon = (role?: string) => {
    if (role === "admin") return <Shield className="h-4 w-4" />;
    if (role === "funeraria") return <Building2 className="h-4 w-4" />;
    return <UserIcon className="h-4 w-4" />;
  };

  const getRoleBadge = (role?: string) => {
    if (role === "admin") return <Badge variant="default">Admin</Badge>;
    if (role === "funeraria") return <Badge variant="secondary">Funerária</Badge>;
    return <Badge variant="outline">Utilizador</Badge>;
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Utilizadores</h1>
          <p className="text-muted-foreground">
            Gerir permissões e informação dos utilizadores
          </p>
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="admin">Administradores</TabsTrigger>
            <TabsTrigger value="funeraria">Funerárias</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <Card className="p-8 text-center">
            <p>A carregar...</p>
          </Card>
        ) : users.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum utilizador encontrado
            </p>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Funerária</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        {getRoleBadge(user.role)}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {user.funeraria_nome || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteUserId(user.id)}
                        disabled={user.role === "admin"}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja remover este utilizador? Esta ação irá remover as permissões mas não elimina a conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
