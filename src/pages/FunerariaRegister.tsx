import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-memoralis.png";
import { RegisterStep1 } from "@/components/funeraria/RegisterStep1";
import { RegisterStep2 } from "@/components/funeraria/RegisterStep2";
import { Fase1Data } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

export default function FunerariaRegister() {
  const [currentStep, setCurrentStep] = useState(2);
  const [fase1Data, setFase1Data] = useState<Fase1Data | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStep1Complete = (data: Fase1Data) => {
    setFase1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Complete = async (documents: any[]) => {
    if (!fase1Data) return;

    setIsSubmitting(true);
    
    try {
      // 1. Criar conta de autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: fase1Data.email,
        password: fase1Data.password,
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
          full_name: fase1Data.responsavel_nome,
          phone: fase1Data.telefone,
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
          nome_comercial: fase1Data.nome_comercial,
          nif: fase1Data.nif,
          responsavel_nome: fase1Data.responsavel_nome,
          telefone: fase1Data.telefone,
          declaro_representacao_legal: fase1Data.declaro_representacao_legal,
          aceito_termos: fase1Data.aceito_termos,
          status: "pendente",
        })
        .select()
        .single();

      if (funerariaError) throw funerariaError;

      // 5. Fazer upload dos documentos e criar registos
      for (const doc of documents) {
        if (doc.file) {
          // Upload do ficheiro
          const fileExt = doc.file.name.split(".").pop();
          const fileName = `${funerariaData.id}/${doc.tipo}_${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from("funeraria-docs")
            .upload(fileName, doc.file);

          if (uploadError) throw uploadError;

          // Criar registo do documento
          const { error: docError } = await supabase
            .from("funeraria_docs")
            .insert({
              funeraria_id: funerariaData.id,
              tipo: doc.tipo,
              ficheiro_path: fileName,
              numero_documento: doc.numero_documento,
              entidade_emissora: doc.entidade_emissora,
              data_emissao: doc.data_emissao,
              data_validade: doc.data_validade,
            });

          if (docError) throw docError;
        } else if (doc.codigo_acesso) {
          // Criar registo com código de acesso
          const { error: docError } = await supabase
            .from("funeraria_docs")
            .insert({
              funeraria_id: funerariaData.id,
              tipo: doc.tipo,
              codigo_acesso: doc.codigo_acesso,
              numero_documento: doc.numero_documento,
              entidade_emissora: doc.entidade_emissora,
              data_emissao: doc.data_emissao,
              data_validade: doc.data_validade,
            });

          if (docError) throw docError;
        }
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

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Passo {currentStep} de 2
            </span>
            <span className="text-sm text-muted-foreground">
              {currentStep === 1 ? "Dados Básicos" : "Documentos"}
            </span>
          </div>
          <Progress value={currentStep * 50} />
        </div>

        {currentStep === 1 && (
          <RegisterStep1 onComplete={handleStep1Complete} />
        )}

        {currentStep === 2 && (
          <RegisterStep2 
            onComplete={handleStep2Complete}
            onBack={() => setCurrentStep(1)}
            isSubmitting={isSubmitting}
          />
        )}

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
