export interface SeventhDayMassTemplateProps {
  // ── Branding ──────────────────────────────────────────────────────────
  /** URL to the "III memoralis" logo (SVG or PNG). Falls back to SVG inline. */
  memoralisLogo?: string;

  // ── Falecido ──────────────────────────────────────────────────────────
  /** URL da foto — exibida em escala de cinza com border-radius: 30px */
  photo?: string;
  /** Nome completo, ex: "Zé Manuel Osório Fernandes" */
  fullName?: string;
  /** Idade em anos */
  age?: number;
  /** Ano de nascimento */
  birthYear?: number;
  /** Ano de falecimento */
  deathYear?: number;
  /** Freguesia, ex: "Couto" */
  parish?: string;
  /** Município, ex: "Arcos de Valdevez" */
  municipality?: string;

  // ── Missa 7º Dia ──────────────────────────────────────────────────────
  /** Data da missa, ex: "Sexta-Feira, 15 Setembro 2025" */
  massDate?: string;
  /** Hora de início, ex: "16:00" */
  massStartTime?: string;
  /** Hora de fim, ex: "18:00" */
  massEndTime?: string;
  /** Local da missa, ex: "Casa Mortuária de Arcos de Valdevez" */
  massLocation?: string;

  // ── Texto familiar ────────────────────────────────────────────────────
  /** Mensagem de agradecimento e comunicação da missa. Suporta \n para parágrafos. */
  familyText?: string;

  // ── Funerária ─────────────────────────────────────────────────────────
  /** URL do logótipo da funerária */
  funeralHomeLogo?: string;
  phone1?: string;   // ex: "962 766 625"
  phone2?: string;   // ex: "258 515 233"
  email?: string;    // ex: "funeraria.s.joao@gmail.com"
  website?: string;  // ex: "funerariasjoao.pt"

  // ── Decorativo ────────────────────────────────────────────────────────
  /** URL da imagem decorativa de flores (canto inferior direito) */
  flowerImage?: string;
}
