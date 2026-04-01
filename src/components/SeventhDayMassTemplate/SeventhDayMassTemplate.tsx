import React from "react";
import type { SeventhDayMassTemplateProps } from "./types";
import { IconCalendar, IconClock, IconMapPin, LogoMemoralis } from "../shared/icons";

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_FAMILY_TEXT =
  "A família agradece a todas as pessoas que participaram nos atos religiosos do funeral do seu ente querido, ou que de alguma forma manifestaram o seu pesar, e comunica a missa de 7º dia.\n\nAntecipadamente, a Família reconhecida agradece!";

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

// ─── Main component ─────────────────────────────────────────────────────────

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
  condolencesText = DEFAULT_CONDOLENCES,
  qrCodeImage,
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

      {/* ── Idade + Anos + Localidade ──────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "263px",
          top: "194px",
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

      {/* ── MISSA 7º DIA — coluna esquerda ─────────────────────────────── */}
      <p
        style={{
          position: "absolute",
          left: "41px",
          top: "349px",
          width: "180px",
          margin: 0,
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "32px",
          color: "#6c727f",
        }}
      >
        MISSA 7º DIA
      </p>

      {/* ── Detalhes da missa — coluna direita ─────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "261px",
          top: "351px",
          width: "295px",
        }}
      >
        {massDate && <EventRow icon={<IconCalendar />} text={massDate} />}
        {timeDisplay && <EventRow icon={<IconClock />} text={timeDisplay} />}
        {massLocation && <EventRow icon={<IconMapPin />} text={massLocation} />}
      </div>

      {/* ── Texto familiar — coluna direita ────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "260px",
          top: "455px",
          width: "239px",
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

      {/* ── Logo funerária — bottom left (background-image) ────────────── */}
      {funeralHomeLogo && (
        <div
          style={{
            position: "absolute",
            left: "40px",
            top: "707px",
            width: "150px",
            height: "43px",
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
            left: "379px",
            top: "582px",
            width: "205px",
            height: "264px",
            backgroundImage: `url(${flowerImage})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right top",
          }}
        />
      )}
    </div>
  );
}
