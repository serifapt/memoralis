import React from "react";
import { SeventhDayMassTemplate } from "./SeventhDayMassTemplate";
import type { SeventhDayMassTemplateProps } from "./SeventhDayMassTemplate/types";

// ─── Props ─────────────────────────────────────────────────────────────────

interface SeventhDayMassPreviewProps {
  data: SeventhDayMassTemplateProps;
  /**
   * Fator de escala (default 0.7 → ≈417×589 px visíveis).
   * A4 real = 595×842 px.
   */
  scale?: number;
  className?: string;
}

// ─── Preview escalado ───────────────────────────────────────────────────────

/**
 * Wrapper escalado para usar no editor/dashboard do Lovable.
 * O template A4 (595×842) é reduzido proporcionalmente via CSS transform.
 */
export function SeventhDayMassPreview({ data, scale = 0.7, className = "" }: SeventhDayMassPreviewProps) {
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
        <SeventhDayMassTemplate {...data} />
      </div>
    </div>
  );
}

// ─── Dados de demo (iguais ao Figma "A4 - 3") ──────────────────────────────

export const SEVENTH_DAY_MASS_DEMO_DATA: SeventhDayMassTemplateProps = {
  // memoralisLogo: "/assets/memoralis/logo-memoralis.svg",
  photo: "/assets/memoralis/photo-demo.png",
  fullName: "Zé Manuel Osório Fernandes",
  age: 55,
  birthYear: 1970,
  deathYear: 2025,
  parish: "Couto",
  municipality: "Arcos de Valdevez",

  massDate: "Sexta-Feira, 15 Setembro 2025",
  massStartTime: "16:00",
  massEndTime: "18:00",
  massLocation: "Casa Mortuária de Arcos de Valdevez",

  funeralHomeLogo: "/assets/memoralis/funeraria-sjoao-logo.png",
  flowerImage: "/assets/memoralis/flowers.png",
  phone1: "962 766 625",
  phone2: "258 515 233",
  email: "funeraria.s.joao@gmail.com",
  website: "funerariasjoao.pt",
};

// ─── Página demo standalone ─────────────────────────────────────────────────

/** Página de demo — remove em produção */
export function SeventhDayMassDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-8 py-12">
      <h1 className="text-2xl font-semibold text-gray-700">Preview — A4 Missa 7º Dia (escala 85%)</h1>
      <SeventhDayMassPreview data={SEVENTH_DAY_MASS_DEMO_DATA} scale={0.85} />
    </div>
  );
}
