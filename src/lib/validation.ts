import { z } from "zod";

// Validador de NIF português
export function validateNIF(nif: string): boolean {
  if (!/^\d{9}$/.test(nif)) return false;
  
  const checkDigit = parseInt(nif.charAt(8));
  let sum = 0;
  
  for (let i = 0; i < 8; i++) {
    sum += parseInt(nif.charAt(i)) * (9 - i);
  }
  
  const mod = sum % 11;
  const expectedCheckDigit = mod < 2 ? 0 : 11 - mod;
  
  return checkDigit === expectedCheckDigit;
}

// Schema para Fase 1 - Dados Básicos
export const fase1Schema = z.object({
  nome_comercial: z.string()
    .min(1, "Nome da funerária é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  nif: z.string()
    .regex(/^\d{9}$/, "NIF deve ter 9 dígitos")
    .refine(validateNIF, "NIF inválido"),
  email: z.string()
    .email("Email inválido")
    .max(255),
  password: z.string()
    .min(8, "Password deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Password deve conter pelo menos uma maiúscula")
    .regex(/[a-z]/, "Password deve conter pelo menos uma minúscula")
    .regex(/[0-9]/, "Password deve conter pelo menos um número"),
  confirmPassword: z.string(),
  responsavel_nome: z.string()
    .min(1, "Nome do responsável é obrigatório")
    .max(255),
  telefone: z.string()
    .regex(/^(\+351)?[ ]?9[0-9]{8}$/, "Telefone inválido (formato: +351 9XXXXXXXX)"),
  declaro_representacao_legal: z.boolean()
    .refine((val) => val === true, "Deve confirmar que representa legalmente a entidade"),
  aceito_termos: z.boolean()
    .refine((val) => val === true, "Deve aceitar os termos e condições"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As passwords não coincidem",
  path: ["confirmPassword"],
});

export type Fase1Data = z.infer<typeof fase1Schema>;
