export type CareStatus =
  | "pending_payment"
  | "pending_activation"
  | "active"
  | "suspended"
  | "canceled"
  | "past_due"
  | "trialing"
  | "unpaid"
  | "paused"
  | "pending";

export const careStatusLabel: Record<string, string> = {
  pending_payment: "Pendente de pagamento",
  pending_activation: "Pendente de ativação",
  active: "Ativo",
  suspended: "Suspenso",
  canceled: "Cancelado",
  past_due: "Pagamento em atraso",
  trialing: "Período de teste",
  unpaid: "Por pagar",
  paused: "Em pausa",
  pending: "Pendente",
};

export const careStatusBadgeClass: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-900 border-amber-200",
  pending_activation: "bg-blue-100 text-blue-900 border-blue-200",
  active: "bg-emerald-100 text-emerald-900 border-emerald-200",
  suspended: "bg-orange-100 text-orange-900 border-orange-200",
  canceled: "bg-zinc-100 text-zinc-700 border-zinc-200",
  past_due: "bg-red-100 text-red-900 border-red-200",
  trialing: "bg-sky-100 text-sky-900 border-sky-200",
  unpaid: "bg-red-100 text-red-900 border-red-200",
  paused: "bg-zinc-100 text-zinc-700 border-zinc-200",
  pending: "bg-amber-100 text-amber-900 border-amber-200",
};

export const carePlanOrder = ["mensal", "quinzenal", "semanal", "premium"];

export const carePlanPriceByCode: Record<string, number> = {
  mensal: 50,
  quinzenal: 90,
  semanal: 160,
  premium: 200,
};

export const commemorativeDateTypes = [
  { value: "todos_os_santos", label: "Dia de Todos os Santos (1 nov)", hasDate: false },
  { value: "aniversario_falecimento", label: "Aniversário de falecimento", hasDate: true },
  { value: "aniversario_nascimento", label: "Aniversário de nascimento", hasDate: true },
  { value: "dia_pai", label: "Dia do Pai (19 mar)", hasDate: false },
  { value: "dia_mae", label: "Dia da Mãe", hasDate: false },
  { value: "natal", label: "Natal (25 dez)", hasDate: false },
  { value: "outra", label: "Outra data", hasDate: true },
];