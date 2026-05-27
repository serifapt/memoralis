export type CarePlanInfo = {
  code: string;
  name: string;
  price: number;
  freq: string;
  popular?: boolean;
  items: string[];
};

export const CARE_PLANS: CarePlanInfo[] = [
  {
    code: "mensal",
    name: "Mensal",
    price: 50,
    freq: "1 visita por mês",
    items: [
      "Limpeza geral da campa",
      "2 composições de flores frescas da época (vaso e jarra)",
      "1 círio branco/vermelho 60LL",
      "Foto antes/depois",
    ],
  },
  {
    code: "quinzenal",
    name: "Quinzenal",
    price: 90,
    freq: "2 visitas por mês",
    items: [
      "Limpeza geral da campa",
      "2 composições de flores frescas da época (vaso e jarra)",
      "1 círio branco/vermelho 60LL",
      "Foto antes/depois",
    ],
  },
  {
    code: "semanal",
    name: "Semanal",
    price: 160,
    freq: "4 visitas por mês",
    popular: true,
    items: [
      "Limpeza geral da campa",
      "2 composições de flores frescas da época (vaso e jarra)",
      "1 círio branco/vermelho 60LL",
      "Foto antes/depois",
    ],
  },
  {
    code: "premium",
    name: "Homenagem",
    price: 200,
    freq: "4 visitas por mês + extras",
    items: [
      "Limpeza da campa",
      "Ramo de flores frescas premium",
      "Círios / velas ilimitados",
      "Foto de comprovação",
      "Limpeza profunda mensal",
      "3 datas comemorativas à escolha (Dia de Todos os Santos, aniversários, Dia do Pai / da Mãe, entre outras)",
    ],
  },
];