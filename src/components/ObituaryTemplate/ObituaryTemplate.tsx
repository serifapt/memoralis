import React from "react";
import type { ObituaryTemplateProps, EventDetails } from "./types";
import { IconCalendar, IconClock, IconMapPin, LogoMemoralis } from "../shared/icons";

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_FAMILY_TEXT =
  "Sua Família cumpre o doloroso dever de participar a todas as pessoas das suas relações e amizade o seu falecimento.\n\nAntecipadamente, a Família reconhecida agradece!";

const DEFAULT_CONDOLENCES = "Deixe uma mensagem\nde condolências.";

// ─── EventRow — linha com ícone + texto ─────────────────────────────────────

function EventRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center" style={{ gap: "3.68px" }}>
      <div className="shrink-0 overflow-clip">{icon}</div>
      <p
        className="shrink-0 not-italic whitespace-nowrap"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: "11.04px",
          lineHeight: "16.561px",
          color: "#4e5562",
        }}
      >
        {text}
      </p>
    </div>
  );
}

// ─── EventSection — bloco de evento (Cortejo / Velório / Funeral / Cemitério) ─

interface EventSectionProps {
  title: string;
  event: EventDetails | Pick<EventDetails, "location"> | undefined;
  /** true = só localização (Cemitério) */
  locationOnly?: boolean;
}

