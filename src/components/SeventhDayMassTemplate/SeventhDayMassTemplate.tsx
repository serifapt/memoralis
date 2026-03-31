import React from "react";
import type { SeventhDayMassTemplateProps } from "./types";
import { IconCalendar, IconClock, IconMapPin, LogoMemoralis } from "../shared/icons";

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_FAMILY_TEXT =
  "A família agradece a todas as pessoas que participaram nos atos religiosos do funeral do seu ente querido, ou que de alguma forma manifestaram o seu pesar, e comunica a missa de 7º dia.\n\nAntecipadamente, a Família reconhecida agradece!";

// ─── Main component ─────────────────────────────────────────────────────────

/**
 * SeventhDayMassTemplate — frame A4 (595 × 842 px) fiel ao design Figma "A4 - 3".
 *
 * Wrap num container escalado para pré-visualização:
 *   <div style={{ transform: "scale(0.75)", transformOrigin: "top left" }}>
 *     <SeventhDayMassTemplate {...data} />
 *   </div>
 *
 * Para impressão/PDF em tamanho real usa diretamente sem scale.
 */
export function SeventhDayMassTemplate({
  memoralisLogo,
  photo,
  fullName = "Nome Completo",
  age,
  birthYear,
  deathYear,
  parish,
  municipality,
  massDate,
  massStartTime,
  massEndTime,
  massLocation,
  familyText = DEFAULT_FAMILY_TEXT,
  funeralHomeLogo,
  phone1,
  phone2,
  email,
  website,
  flowerImage,
}: SeventhDayMassTemplateProps) {
  const locationLine = [parish, municipality].filter(Boolean).join(" · ");
  const phoneDisplay = [phone1, phone2].filter(Boolean).join(" | ");
  const timeDisplay = [massStartTime, massEndTime].filter(Boolean).join(" - ");

  return (
    <div
      className="bg-white relative overflow-hidden"
      style={{
        width: "595px",
        height: "842px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Cruz decorativa — top right ─────────────────────────────────── */}
      <div
        className="absolute"
        style={{ top: "23.76px", left: "520.53px", width: "51.727px", height: "79.239px" }}
      >
        <CrossSymbol className="w-full h-full" />
      </div>

      {/* ── Fotografia — top left ────────────────────────────────────────── */}
      <div
        className="absolute rounded-[30px] overflow-hidden"
        style={{ width: "173.333px", height: "208px", top: "40px", left: "40.67px" }}
      >
        {photo ? (
          <img
            src={photo}
            alt={fullName}
            className="absolute max-w-none"
            style={{
              width: "107.67%",
              height: "134.58%",
              top: "-0.56%",
              left: "-2.83%",
              objectFit: "cover",
              objectPosition: "center top",
              filter: "grayscale(100%)",
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
            Foto
          </div>
        )}
      </div>

      {/* ── Nome completo ───────────────────────────────────────────────── */}
      <p
        className="absolute font-medium text-[#1d2735] not-italic"
        style={{
          top: "103px",
          left: "255.78px",
          width: "309.6px",
          fontSize: "32px",
          lineHeight: "40px",
          fontFamily: "'Roboto', 'Inter', sans-serif",
        }}
      >
        {fullName}
      </p>

      {/* ── Idade · Anos · Localidade ───────────────────────────────────── */}
      <div
        className="absolute flex flex-col gap-[4px] items-start not-italic"
        style={{ top: "194px", left: "255.78px", width: "204px" }}
      >
        {(age !== undefined || (birthYear && deathYear)) && (
          <p className="leading-[0] w-full text-[#6c727f]" style={{ fontSize: "0px" }}>
            {age !== undefined && (
              <span className="font-semibold leading-[28px] text-[20px] text-[#6c727f]">
                {age} anos
              </span>
            )}
            {birthYear && deathYear && (
              <>
                <span className="font-semibold leading-[22px] text-[14px] text-[#6c727f]"> </span>
                <span className="font-normal leading-[22px] text-[14px] text-[#6c727f]">
                  · {birthYear} - {deathYear}
                </span>
              </>
            )}
          </p>
        )}
        {locationLine && (
          <p className="font-semibold leading-[22px] text-[16px] text-[#1d2735] w-full">
            {locationLine}
          </p>
        )}
      </div>

      {/* ── MISSA 7º DIA — coluna esquerda ──────────────────────────────── */}
      <p
        className="absolute font-semibold text-[#6c727f] not-italic"
        style={{
          top: "339px",
          left: "40.67px",
          width: "160px",
          fontSize: "24px",
          lineHeight: "32px",
        }}
      >
        MISSA 7º DIA
      </p>

      {/* ── Detalhes da missa — coluna direita ──────────────────────────── */}
      <div
        className="absolute flex flex-col gap-[4px] items-start justify-center"
        style={{ top: "341.11px", left: "256.78px" }}
      >
        {massDate && (
          <div className="flex gap-[4px] items-center">
            <IconCalendar />
            <p className="font-normal leading-[18px] text-[12px] text-[#4e5562] whitespace-nowrap">
              {massDate}
            </p>
          </div>
        )}
        {timeDisplay && (
          <div className="flex gap-[4px] items-center">
            <IconClock />
            <p className="font-normal leading-[18px] text-[12px] text-[#4e5562] whitespace-nowrap">
              {timeDisplay}
            </p>
          </div>
        )}
        {massLocation && (
          <div className="flex gap-[4px] items-center">
            <IconMapPin />
            <p className="font-normal leading-[18px] text-[12px] text-[#4e5562] whitespace-nowrap">
              {massLocation}
            </p>
          </div>
        )}
      </div>

      {/* ── Mensagem familiar — coluna direita ──────────────────────────── */}
      <div
        className="absolute font-normal text-[#4e5562] not-italic"
        style={{
          top: "454.21px",
          left: "259.53px",
          width: "267.839px",
          fontSize: "12px",
          lineHeight: "0px",
        }}
      >
        {familyText.split("\n\n").map((paragraph, pi) => (
          <React.Fragment key={pi}>
            {pi > 0 && <p className="leading-[18px] mb-0">&nbsp;</p>}
            <p className="leading-[18px] mb-0">{paragraph}</p>
          </React.Fragment>
        ))}
      </div>

      {/* ── Logo funerária ──────────────────────────────────────────────── */}
      {funeralHomeLogo && (
        <div
          className="absolute overflow-hidden"
          style={{ top: "697.2px", left: "40.67px", width: "150px", height: "43px" }}
        >
          <img
            src={funeralHomeLogo}
            alt="Funerária"
            className="absolute max-w-none pointer-events-none"
            style={{ width: "123.17%", height: "131.16%", top: "-14.88%", left: "-11.46%" }}
          />
        </div>
      )}

      {/* ── Contactos ───────────────────────────────────────────────────── */}
      {(phoneDisplay || email || website) && (
        <div
          className="absolute flex flex-col items-start font-normal text-[#4e5562] not-italic leading-[18px]"
          style={{ top: "754.89px", left: "40.67px", width: "207.617px", fontSize: "9px", paddingBottom: "2px" }}
        >
          {phoneDisplay && <p className="w-full">{phoneDisplay}</p>}
          {email && <p className="w-full">{email}</p>}
          {website && <p className="w-full">{website}</p>}
        </div>
      )}

      {/* ── Flores decorativas — canto inferior direito ─────────────────── */}
      {flowerImage && (
        <div
          className="absolute overflow-hidden"
          style={{ top: "578.09px", left: "383.28px", width: "204.885px", height: "263.908px" }}
        >
          <img
            src={flowerImage}
            alt=""
            className="absolute max-w-none pointer-events-none"
            style={{ top: "0.25%", left: "14.58%", width: "85.42%", height: "99.49%" }}
          />
        </div>
      )}

      {/* ── Logo memoralis — bottom left ────────────────────────────────── */}
      <div
        className="absolute overflow-clip"
        style={{ top: "788.08px", left: "40.67px", width: "130px", height: "17px" }}
      >
        {memoralisLogo ? (
          <img src={memoralisLogo} alt="memoralis" className="absolute block max-w-none size-full" />
        ) : (
          <LogoMemoralis className="absolute block max-w-none w-full h-full" />
        )}
      </div>
    </div>
  );
}
