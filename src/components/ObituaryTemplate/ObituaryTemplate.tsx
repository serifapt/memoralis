import React, { useState, useEffect } from "react";
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
    <div style={{ display: "flex", alignItems: "center", gap: "3.68px" }}>
      <div style={{ flexShrink: 0, overflow: "clip" }}>{icon}</div>
      <p
        style={{
          flexShrink: 0,
          fontStyle: "normal",
          whiteSpace: "nowrap",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: "11.04px",
          lineHeight: "16.561px",
          color: "#4e5562",
          margin: 0,
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
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        fontStyle: "normal",
        gap: "3.68px",
      }}
    >
      <p
        style={{
          flexShrink: 0,
          whiteSpace: "nowrap",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: "12.88px",
          lineHeight: "20.241px",
          color: "#1d2735",
          margin: 0,
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

  // Dynamic font size for long names
  const nameLength = fullName.length;
  const nameFontSize = nameLength > 35 ? "22px" : nameLength > 25 ? "26px" : "32px";
  const nameLineHeight = nameLength > 35 ? "28px" : nameLength > 25 ? "32px" : "40px";

  // Canvas-based grayscale conversion (html2canvas ignores CSS filters)
  const [grayscalePhoto, setGrayscalePhoto] = useState<string | undefined>();

  useEffect(() => {
    if (!photo) { setGrayscalePhoto(undefined); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = data[i + 1] = data[i + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);
        setGrayscalePhoto(canvas.toDataURL("image/jpeg", 0.95));
      } catch {
        // CORS blocked — fall back to original with CSS filter
        setGrayscalePhoto(undefined);
      }
    };
    img.onerror = () => setGrayscalePhoto(undefined);
    img.src = photo;
  }, [photo]);

  return (
    <div
      style={{
        backgroundColor: "#fff",
        position: "relative",
        overflow: "hidden",
        width: "595px",
        height: "842px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Logo memoralis — top right (101×13 px) */}
      <div
        style={{
          position: "absolute",
          overflow: "clip",
          left: "453.4px",
          top: "27px",
          width: "101px",
          height: "13px",
        }}
      >
        {memoralisLogo ? (
          <img
            src={memoralisLogo}
            alt="memoralis"
            style={{ position: "absolute", display: "block", maxWidth: "none", width: "100%", height: "100%" }}
          />
        ) : (
          <LogoMemoralis style={{ position: "absolute", display: "block", maxWidth: "none", width: "100%", height: "100%" }} />
        )}
      </div>

      {/* ── Fotografia — top left (173.333×208 px, radius 30 px) */}
      <div
        style={{
          position: "absolute",
          borderRadius: "30px",
          overflow: "hidden",
          left: "40.67px",
          top: "40px",
          width: "173.333px",
          height: "208px",
        }}
      >
        {photo ? (
          <img
            src={grayscalePhoto || photo}
            alt={fullName}
            style={{
              position: "absolute",
              maxWidth: "none",
              width: "107.67%",
              height: "134.58%",
              top: "-0.56%",
              left: "-2.83%",
              objectFit: "cover",
              objectPosition: "center top",
              ...(grayscalePhoto ? {} : { filter: "grayscale(100%)" }),
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#e5e7eb",
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

      {/* ── Nome completo — Roboto Medium 32/40 */}
      <p
        style={{
          position: "absolute",
          fontStyle: "normal",
          left: "262.78px",
          top: "103px",
          width: "309.6px",
          fontFamily: "'Roboto', 'Inter', sans-serif",
          fontWeight: 500,
          fontSize: nameFontSize,
          lineHeight: nameLineHeight,
          color: "#1d2735",
          margin: 0,
        }}
      >
        {fullName}
      </p>

      {/* ── Idade + Anos + Localidade */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          fontStyle: "normal",
          left: "262.78px",
          top: "194px",
          width: "204px",
          gap: "4px",
        }}
      >
        {(age !== undefined || (birthYear && deathYear)) && (
          <p style={{ fontSize: "0px", lineHeight: 0, color: "#6c727f", margin: 0 }}>
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
          <p style={{ fontWeight: 600, fontSize: "16px", lineHeight: "22px", color: "#1d2735", margin: 0 }}>
            {locationLine}
          </p>
        )}
      </div>

      {/* ── FALECEU / FALECEU EM [PAÍS] — coluna esquerda */}
      <p
        style={{
          position: "absolute",
          fontStyle: "normal",
          left: "40px",
          top: "298.6px",
          width: "160px",
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "32px",
          color: "#6c727f",
          margin: 0,
        }}
      >
        {deathLabel}
      </p>

      {/* ── Texto familiar — coluna esquerda */}
      <div
        style={{
          position: "absolute",
          fontStyle: "normal",
          whiteSpace: "pre-wrap",
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

      {/* ── Cortejo Fúnebre */}
      {cortejoFunebre && (
        <div
          style={{ position: "absolute", left: "261px", top: "298.6px", width: "214.367px", height: "80.963px" }}
        >
          <EventSection title="Cortejo Fúnebre" event={cortejoFunebre} />
        </div>
      )}

      {/* ── Velório */}
      {velorio && (
        <div
          style={{ position: "absolute", left: "261px", top: "399.91px", width: "214.367px", height: "80.963px" }}
        >
          <EventSection title="Velório" event={velorio} />
        </div>
      )}

      {/* ── Funeral */}
      {funeral && (
        <div
          style={{ position: "absolute", left: "261px", top: "501.22px", width: "199.646px", height: "80.963px" }}
        >
          <EventSection title="Funeral" event={funeral} />
        </div>
      )}

      {/* ── Cemitério */}
      {cemetery && (
        <div
          style={{ position: "absolute", left: "261px", top: "602.53px", width: "184.926px", height: "40.481px" }}
        >
          <EventSection title="Cemitério" event={cemetery} locationOnly />
        </div>
      )}

      {/* ── Logo funerária — bottom left (150×43 px) */}
      {funeralHomeLogo && (
        <div
          style={{ position: "absolute", overflow: "hidden", left: "40.67px", top: "707.2px", width: "150px", height: "43px" }}
        >
          <img
            src={funeralHomeLogo}
            alt="Funerária"
            style={{ position: "absolute", maxWidth: "none", pointerEvents: "none", width: "123.17%", height: "131.16%", top: "-14.88%", left: "-11.46%" }}
          />
        </div>
      )}

      {/* ── Contactos — bottom left */}
      {(phoneDisplay || email || website) && (
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            fontStyle: "normal",
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
          {phoneDisplay && <p style={{ width: "100%", margin: 0 }}>{phoneDisplay}</p>}
          {email && <p style={{ width: "100%", margin: 0 }}>{email}</p>}
          {website && <p style={{ width: "100%", margin: 0 }}>{website}</p>}
        </div>
      )}

      {/* ── QR code — bottom center-left (≈45×45 px) */}
      <div
        style={{ position: "absolute", left: "263.3px", top: "765px", width: "45px", height: "45px" }}
      >
        {qrCodeImage ? (
          <img
            src={qrCodeImage}
            alt="QR condolências"
            style={{ position: "absolute", display: "block", maxWidth: "none", width: "100%", height: "100%" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
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

      {/* ── Texto condolências — ao lado do QR */}
      <div
        style={{
          position: "absolute",
          fontStyle: "normal",
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

      {/* ── Flores decorativas — bottom right */}
      {flowerImage && (
        <div
          style={{ position: "absolute", overflow: "hidden", left: "379px", top: "582.01px", width: "204.885px", height: "263.908px" }}
        >
          <img
            src={flowerImage}
            alt=""
            style={{ position: "absolute", maxWidth: "none", pointerEvents: "none", top: "0.25%", left: "14.58%", width: "85.42%", height: "99.49%" }}
          />
        </div>
      )}
    </div>
  );
}
