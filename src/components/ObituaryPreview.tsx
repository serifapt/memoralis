import React from "react";
import { ObituaryTemplate } from "./ObituaryTemplate";
import type { ObituaryTemplateProps } from "./ObituaryTemplate/types";

// ─── Props ─────────────────────────────────────────────────────────────────

interface ObituaryPreviewProps {
  data: ObituaryTemplateProps;
  /**
   * Fator de escala (default 0.7 → ≈417×589 px visíveis).
   * A4 real = 595×842 px.
   */
  scale?: number;
  className?: string;
}

// ─── Preview escalado ───────────────────────────────────────────────────────

/**
 * Wrapper escalado para usar no editor / dashboard do Lovable.
 * O template A4 (595×842) é reduzido proporcionalmente via CSS transform.
 */
export function ObituaryPreview({ data, scale = 0.7, className = "" }: ObituaryPreviewProps) {
  const W = 595;
  const H = 842;

  return (
    <div
      className={`relative overflow-hidden shadow-xl ${className}`}
      style={{ width: `${W * scale}px`, height: `${H * scale}px` }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${W}px`,
          height: `${H}px`,
        }}
      >
        <ObituaryTemplate {...data} />
      </div>
    </div>
  );
}

// ─── Dados de demo — variante "faleceu em local" (node 5476:9925) ───────────

export const OBITUARY_WITH_COUNTRY_DEMO: ObituaryTemplateProps = {
  photo: "/assets/memoralis/photo-demo.png",
  fullName: "Zé Manuel Osório Fernandes",
  age: 55,
  birthYear: 1970,
  deathYear: 2025,
  parish: "Couto",
  municipality: "Arcos de Valdevez",
  deathCountry: "FRANÇA",

  cortejoFunebre: {
    date: "Sexta-Feira, 15 Setembro 2025",
    startTime: "16:00",
    endTime: "18:00",
    location: "Casa Mortuária de Arcos de Valdevez",
  },
  velorio: {
    date: "Sexta-Feira, 15 Setembro 2025",
    startTime: "16:00",
    endTime: "18:00",
    location: "Casa Mortuária de Arcos de Valdevez",
  },
  funeral: {
    date: "Sexta-Feira, 15 Setembro 2025",
    time: "19:00",
    location: "Igreja Matriz de Arcos de Valdevez",
  },
  cemetery: {
    location: "Municipal de Arcos de Valdevez",
  },

  funeralHomeLogo: "/assets/memoralis/funeraria-sjoao-logo.png",
  flowerImage: "/assets/memoralis/flowers.png",
  // qrCodeImage: "/assets/memoralis/qr-demo.png",
  phone1: "962 766 625",
  phone2: "258 515 233",
  email: "funeraria.s.joao@gmail.com",
  website: "funerariasjoao.pt",
};

// ─── Dados de demo — variante "faleceu" (node 7348:10707) ───────────────────

export const OBITUARY_NO_COUNTRY_DEMO: ObituaryTemplateProps = {
  ...OBITUARY_WITH_COUNTRY_DEMO,
  deathCountry: undefined,  // → mostra só "FALECEU"
};

// ─── Página demo standalone ─────────────────────────────────────────────────

/** Página de demo — remove em produção */
export function ObituaryDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-12 py-12">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-600">Variante: "Faleceu em PAÍS"</h2>
        <ObituaryPreview data={OBITUARY_WITH_COUNTRY_DEMO} scale={0.75} />
      </div>
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-600">Variante: "Faleceu"</h2>
        <ObituaryPreview data={OBITUARY_NO_COUNTRY_DEMO} scale={0.75} />
      </div>
    </div>
  );
}