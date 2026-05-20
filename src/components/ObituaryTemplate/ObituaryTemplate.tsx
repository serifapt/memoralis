import React from "react";
import type { ObituaryTemplateProps, EventDetails } from "./types";
import { IconCalendar, IconClock, IconMapPin, LogoMemoralis } from "../shared/icons";

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_FAMILY_TEXT =
  "Sua Família cumpre o doloroso dever de participar a todas as pessoas das suas relações e amizade o seu falecimento.\n\nAntecipadamente, a Família reconhecida agradece!";

const DEFAULT_CONDOLENCES = "Deixe uma mensagem\nde condolências.";

// ─── EventRow — ícone + texto (inline-block para html2canvas) ───────────────

function EventRow({ icon, text, iconOffsetY = 0 }: { icon: React.ReactNode; text: string; iconOffsetY?: number }) {
  return (
    <div style={{ display: "table", tableLayout: "fixed", width: "100%", borderCollapse: "collapse", lineHeight: "17px", marginTop: "4px" }}>
      <span
        style={{
          display: "table-cell",
          width: "19px",
          height: "17px",
          verticalAlign: "middle",
        }}
      >
        <span style={{ display: "block", width: "13px", height: "13px", lineHeight: 0, transform: `translateY(${iconOffsetY}px)` }}>
          {icon}
        </span>
      </span>
      <span
        style={{
          display: "table-cell",
          verticalAlign: "middle",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: "11px",
          lineHeight: "17px",
          color: "#4e5562",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
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
  iconOffsetY = 0,
}: {
  title: string;
  event: EventDetails | Pick<EventDetails, "location"> | undefined;
  locationOnly?: boolean;
  iconOffsetY?: number;
}) {
  if (!event) return null;

  const ev = event as EventDetails;
  const timeDisplay =
    ev.startTime && ev.endTime
      ? `${ev.startTime} - ${ev.endTime}`
      : ev.startTime || ev.endTime || ev.time;

  return (
    <div style={{ textAlign: "left" }}>
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
      {!locationOnly && ev.date && <EventRow icon={<IconCalendar />} text={ev.date} iconOffsetY={iconOffsetY} />}
      {!locationOnly && timeDisplay && <EventRow icon={<IconClock />} text={timeDisplay} iconOffsetY={iconOffsetY} />}
      {ev.location && <EventRow icon={<IconMapPin />} text={ev.location} iconOffsetY={iconOffsetY} />}
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
  deathLabelText,
  familyText = DEFAULT_FAMILY_TEXT,
  cortejoFunebre,
  velorio,
  funeral,
  cremacao,
  missa7,
  missa30,
  missa1ano,
  cemetery,
  condolencesText = DEFAULT_CONDOLENCES,
  qrCodeImage,
  funeralHomeLogo,
  phone1,
  phone2,
  email,
  website,
  flowerImage,
  isExport = false,
  eventIconOffsetY = 0,
  footerContactsOffsetX = 0,
  footerCondolencesOffsetY = 0,
  footerQrCodeOffsetY = 0,
}: ObituaryTemplateProps) {
  const locationLine = [parish, municipality].filter(Boolean).join(" · ");
  const phoneDisplay = [phone1, phone2].filter(Boolean).join(" | ");
  const deathLabel = deathLabelText || (deathCountry ? `FALECEU EM ${deathCountry}` : "FALECEU");
  const events = [
    velorio && { title: "Velório", event: velorio },
    cortejoFunebre && { title: "Cortejo Fúnebre", event: cortejoFunebre },
    funeral && { title: "Funeral", event: funeral },
    cremacao && { title: "Cremação", event: cremacao },
    missa7 && { title: "Missa 7º Dia", event: missa7 },
    missa30 && { title: "Missa 30º Dia", event: missa30 },
    missa1ano && { title: "Missa 1 Ano", event: missa1ano },
    cemetery && { title: "Cemitério", event: cemetery, locationOnly: true },
  ].filter(Boolean) as Array<{ title: string; event: EventDetails | Pick<EventDetails, "location">; locationOnly?: boolean }>;
  const hasEventDetails = events.length > 0;
  const hasManyEvents = events.length > 3;
  const ageBlockTop =
    fullName.length > 42 ? "230px" :
    fullName.length > 28 ? "210px" :
    fullName.length > 22 ? "190px" :
    "160px";
  const deathLabelFontSize = deathLabel.length > 34 ? "18px" : deathLabel.length > 26 ? "20px" : "22px";
  const deathLabelLineHeight = deathLabel.length > 34 ? "25px" : deathLabel.length > 26 ? "28px" : "30px";
  const familyTextLength = familyText.length;
  const familyFontSize =
    familyTextLength > 1800 ? "9px" :
    familyTextLength > 1200 ? "9px" :
    familyTextLength > 800 ? "10px" :
    familyTextLength > 500 ? "10px" :
    "11px";
  const familyLineHeight =
    familyTextLength > 1800 ? "11px" :
    familyTextLength > 1200 ? "11px" :
    familyTextLength > 800 ? "13px" :
    familyTextLength > 500 ? "14px" :
    "16px";
  const familyBlockTop = hasEventDetails ? "380px" : "384px";
  const familyBlockWidth = hasEventDetails ? "220px" : "515px";
  const familyBlockMaxHeight = hasEventDetails ? (isExport ? "390px" : "315px") : "none";
  const familyBlockOverflow = isExport || !hasEventDetails ? "visible" : "hidden";

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
          left: "40px",
          top: "48px",
          width: "220px",
          height: "240px",
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
              width: "220px",
              height: "240px",
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
          left: "282px",
          top: "90px",
          width: "280px",
          margin: 0,
          fontFamily: "'Playfair Display', 'Georgia', serif",
          fontWeight: 600,
          fontSize: "40px",
          lineHeight: "40px",
          color: "#1d2735",
          textAlign: "center",
          whiteSpace: "normal",
          overflow: "visible",
          overflowWrap: "break-word",
          wordBreak: "normal",
        }}
      >
        {fullName}
      </p>

      {/* ── Idade + Anos + Localidade (alinhado com fundo da foto: 248px) */}
      <div
        style={{
          position: "absolute",
          left: "282px",
          top: ageBlockTop,
          width: "280px",
          textAlign: "center",
        }}
      >
        {(age !== undefined || (birthYear && deathYear)) && (
          <div
            style={{
              marginBottom: "4px",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "baseline",
              textAlign: "center",
            }}
          >
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
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "22px",
              color: "#1d2735",
              textAlign: "center",
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {locationLine}
          </p>
        )}
      </div>

      {/* ── FALECEU / FALECEU EM [PAÍS] ────────────────────────────────── */}
      <p
        style={{
          position: "absolute",
          left: "40px",
          top: "306px",
          width: "220px",
          margin: 0,
          fontWeight: 600,
          fontSize: deathLabelFontSize,
          lineHeight: deathLabelLineHeight,
          color: "#1d2735",
          textAlign: "center",
          overflowWrap: "anywhere",
          wordBreak: "normal",
        }}
      >
        {deathLabel}
      </p>

      {/* ── Texto familiar — coluna esquerda ───────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "40px",
          top: familyBlockTop,
          width: familyBlockWidth,
          maxHeight: familyBlockMaxHeight,
          overflow: familyBlockOverflow,
          fontWeight: 400,
          fontSize: familyFontSize,
          lineHeight: familyLineHeight,
          color: "#4e5562",
          textAlign: "left",
          overflowWrap: "anywhere",
          wordBreak: "break-all",
        }}
      >
        {familyText.split("\n\n").map((paragraph, pi) => (
          <React.Fragment key={pi}>
            {pi > 0 && <p style={{ lineHeight: familyLineHeight, margin: 0 }}>&nbsp;</p>}
            <p style={{ lineHeight: familyLineHeight, margin: 0, textAlign: "left", overflowWrap: "anywhere", wordBreak: "break-all" }}>{paragraph}</p>
          </React.Fragment>
        ))}
      </div>

      {/* ── Velório — coluna direita ───────────────────────────────────── */}
      {hasEventDetails && (
        <div
          style={{
            position: "absolute",
            left: hasManyEvents ? "282px" : "322px",
            top: "376px",
            width: hasManyEvents ? "288px" : "248px",
            maxHeight: isExport ? "410px" : "335px",
            overflow: isExport ? "visible" : "hidden",
            display: hasManyEvents ? "grid" : "flex",
            flexDirection: hasManyEvents ? undefined : "column",
            gridTemplateColumns: hasManyEvents ? "1fr 1fr" : undefined,
            columnGap: hasManyEvents ? "6px" : undefined,
            rowGap: hasManyEvents ? "10px" : undefined,
            gap: hasManyEvents ? undefined : "18px",
            alignItems: "start",
          }}
        >
          {events.map((item, index) => (
            <div
              key={item.title}
              style={{
                transform: hasManyEvents && index % 2 === 0 ? "translateX(40px)" : undefined,
              }}
            >
              <EventSection
                title={item.title}
                event={item.event}
                locationOnly={item.locationOnly}
                iconOffsetY={eventIconOffsetY}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Cortejo Fúnebre — coluna direita ───────────────────────────── */}
      

      {/* ── Funeral — coluna direita ───────────────────────────────────── */}
      

      {/* ── Cemitério — coluna direita ─────────────────────────────────── */}
      

      {/* ── Logo funerária — bottom left (background-image) ────────────── */}
      <div
        style={{
          position: "absolute",
          left: "32px",
          top: "733px",
          width: "205px",
          height: "90px",
        }}
      >
        {funeralHomeLogo && (
          <div
            style={{
              width: "138px",
              height: "42px",
              backgroundImage: `url(${funeralHomeLogo})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left bottom",
            }}
          />
        )}

      {/* ── Contactos — bottom left ────────────────────────────────────── */}
      {(phoneDisplay || email || website) && (
        <div
            style={{
              marginTop: "-3px",
              marginLeft: `${11 + footerContactsOffsetX}px`,
              width: "205px",
              fontWeight: 400,
              fontSize: "10px",
              lineHeight: "14px",
              color: "#4e5562",
              textAlign: "left",
          }}
        >
          {phoneDisplay && <p style={{ margin: 0 }}>{phoneDisplay}</p>}
          {email && <p style={{ margin: 0 }}>{email}</p>}
          {website && <p style={{ margin: 0 }}>{website}</p>}
        </div>
      )}
      </div>

      {/* ── QR code — bottom center ────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "232px",
          top: "750px",
          width: "175px",
          height: "64px",
        }}
      >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: `${footerQrCodeOffsetY}px`,
          width: "64px",
          height: "64px",
        }}
      >
        {qrCodeImage ? (
          <div
            style={{
              flex: "0 0 auto",
              width: "64px",
              height: "64px",
              backgroundImage: `url(${qrCodeImage})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
        ) : (
          <div
            style={{
              flex: "0 0 auto",
              width: "64px",
              height: "64px",
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
          left: "74px",
          top: `${22 + footerCondolencesOffsetY}px`,
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
      </div>

      {/* ── Flores decorativas — bottom right (background-image) ───────── */}
      {flowerImage && (
        <div
          style={{
            position: "absolute",
            left: "360px",
            top: "515px",
            width: "250px",
            height: "300px",
          }}
        >
          <img
            src={flowerImage}
            alt=""
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "right bottom",
              display: "block",
            }}
          />
        </div>
      )}
    </div>
  );
}
