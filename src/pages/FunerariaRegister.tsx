import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-memoralis.png";
import { RegisterForm } from "@/components/funeraria/RegisterForm";
import { Fase1Data } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

interface CertidaoData {
  tipo: "upload" | "codigo";
  file?: File;
  codigo_acesso?: string;
}

export default function FunerariaRegister() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (data: Fase1Data, certidaoData: CertidaoData) => {
    setIsSubmitting(true);
    
    try {
      // 1. Criar conta de autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar utilizador");

      // 2. Criar perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          full_name: data.responsavel_nome,
          phone: data.telefone,
        });

      if (profileError) throw profileError;

      // 3. Atribuir role de funeraria
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "funeraria",
        });

      if (roleError) throw roleError;

      // 4. Criar registo de funerária
      const { data: funerariaData, error: funerariaError } = await supabase
        .from("funerarias")
        .insert({
          user_id: authData.user.id,
          nome_comercial: data.nome_comercial,
          nif: data.nif,
          responsavel_nome: data.responsavel_nome,
          telefone: data.telefone,
          declaro_representacao_legal: data.declaro_representacao_legal,
          aceito_termos: data.aceito_termos,
          status: "pendente",
        })
        .select()
        .single();

      if (funerariaError) throw funerariaError;

      // 5. Criar registo da certidão permanente
      if (certidaoData.tipo === "upload" && certidaoData.file) {
        // Upload do ficheiro
        const fileExt = certidaoData.file.name.split(".").pop();
        const fileName = `${funerariaData.id}/certidao_permanente_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("funeraria-docs")
          .upload(fileName, certidaoData.file);

        if (uploadError) throw uploadError;

        // Criar registo do documento
        const { error: docError } = await supabase
          .from("funeraria_docs")
          .insert({
            funeraria_id: funerariaData.id,
            tipo: "certidao_permanente",
            ficheiro_path: fileName,
            entidade_emissora: "Conservatória do Registo Comercial",
          });

        if (docError) throw docError;
      } else if (certidaoData.tipo === "codigo" && certidaoData.codigo_acesso) {
        // Criar registo com código de acesso
        const { error: docError } = await supabase
          .from("funeraria_docs")
          .insert({
            funeraria_id: funerariaData.id,
            tipo: "certidao_permanente",
            codigo_acesso: certidaoData.codigo_acesso,
            entidade_emissora: "Conservatória do Registo Comercial",
          });

        if (docError) throw docError;
      }

      toast({
        title: "Registo enviado com sucesso!",
        description: "Recebemos o seu registo. Validaremos os documentos em breve.",
      });

      navigate("/funeraria/status");
    } catch (error: any) {
      console.error("Erro no registo:", error);
      toast({
        title: "Erro no registo",
        description: error.message || "Ocorreu um erro ao processar o registo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <img src={logo} alt="Memoralis" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Registo de Funerária</h1>
          <p className="text-sm text-muted-foreground">
            Sistema de Gestão Funerária
          </p>
        </div>

        <RegisterForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/auth")}
          >
            Já tem conta? Entrar
          </Button>
        </div>
      </Card>
    </div>
  );
}
