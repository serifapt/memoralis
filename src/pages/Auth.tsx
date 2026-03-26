import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-memoralis.svg";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in and redirect based on role
    const checkSessionAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Check user role and redirect accordingly
          const [adminRes, funerariaRes, technicianRes] = await Promise.all([
            supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }),
            supabase.rpc("has_role", { _user_id: session.user.id, _role: "funeraria" }),
            supabase.rpc("has_role", { _user_id: session.user.id, _role: "technician" }),
          ]);

          const roleError = adminRes.error || funerariaRes.error || technicianRes.error;
          if (roleError) {
            console.error("Erro ao verificar permissões:", roleError);
            // Fail closed
            await supabase.auth.signOut();
            toast({
              title: "Sessão inválida",
              description: "Não foi possível validar as permissões. Tente novamente.",
              variant: "destructive",
            });
            return;
          }

          const isAdmin = Boolean(adminRes.data);
          const isFuneraria = Boolean(funerariaRes.data);
          const isTechnician = Boolean(technicianRes.data);

          if (isAdmin) {
            navigate("/admin/funerarias");
          } else if (isFuneraria) {
            navigate("/dashboard");
          } else if (isTechnician) {
            navigate("/field/tasks");
          } else {
            // User has no roles - orphan user, logout
            console.warn("User has no roles, signing out orphan session");
            await supabase.auth.signOut();
            toast({
              title: "Sessão inválida",
              description: "A sua conta não está correctamente configurada. Por favor, contacte o suporte.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setCheckingSession(false);
      }
    };
    checkSessionAndRedirect();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") {
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(() => {
          checkSessionAndRedirect();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  // Helper function to redirect based on role
  const redirectBasedOnRole = async (userId: string) => {
    const [adminRes, funerariaRes, technicianRes] = await Promise.all([
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: userId, _role: "funeraria" }),
      supabase.rpc("has_role", { _user_id: userId, _role: "technician" }),
    ]);

    const roleError = adminRes.error || funerariaRes.error || technicianRes.error;
    if (roleError) {
      console.error("Erro ao verificar permissões:", roleError);
      await supabase.auth.signOut();
      toast({
        title: "Conta sem permissões",
        description: "Não foi possível validar as permissões. Contacte o suporte.",
        variant: "destructive",
      });
      return;
    }

    const isAdmin = Boolean(adminRes.data);
    const isFuneraria = Boolean(funerariaRes.data);
    const isTechnician = Boolean(technicianRes.data);

    if (isAdmin) {
      navigate("/admin/funerarias");
    } else if (isFuneraria) {
      navigate("/dashboard");
    } else if (isTechnician) {
      navigate("/field/tasks");
    } else {
      // No valid role, sign out
      console.warn("User logged in but has no valid role");
      await supabase.auth.signOut();
      toast({
        title: "Conta sem permissões",
        description: "A sua conta não tem permissões válidas. Contacte o suporte.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });

      // Redirect based on user role
      if (data.user) {
        await redirectBasedOnRole(data.user.id);
      }
    } catch (error: any) {
      console.error("Erro de autenticação:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">A verificar sessão...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src={logo} alt="Memoralis" className="h-12 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Sistema de Gestão Funerária
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.pt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Palavra-passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "A processar..." : "Entrar"}
          </Button>

          <div className="text-center space-y-2">
            <Button
              type="button"
              variant="link"
              className="text-sm w-full"
              onClick={() => navigate('/forgot-password')}
            >
              Esqueceu a palavra-passe?
            </Button>
            
            <Button
              type="button"
              variant="link"
              className="text-sm w-full"
              onClick={() => navigate('/funeraria/register')}
            >
              Registar Funerária
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
