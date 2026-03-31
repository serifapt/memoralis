/**
 * Tipos do SeventhDayMassTemplate
 * Frame Figma: "missa 7º dia" (node 5476:20654)
 */

export interface SeventhDayMassTemplateProps {
  // ── Branding ──────────────────────────────────────────────────────────
  /** URL do logo memoralis (101×13 px, top-right). Fallback: SVG inline. */
  memoralisLogo?: string;

  // ── Falecido ──────────────────────────────────────────────────────────
  /** URL da foto — grayscale automático, border-radius 30px */
  photo?: string;
  /** Nome completo, ex: "Zé Manuel Osório Fernandes" */
  fullName?: string;
  /** Idade em anos, ex: 55 */
  age?: number;
  /** Ano de nascimento, ex: 1970 */
  birthYear?: number;
  /** Ano de falecimento, ex: 2025 */
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
  /**
   * Mensagem de agradecimento + comunicação da missa.
   * Aparece na coluna DIREITA (ao contrário do ObituaryTemplate).
   * Suporta \n\n para parágrafos.
   */
  familyText?: string;

  // ── Condolências ──────────────────────────────────────────────────────
  /** Texto do convite de condolências. Suporta \n. */
  condolencesText?: string;
  /** URL da imagem do QR code */
  qrCodeImage?: string;

  // ── Funerária ─────────────────────────────────────────────────────────
  /** URL do logótipo da funerária */
  funeralHomeLogo?: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  website?: string;

  // ── Decorativo ────────────────────────────────────────────────────────
  /** URL da imagem decorativa de flores (canto inferior direito) */
  flowerImage?: string;
}
