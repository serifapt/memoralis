import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

function withTimeout<T>(promise: PromiseLike<T>, ms: number, label = "Pedido"): Promise<T> {
  return Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_resolve, reject) =>
      setTimeout(() => reject(new Error(`${label} sem resposta. Tente novamente.`)), ms)
    ),
  ]);
}

export default function AdminAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is admin
        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (rolesError) {
          console.error("Erro ao verificar permissões (admin):", rolesError);
          return;
        }

        const isAdmin = (roles ?? []).some((r) => r.role === "admin");
        if (isAdmin) {
          navigate("/admin/funerarias");
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (rolesError) {
          console.error("Erro ao verificar permissões (admin):", rolesError);
          return;
        }

        const isAdmin = (roles ?? []).some((r) => r.role === "admin");
        if (isAdmin) {
          navigate("/admin/funerarias");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        15000,
        "Login",
      );

      if (error) throw error;
      if (!data.user) throw new Error("Não foi possível obter o utilizador autenticado.");

      // Check if user is admin
      const { data: roles, error: rolesError } = await withTimeout(
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id),
        15000,
        "Verificação de permissões",
      );

      if (rolesError) throw rolesError;

      const isAdmin = (roles ?? []).some((r) => r.role === "admin");

      if (!isAdmin) {
        await supabase.auth.signOut();
        toast({
          title: "Acesso Negado",
          description: "Não tem permissões de administrador",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login efetuado com sucesso",
        description: "Bem-vindo ao painel de administração",
      });

      navigate("/admin/funerarias");
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error?.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Painel de Administração
          </CardTitle>
          <CardDescription className="text-center">
            Acesso restrito a administradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@memoralis.pt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "A entrar..." : "Entrar"}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm"
                onClick={() => navigate('/forgot-password')}
              >
                Esqueceu a palavra-passe?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
