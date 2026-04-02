import React from "react";
import type { ObituaryTemplateProps, EventDetails } from "./types";
import { IconCalendar, IconClock, IconMapPin, LogoMemoralis } from "../shared/icons";

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_FAMILY_TEXT =
  "Sua Família cumpre o doloroso dever de participar a todas as pessoas das suas relações e amizade o seu falecimento.\n\nAntecipadamente, a Família reconhecida agradece!";

const DEFAULT_CONDOLENCES = "Deixe uma mensagem\nde condolências.";

// ─── EventRow — ícone + texto (inline-block para html2canvas) ───────────────

function EventRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ lineHeight: "17px", marginTop: "4px" }}>
      <span style={{ display: "inline-block", verticalAlign: "middle", width: "13px", height: "13px", marginRight: "4px" }}>
        {icon}
      </span>
      <span
        style={{
          display: "inline",
          verticalAlign: "middle",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: "11px",
          lineHeight: "17px",
          color: "#4e5562",
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── EventSection — bloco de evento ─────────────────────────────────────────

function EventSection({
  title,
  event,
  locationOnly = false,
}: {
  title: string;
  event: EventDetails | Pick<EventDetails, "location"> | undefined;
  locationOnly?: boolean;
}) {
  if (!event) return null;

  const ev = event as EventDetails;
  const timeDisplay =
    ev.startTime && ev.endTime
      ? `${ev.startTime} - ${ev.endTime}`
      : ev.startTime || ev.endTime || ev.time;

  return (
    <div>
      <p
        style={{
          margin: 0,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: "13px",
          lineHeight: "20px",
          color: "#1d2735",
        }}
      >
        {title}
      </p>
      {!locationOnly && ev.date && <EventRow icon={<IconCalendar />} text={ev.date} />}
      {!locationOnly && timeDisplay && <EventRow icon={<IconClock />} text={timeDisplay} />}
      {ev.location && <EventRow icon={<IconMapPin />} text={ev.location} />}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

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
      style={{
        position: "relative",
        width: "595px",
        height: "842px",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Logo memoralis — top right ─────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "453px",
          top: "27px",
          width: "101px",
          height: "13px",
          overflow: "hidden",
        }}
      >
        {memoralisLogo ? (
          <div
            style={{
              width: "101px",
              height: "13px",
              backgroundImage: `url(${memoralisLogo})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
        ) : (
          <LogoMemoralis />
        )}
      </div>

      {/* ── Fotografia — top left (background-image para html2canvas) ──── */}
      <div
        style={{
          position: "absolute",
          left: "41px",
          top: "40px",
          width: "173px",
          height: "208px",
          borderRadius: "30px",
          overflow: "hidden",
          backgroundColor: "#e5e7eb",
          ...(photo
            ? {
                backgroundImage: `url(${photo})`,
                backgroundSize: "cover",
                backgroundPosition: "center 20%",
                // grayscale via CSS filter no container
                filter: "grayscale(100%)",
              }
            : {}),
        }}
      >
        {!photo && (
          <div
            style={{
              width: "173px",
              height: "208px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: "12px",
            }}
          >
            Foto
          </div>
        )}
      </div>

      {/* ── Nome completo ──────────────────────────────────────────────── */}
      <p
        style={{
          position: "absolute",
          left: "263px",
          top: "103px",
          width: "310px",
          margin: 0,
          fontFamily: "'Roboto', 'Inter', sans-serif",
          fontWeight: 500,
          fontSize: "32px",
          lineHeight: "40px",
          color: "#1d2735",
        }}
      >
        {fullName}
      </p>

      {/* ── Idade + Anos + Localidade (alinhado com fundo da foto: 248px) */}
      <div
        style={{
          position: "absolute",
          left: "263px",
          top: "210px",
          width: "204px",
        }}
      >
        {(age !== undefined || (birthYear && deathYear)) && (
          <div style={{ marginBottom: "4px" }}>
            {age !== undefined && (
              <span style={{ fontWeight: 600, fontSize: "20px", lineHeight: "28px", color: "#6c727f" }}>
                {age} anos
              </span>
            )}
            {birthYear && deathYear && (
              <span style={{ fontWeight: 400, fontSize: "14px", lineHeight: "22px", color: "#6c727f" }}>
                {age !== undefined ? " " : ""}· {birthYear} - {deathYear}
              </span>
            )}
          </div>
        )}
        {locationLine && (
          <p style={{ margin: 0, fontWeight: 600, fontSize: "16px", lineHeight: "22px", color: "#1d2735" }}>
            {locationLine}
          </p>
        )}
      </div>

      {/* ── FALECEU / FALECEU EM [PAÍS] ────────────────────────────────── */}
      <p
        style={{
          position: "absolute",
          left: "40px",
          top: "299px",
          width: "180px",
          margin: 0,
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
        style={{
          position: "absolute",
          left: "41px",
          top: "405px",
          width: "173px",
          fontWeight: 400,
          fontSize: "11px",
          lineHeight: "16px",
          color: "#4e5562",
        }}
      >
        {familyText.split("\n\n").map((paragraph, pi) => (
          <React.Fragment key={pi}>
            {pi > 0 && <p style={{ lineHeight: "16px", margin: 0 }}>&nbsp;</p>}
            <p style={{ lineHeight: "16px", margin: 0 }}>{paragraph}</p>
          </React.Fragment>
        ))}
      </div>

      {/* ── Velório — coluna direita ───────────────────────────────────── */}
      {velorio && (
        <div style={{ position: "absolute", left: "261px", top: "299px", width: "295px" }}>
          <EventSection title="Velório" event={velorio} />
        </div>
      )}

      {/* ── Cortejo Fúnebre — coluna direita ───────────────────────────── */}
      {cortejoFunebre && (
        <div style={{ position: "absolute", left: "261px", top: "400px", width: "295px" }}>
          <EventSection title="Cortejo Fúnebre" event={cortejoFunebre} />
        </div>
      )}

      {/* ── Funeral — coluna direita ───────────────────────────────────── */}
      {funeral && (
        <div style={{ position: "absolute", left: "261px", top: "501px", width: "295px" }}>
          <EventSection title="Funeral" event={funeral} />
        </div>
      )}

      {/* ── Cemitério — coluna direita ─────────────────────────────────── */}
      {cemetery && (
        <div style={{ position: "absolute", left: "261px", top: "603px", width: "295px" }}>
          <EventSection title="Cemitério" event={cemetery} locationOnly />
        </div>
      )}

      {/* ── Logo funerária — bottom left (background-image) ────────────── */}
      {funeralHomeLogo && (
        <div
          style={{
            position: "absolute",
            left: "40px",
            top: "700px",
            width: "180px",
            height: "50px",
            backgroundImage: `url(${funeralHomeLogo})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "left center",
          }}
        />
      )}

      {/* ── Contactos — bottom left ────────────────────────────────────── */}
      {(phoneDisplay || email || website) && (
        <div
          style={{
            position: "absolute",
            left: "40px",
            top: "765px",
            width: "208px",
            fontWeight: 400,
            fontSize: "9px",
            lineHeight: "14px",
            color: "#4e5562",
          }}
        >
          {phoneDisplay && <p style={{ margin: 0 }}>{phoneDisplay}</p>}
          {email && <p style={{ margin: 0 }}>{email}</p>}
          {website && <p style={{ margin: 0 }}>{website}</p>}
        </div>
      )}

      {/* ── QR code — bottom center ────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "263px",
          top: "765px",
          width: "45px",
          height: "45px",
        }}
      >
        {qrCodeImage ? (
          <div
            style={{
              width: "45px",
              height: "45px",
              backgroundImage: `url(${qrCodeImage})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
        ) : (
          <div
            style={{
              width: "45px",
              height: "45px",
              border: "1px solid #d1d5db",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "7px",
              color: "#9ca3af",
            }}
          >
            QR
          </div>
        )}
      </div>

      {/* ── Texto condolências — ao lado do QR ─────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "323px",
          top: "767px",
          width: "100px",
          fontWeight: 400,
          fontSize: "11px",
          lineHeight: "15px",
          color: "#4e5562",
        }}
      >
        {condolencesText.split("\n").map((line, i) => (
          <p key={i} style={{ margin: 0, lineHeight: "15px" }}>{line}</p>
        ))}
      </div>

      {/* ── Flores decorativas — bottom right (background-image) ───────── */}
      {flowerImage && (
        <div
          style={{
            position: "absolute",
            left: "390px",
            top: "578px",
            width: "205px",
            height: "264px",
            backgroundImage: `url(${flowerImage})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right bottom",
          }}
        />
      )}
    </div>
  );
}
