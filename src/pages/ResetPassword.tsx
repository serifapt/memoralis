import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo-memoralis.png";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a valid session from password recovery
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if this is a password recovery session
      if (session) {
        setIsValidToken(true);
      } else {
        toast({
          title: "Link inválido ou expirado",
          description: "Solicite um novo link de recuperação de palavra-passe.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/forgot-password"), 2000);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidToken(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "A palavra-passe deve ter pelo menos 8 caracteres";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "A palavra-passe deve conter pelo menos uma letra maiúscula";
    }
    if (!/[a-z]/.test(pwd)) {
      return "A palavra-passe deve conter pelo menos uma letra minúscula";
    }
    if (!/[0-9]/.test(pwd)) {
      return "A palavra-passe deve conter pelo menos um número";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As palavras-passe não coincidem.",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "Palavra-passe fraca",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast({
        title: "Palavra-passe atualizada!",
        description: "A sua palavra-passe foi redefinida com sucesso.",
      });

      // Sign out and redirect to login
      await supabase.auth.signOut();
      setTimeout(() => navigate("/auth"), 1000);
    } catch (error: any) {
      console.error("Erro ao redefinir palavra-passe:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-4">
            <img src={logo} alt="Memoralis" className="h-12 mx-auto mb-4" />
            <p className="text-muted-foreground">A verificar token...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src={logo} alt="Memoralis" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Nova Palavra-passe</h1>
          <p className="text-sm text-muted-foreground">
            Escolha uma palavra-passe segura para a sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova palavra-passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Mínimo 8 caracteres, com maiúsculas, minúsculas e números
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar palavra-passe</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "A processar..." : "Redefinir palavra-passe"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
