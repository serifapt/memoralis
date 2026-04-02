import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-memoralis.svg";
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
      // Use the atomic backend function for registration
      const fnResult = await supabase.functions.invoke("register-funeraria", {
        body: {
          email: data.email,
          password: data.password,
          nome_comercial: data.nome_comercial,
          nif: data.nif,
          telefone: data.telefone,
          responsavel_nome: data.responsavel_nome,
          declaro_representacao_legal: data.declaro_representacao_legal,
          aceito_termos: data.aceito_termos,
          certidao: {
            tipo: certidaoData.tipo,
            codigo_acesso: certidaoData.codigo_acesso,
          },
        },
      });

      if (fnResult.error) {
        // Supabase returns a generic message for non-2xx; try to extract the real error from the response body.
        let message = fnResult.error.message || "Erro no registo";

        try {
          const res = fnResult.response;
          if (res) {
            const contentType = (res.headers.get("Content-Type") || "").split(";")[0].trim();
            const parsed =
              contentType === "application/json"
                ? await res.clone().json()
                : await res.clone().text();

            if (typeof parsed === "string" && parsed.trim()) {
              message = parsed;
            } else if (
              parsed &&
              typeof parsed === "object" &&
              "error" in parsed &&
              typeof (parsed as any).error === "string"
            ) {
              message = (parsed as any).error;
            }
          }
        } catch {
          // ignore parsing errors and fallback to generic message
        }

        throw new Error(message);
      }

      const result = fnResult.data as any;

      if (!result?.success) {
        throw new Error(result?.error || "Erro no registo");
      }

      const funerariaId = result.funeraria_id;

      // Handle file upload separately if needed
      if (certidaoData.tipo === "upload" && certidaoData.file && funerariaId) {
        const fileExt = certidaoData.file.name.split(".").pop();
        const fileName = `${funerariaId}/certidao_permanente_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("funeraria-docs")
          .upload(fileName, certidaoData.file);

        if (uploadError) {
          console.error("Erro no upload da certidão:", uploadError);
          // Don't fail the registration, just log the error
        } else {
          // Create the document record
          const { error: docError } = await supabase
            .from("funeraria_docs")
            .insert({
              funeraria_id: funerariaId,
              tipo: "certidao_permanente_upload",
              ficheiro_path: fileName,
              entidade_emissora: "Conservatória do Registo Comercial",
            });

          if (docError) {
            console.error("Erro ao criar registo do documento:", docError);
          }
        }
      }

      // Sign in the user after successful registration
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

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
            onClick={() => navigate("/login")}
          >
            Já tem conta? Entrar
          </Button>
        </div>
      </Card>
    </div>
  );
}
