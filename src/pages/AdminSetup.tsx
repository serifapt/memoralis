import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminSetup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // If sign in fails, try to create account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) throw signUpError;
        if (!signUpData.user) throw new Error("Erro ao criar utilizador");

        // Insert admin role for new user
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: signUpData.user.id,
            role: "admin",
          });

        if (roleError) throw roleError;
      } else {
        // User exists, check if already has admin role
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", signInData.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!existingRole) {
          // Add admin role
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
              user_id: signInData.user.id,
              role: "admin",
            });

          if (roleError) throw roleError;
        }

        await supabase.auth.signOut();
      }

      toast({
        title: "Admin configurado com sucesso",
        description: "Pode agora fazer login como administrador",
      });

      navigate("/admin/auth");
    } catch (error: any) {
      toast({
        title: "Erro ao configurar admin",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("reset-admin-password", {
        body: {
          email: resetEmail,
          newPassword: newPassword,
          setupKey: setupKey,
        },
      });

      if (error) throw error;

      toast({
        title: "Password atualizada",
        description: "Pode agora fazer login com a nova password",
      });

      navigate("/admin/auth");
    } catch (error: any) {
      toast({
        title: "Erro ao resetar password",
        description: error.message,
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
            Setup Administrativo
          </CardTitle>
          <CardDescription className="text-center">
            Configure ou redefina o acesso de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Criar Admin</TabsTrigger>
              <TabsTrigger value="reset">Reset Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Nome Completo
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nome do administrador"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
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
                    placeholder="Password segura"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "A criar..." : "Criar Admin"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="reset">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="resetEmail" className="text-sm font-medium">
                    Email do Admin
                  </label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="admin@memoralis.pt"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    Nova Password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Nova password segura"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="setupKey" className="text-sm font-medium">
                    Chave de Setup
                  </label>
                  <Input
                    id="setupKey"
                    type="text"
                    placeholder="memoralis-setup-2025"
                    value={setupKey}
                    onChange={(e) => setSetupKey(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use: memoralis-setup-2025
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Key className="w-4 h-4 mr-2" />
                  {loading ? "A resetar..." : "Resetar Password"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