function EventSection({ title, event, locationOnly = false }: EventSectionProps) {
  if (!event) return null;

  const ev = event as EventDetails;
  const timeDisplay =
    ev.startTime && ev.endTime
      ? `${ev.startTime} - ${ev.endTime}`
      : ev.startTime || ev.endTime || ev.time;

  return (
    <div
      className="flex flex-col items-start justify-center not-italic"
      style={{ gap: "3.68px" }}
    >
      <p
        className="shrink-0 whitespace-nowrap"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: "12.88px",
          lineHeight: "20.241px",
          color: "#1d2735",
        }}
      >
        {title}
      </p>
      {!locationOnly && ev.date && (
        <EventRow icon={<IconCalendar />} text={ev.date} />
      )}
      {!locationOnly && timeDisplay && (
        <EventRow icon={<IconClock />} text={timeDisplay} />
      )}
      {ev.location && (
        <EventRow icon={<IconMapPin />} text={ev.location} />
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

/**
 * ObituaryTemplate — frame A4 (595 × 842 px).
 *
 * Cobre as variantes Figma:
 *   • "faleceu"          (node 7348:10707) → deathCountry omitido
 *   • "faleceu em local" (node 5476:9925)  → deathCountry preenchido
 *
 * Para pré-visualização escalada usa ObituaryPreview.
 */
export function ObituaryTemplate({
  memoralisLogo,
  photo,
  fullName = "Nome Completo",
  age,
  birthYear,
  deathYear,
  parish,
  municipality,
  deathCountry,
  familyText = DEFAULT_FAMILY_TEXT,
  cortejoFunebre,
  velorio,
  funeral,
  cemetery,
  condolencesText = DEFAULT_CONDOLENCES,
  qrCodeImage,
  funeralHomeLogo,
  phone1,
  phone2,
  email,
  website,
  flowerImage,
}: ObituaryTemplateProps) {
  const locationLine = [parish, municipality].filter(Boolean).join(" · ");
  const phoneDisplay = [phone1, phone2].filter(Boolean).join(" | ");
  const deathLabel = deathCountry ? `FALECEU EM ${deathCountry}` : "FALECEU";

  return (
    <div
      className="bg-white relative overflow-hidden"
      style={{ width: "595px", height: "842px", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Logo memoralis — top right (101×13 px) ─────────────────────── */}
      <div
        className="absolute overflow-clip"
        style={{ left: "453.4px", top: "27px", width: "101px", height: "13px" }}
      >
        {memoralisLogo ? (
          <img
            src={memoralisLogo}
            alt="memoralis"
            style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <LogoMemoralis className="w-full h-full" />
        )}
      </div>

      {/* ── Fotografia — top left (173.333×208 px, radius 30 px) ────────── */}
      <div
        className="absolute rounded-[30px] overflow-hidden"
        style={{ left: "40.67px", top: "40px", width: "173.333px", height: "208px" }}
      >
        {photo ? (
          <img
            src={photo}
            alt={fullName}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 20%",
              filter: "grayscale(100%)",
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
            Foto
          </div>
        )}
      </div>

      {/* ── Nome completo — Roboto Medium 32/40 ────────────────────────── */}
      <p
        className="absolute not-italic"
        style={{
          left: "262.78px",
          top: "103px",
          width: "309.6px",
          fontFamily: "'Roboto', 'Inter', sans-serif",
          fontWeight: 500,
          fontSize: "32px",
          lineHeight: "40px",
          color: "#1d2735",
        }}
      >
        {fullName}
      </p>

      {/* ── Idade + Anos + Localidade ───────────────────────────────────── */}
      <div
        className="absolute flex flex-col items-start not-italic"
        style={{ left: "262.78px", top: "194px", width: "204px", gap: "4px" }}
      >
        {(age !== undefined || (birthYear && deathYear)) && (
          <p style={{ fontSize: "0px", lineHeight: 0, color: "#6c727f" }}>
            {age !== undefined && (
              <span style={{ fontWeight: 600, fontSize: "20px", lineHeight: "28px", color: "#6c727f" }}>
                {age} anos
              </span>
            )}
            {birthYear && deathYear && (
              <>
                <span style={{ fontWeight: 600, fontSize: "14px", lineHeight: "22px", color: "#6c727f" }}>{" "}</span>
                <span style={{ fontWeight: 400, fontSize: "14px", lineHeight: "22px", color: "#6c727f" }}>
                  · {birthYear} - {deathYear}
                </span>
              </>
            )}
          </p>
        )}
        {locationLine && (
          <p style={{ fontWeight: 600, fontSize: "16px", lineHeight: "22px", color: "#1d2735" }}>
            {locationLine}
          </p>
        )}
      </div>

      {/* ── FALECEU / FALECEU EM [PAÍS] — coluna esquerda ──────────────── */}
      <p
        className="absolute not-italic"
        style={{
          left: "40px",
          top: "298.6px",
          width: "160px",
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "32px",
          color: "#6c727f",
        }}
      >
        {deathLabel}
      </p>

      {/* ── Texto familiar — coluna esquerda ───────────────────────────── */}
      <div
        className="absolute not-italic whitespace-pre-wrap"
        style={{
          left: "40.67px",
          top: "404.91px",
          width: "173.333px",
          fontWeight: 400,
          fontSize: "11px",
          lineHeight: "0px",
          color: "#4e5562",
        }}
      >
        {familyText.split("\n\n").map((paragraph, pi) => (
          <React.Fragment key={pi}>
            {pi > 0 && <p style={{ lineHeight: "16px", marginBottom: 0 }}>&nbsp;</p>}
            <p style={{ lineHeight: "16px", marginBottom: 0 }}>{paragraph}</p>
          </React.Fragment>
        ))}
      </div>

      {/* ── Cortejo Fúnebre — coluna direita, top=298.6 ─────────────────── */}
      {cortejoFunebre && (
        <div
          className="absolute"
          style={{ left: "261px", top: "298.6px", width: "214.367px", height: "80.963px" }}
        >
          <EventSection title="Cortejo Fúnebre" event={cortejoFunebre} />
        </div>
      )}

      {/* ── Velório — coluna direita, top=399.91 ────────────────────────── */}
      {velorio && (
        <div
          className="absolute"
          style={{ left: "261px", top: "399.91px", width: "214.367px", height: "80.963px" }}
        >
          <EventSection title="Velório" event={velorio} />
        </div>
      )}

      {/* ── Funeral — coluna direita, top=501.22 ────────────────────────── */}
      {funeral && (
        <div
          className="absolute"
          style={{ left: "261px", top: "501.22px", width: "199.646px", height: "80.963px" }}
        >
          <EventSection title="Funeral" event={funeral} />
        </div>
      )}

      {/* ── Cemitério — coluna direita, top=602.53 ──────────────────────── */}
      {cemetery && (
        <div
          className="absolute"
          style={{ left: "261px", top: "602.53px", width: "184.926px", height: "40.481px" }}
        >
          <EventSection title="Cemitério" event={cemetery} locationOnly />
        </div>
      )}

      {/* ── Logo funerária — bottom left (150×43 px) ────────────────────── */}
      {funeralHomeLogo && (
        <div
          className="absolute overflow-hidden"
          style={{ left: "40.67px", top: "707.2px", width: "150px", height: "43px" }}
        >
          <img
            src={funeralHomeLogo}
            alt="Funerária"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "left center",
              pointerEvents: "none",
            }}
          />
        </div>
      )}

      {/* ── Contactos — bottom left, abaixo do logo ──────────────────────── */}
      {(phoneDisplay || email || website) && (
        <div
          className="absolute flex flex-col items-start not-italic"
          style={{
            left: "41.24px",
            top: "764.89px",
            width: "207.617px",
            fontWeight: 400,
            fontSize: "9px",
            lineHeight: "18px",
            color: "#4e5562",
            paddingBottom: "2px",
          }}
        >
          {phoneDisplay && <p className="w-full">{phoneDisplay}</p>}
          {email && <p className="w-full">{email}</p>}
          {website && <p className="w-full">{website}</p>}
        </div>
      )}

      {/* ── QR code — bottom center-left (≈45×45 px) ───────────────────── */}
      {/* inset Figma: top=90.84%×842=765px, left=44.25%×595=263.3px, w≈45px, h≈45px */}
      <div
        className="absolute"
        style={{ left: "263.3px", top: "765px", width: "45px", height: "45px" }}
      >
        {qrCodeImage ? (
          <img
            src={qrCodeImage}
            alt="QR condolências"
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        ) : (
          <div className="w-full h-full border border-gray-300 flex items-center justify-center text-[7px] text-gray-400">
            QR
          </div>
        )}
      </div>

      {/* ── Texto condolências — ao lado do QR ──────────────────────────── */}
      <div
        className="absolute not-italic"
        style={{
          left: "322.51px",
          top: "766.89px",
          width: "99.672px",
          fontWeight: 400,
          fontSize: "10.976px",
          lineHeight: "0px",
          color: "#4e5562",
        }}
      >
        {condolencesText.split("\n").map((line, i) => (
          <p key={i} style={{ lineHeight: "15.366px", marginBottom: 0 }}>{line}</p>
        ))}
      </div>

      {/* ── Flores decorativas — bottom right ───────────────────────────── */}
      {flowerImage && (
        <div
          className="absolute overflow-hidden"
          style={{ left: "379px", top: "582.01px", width: "204.885px", height: "263.908px" }}
        >
          <img
            src={flowerImage}
            alt=""
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "right top",
              pointerEvents: "none",
            }}
          />
        </div>
      )}
    </div>
  );
}
