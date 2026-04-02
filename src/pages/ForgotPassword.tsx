import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo-memoralis.svg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique a sua caixa de entrada para redefinir a palavra-passe.",
      });
    } catch (error: any) {
      console.error("Erro ao solicitar reset:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src={logo} alt="Memoralis" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Recuperar Palavra-passe</h1>
          <p className="text-sm text-muted-foreground">
            {emailSent
              ? "Verifique o seu email para continuar"
              : "Introduza o seu email para receber as instruções"}
          </p>
        </div>

        {emailSent ? (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
              <p className="text-sm">
                Enviámos um email para <strong>{email}</strong> com as
                instruções para redefinir a sua palavra-passe.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao login
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
            >
              Reenviar email
            </Button>
          </div>
        ) : (
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "A enviar..." : "Enviar instruções"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao login
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
