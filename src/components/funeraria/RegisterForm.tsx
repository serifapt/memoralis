import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fase1Schema, Fase1Data } from "@/lib/validation";

interface RegisterFormProps {
  onSubmit: (data: Fase1Data, certidaoData: CertidaoData) => void;
  isSubmitting: boolean;
}

interface CertidaoData {
  tipo: "upload" | "codigo";
  file?: File;
  codigo_acesso?: string;
}

export function RegisterForm({ onSubmit, isSubmitting }: RegisterFormProps) {
  const [certidaoData, setCertidaoData] = useState<CertidaoData | null>(null);
  const [certidaoTipo, setCertidaoTipo] = useState<"upload" | "codigo">("codigo");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Fase1Data>({
    resolver: zodResolver(fase1Schema),
  });

  const declaro = watch("declaro_representacao_legal");
  const aceito = watch("aceito_termos");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("Ficheiro demasiado grande. Máximo 10 MB.");
        return;
      }
      setCertidaoData({ tipo: "upload", file: selectedFile });
    }
  };

  const handleCodigoChange = (codigo: string) => {
    if (codigo.trim()) {
      setCertidaoData({ tipo: "codigo", codigo_acesso: codigo });
    } else {
      setCertidaoData(null);
    }
  };

  const handleFormSubmit = (data: Fase1Data) => {
    if (!certidaoData) {
      alert("Por favor, forneça a certidão permanente (upload ou código de acesso)");
      return;
    }
    onSubmit(data, certidaoData);
  };

  const canSubmit = certidaoData !== null;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Dados Básicos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Dados da Funerária</h2>
        
        <div className="space-y-2">
          <Label htmlFor="nome_comercial">Nome da Funerária *</Label>
          <Input
            id="nome_comercial"
            {...register("nome_comercial")}
            placeholder="Ex: Funerária Santos, Lda"
          />
          {errors.nome_comercial && (
            <p className="text-sm text-destructive">{errors.nome_comercial.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nif">NIF *</Label>
            <Input
              id="nif"
              {...register("nif")}
              placeholder="123456789"
              maxLength={9}
            />
            {errors.nif && (
              <p className="text-sm text-destructive">{errors.nif.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              {...register("telefone")}
              placeholder="+351 912 345 678"
            />
            {errors.telefone && (
              <p className="text-sm text-destructive">{errors.telefone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsavel_nome">Nome do Responsável *</Label>
          <Input
            id="responsavel_nome"
            {...register("responsavel_nome")}
            placeholder="Nome completo"
          />
          {errors.responsavel_nome && (
            <p className="text-sm text-destructive">{errors.responsavel_nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (para login) *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="seu@email.pt"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <PasswordInput
              id="password"
              {...register("password")}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Password *</Label>
            <PasswordInput
              id="confirmPassword"
              {...register("confirmPassword")}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Certidão Permanente */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Certidão Permanente</h2>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Forneça a certidão permanente através de upload (PDF, JPG, PNG - máx. 10 MB) ou código de acesso.
          </AlertDescription>
        </Alert>

        <Card className="p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Certidão Permanente *
          </h3>
          <Tabs 
            defaultValue="codigo" 
            value={certidaoTipo}
            onValueChange={(value) => {
              setCertidaoTipo(value as "upload" | "codigo");
              setCertidaoData(null);
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="codigo">Código de Acesso</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="codigo" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código de Acesso</Label>
                <Input
                  id="codigo"
                  onChange={(e) => handleCodigoChange(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                />
              </div>
              {certidaoData?.tipo === "codigo" && (
                <p className="text-sm text-green-600">✓ Código guardado</p>
              )}
            </TabsContent>
            
            <TabsContent value="upload" className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {certidaoData?.tipo === "upload" && (
                    <span className="text-green-600">✓</span>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Termos e Condições */}
      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="declaro_representacao_legal"
            checked={declaro}
            onCheckedChange={(checked) =>
              setValue("declaro_representacao_legal", checked as boolean)
            }
          />
          <label
            htmlFor="declaro_representacao_legal"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Confirmo que represento legalmente esta entidade *
          </label>
        </div>
        {errors.declaro_representacao_legal && (
          <p className="text-sm text-destructive">{errors.declaro_representacao_legal.message}</p>
        )}

        <div className="flex items-start space-x-2">
          <Checkbox
            id="aceito_termos"
            checked={aceito}
            onCheckedChange={(checked) =>
              setValue("aceito_termos", checked as boolean)
            }
          />
          <label
            htmlFor="aceito_termos"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Aceito os Termos e a Política de Privacidade *
          </label>
        </div>
        {errors.aceito_termos && (
          <p className="text-sm text-destructive">{errors.aceito_termos.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={!canSubmit || isSubmitting}
      >
        {isSubmitting ? "A submeter..." : "Submeter para verificação"}
      </Button>
    </form>
  );
}
