/**
 * Tipos do ObituaryTemplate — cobre as variantes:
 *   "faleceu"          (node 7348:10707)  → deathCountry ausente
 *   "faleceu em local" (node 5476:9925)   → deathCountry preenchido
 */

export interface EventDetails {
  /** Data, ex: "Sexta-Feira, 15 Setembro 2025" */
  date?: string;
  /** Hora de início, ex: "16:00" (para Cortejo / Velório) */
  startTime?: string;
  /** Hora de fim, ex: "18:00" (para Cortejo / Velório) */
  endTime?: string;
  /** Hora única, ex: "19:00" (para Funeral) */
  time?: string;
  /** Local, ex: "Igreja Matriz de Arcos de Valdevez" */
  location?: string;
}

export interface ObituaryTemplateProps {
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
  /**
   * País onde faleceu (MAIÚSCULAS).
   * Se preenchido → "FALECEU EM {país}".
   * Se omitido   → "FALECEU".
   */
  deathCountry?: string;
  /** Texto explicito do tipo de anuncio, ex: "FALECEU" ou "FALECEU EM ARCO". */
  deathLabelText?: string;

  // ── Texto familiar ────────────────────────────────────────────────────
  /** Texto do anúncio familiar. Suporta \n\n para parágrafos. */
  familyText?: string;

  // ── Eventos ───────────────────────────────────────────────────────────
  /** Cortejo Fúnebre: date, startTime, endTime, location */
  cortejoFunebre?: EventDetails;
  /** Velório: date, startTime, endTime, location */
  velorio?: EventDetails;
  /** Funeral: date, time (hora única), location */
  funeral?: EventDetails;
  cremacao?: EventDetails;
  missa7?: EventDetails;
  missa30?: EventDetails;
  missa1ano?: EventDetails;
  /** Cemitério: apenas location */
  cemetery?: Pick<EventDetails, "location">;

  // ── Condolências ──────────────────────────────────────────────────────
  /** Texto do convite de condolências. Suporta \n. */
  condolencesText?: string;
  /** URL da imagem do QR code (ex: gerado via qrcode.react) */
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

  /** Ajuste vertical dos icones dos eventos usado apenas em exportacao. */
  eventIconOffsetY?: number;

  /** Indica que o template esta sendo renderizado para exportacao. */
  isExport?: boolean;

  /** Ajuste horizontal dos contactos no rodape. */
  footerContactsOffsetX?: number;

  /** Ajuste vertical da mensagem ao lado do QR no rodape. */
  footerCondolencesOffsetY?: number;

  /** Ajuste vertical do QR code no rodape usado apenas em exportacao. */
  footerQrCodeOffsetY?: number;
}
