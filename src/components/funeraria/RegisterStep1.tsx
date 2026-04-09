import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { fase1Schema, Fase1Data } from "@/lib/validation";

interface RegisterStep1Props {
  onComplete: (data: Fase1Data) => void;
}

export function RegisterStep1({ onComplete }: RegisterStep1Props) {
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

  return (
    <form onSubmit={handleSubmit(onComplete)} className="space-y-4">
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

      <div className="space-y-4 pt-4">
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

      <Button type="submit" className="w-full">
        Continuar
      </Button>
    </form>
  );
}
