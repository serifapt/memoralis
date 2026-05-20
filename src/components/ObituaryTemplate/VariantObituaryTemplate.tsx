import React from "react";
import type { ObituaryTemplateProps, EventDetails } from "./types";
import { IconCalendar, IconClock, IconMapPin, LogoMemoralis } from "../shared/icons";

type Variant = "elegante" | "classico";

interface VariantObituaryTemplateProps extends ObituaryTemplateProps {
  variant: Variant;
}

const DEFAULT_FAMILY_TEXT =
  "Sua Familia cumpre o doloroso dever de participar a todas as pessoas das suas relacoes e amizade o seu falecimento.\n\nAntecipadamente, a Familia reconhecida agradece!";

const DEFAULT_CONDOLENCES = "Deixe uma mensagem\nde condolencias.";

const THEMES = {
  elegante: {
    background: "#1f2b3d",
    panel: "rgba(255,255,255,0.08)",
    border: "rgba(245, 158, 11, 0.35)",
    title: "#fbbf24",
    text: "#ffffff",
    muted: "rgba(255,255,255,0.78)",
    soft: "rgba(255,255,255,0.64)",
    font: "'Playfair Display', 'Georgia', serif",
    bodyFont: "'Inter', sans-serif",
  },
  classico: {
    background: "#ffffff",
    panel: "#f8fafc",
    border: "#d1d5db",
    title: "#1e3a8a",
    text: "#111827",
    muted: "#4b5563",
    soft: "#6b7280",
    font: "'Playfair Display', 'Georgia', serif",
    bodyFont: "'Inter', sans-serif",
  },
};

function EventRow({
  icon,
  text,
  color,
  iconOffsetY = 0,
}: {
  icon: React.ReactNode;
  text: string;
  color: string;
  iconOffsetY?: number;
}) {
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
          color,
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {text}
      </span>
    </div>
  );
}

function EventSection({
  title,
  event,
  locationOnly = false,
  theme,
  iconOffsetY = 0,
}: {
  title: string;
  event: EventDetails | Pick<EventDetails, "location"> | undefined;
  locationOnly?: boolean;
  theme: (typeof THEMES)[Variant];
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
          fontFamily: theme.bodyFont,
          fontWeight: 700,
          fontSize: "13px",
          lineHeight: "20px",
          color: theme.title,
        }}
      >
        {title}
      </p>
      {!locationOnly && ev.date && <EventRow icon={<IconCalendar />} text={ev.date} color={theme.muted} iconOffsetY={iconOffsetY} />}
      {!locationOnly && timeDisplay && <EventRow icon={<IconClock />} text={timeDisplay} color={theme.muted} iconOffsetY={iconOffsetY} />}
      {ev.location && <EventRow icon={<IconMapPin />} text={ev.location} color={theme.muted} iconOffsetY={iconOffsetY} />}
    </div>
  );
}

export function VariantObituaryTemplate({
  variant,
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
}: VariantObituaryTemplateProps) {
  const theme = THEMES[variant];
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
        backgroundColor: theme.background,
        overflow: "hidden",
        fontFamily: theme.bodyFont,
        color: theme.text,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "453px",
          top: "27px",
          width: "101px",
          height: "13px",
          overflow: "hidden",
          opacity: variant === "elegante" ? 0.9 : 1,
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

      <div
        style={{
          position: "absolute",
          left: "40px",
          top: "48px",
          width: "220px",
          height: "240px",
          borderRadius: variant === "elegante" ? "999px 999px 12px 12px" : "8px",
          overflow: "hidden",
          backgroundColor: variant === "elegante" ? "rgba(255,255,255,0.12)" : "#e5e7eb",
          border: `1px solid ${theme.border}`,
          ...(photo
            ? {
                backgroundImage: `url(${photo})`,
                backgroundSize: "cover",
                backgroundPosition: "center 20%",
                filter: variant === "classico" ? "grayscale(100%)" : undefined,
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
              color: theme.soft,
              fontSize: "12px",
            }}
          >
            Foto
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: "282px",
          top: "90px",
          width: "280px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: theme.font,
            fontWeight: 600,
            fontSize: "40px",
            lineHeight: "40px",
            color: theme.title,
            textAlign: "center",
            whiteSpace: "normal",
            overflow: "visible",
            overflowWrap: "break-word",
            wordBreak: "normal",
          }}
        >
          {fullName}
        </p>
      </div>

      <div style={{ position: "absolute", left: "282px", top: ageBlockTop, width: "280px", textAlign: "center" }}>
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
            {age !== undefined && <span style={{ fontWeight: 600, fontSize: "20px", lineHeight: "28px", color: theme.muted }}>{age} anos</span>}
            {birthYear && deathYear && (
              <span style={{ fontWeight: 400, fontSize: "14px", lineHeight: "22px", color: theme.muted }}>
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
              color: theme.text,
              textAlign: "center",
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {locationLine}
          </p>
        )}
      </div>

      <p
        style={{
          position: "absolute",
          left: "40px",
          top: "306px",
          width: "220px",
          margin: 0,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: deathLabelFontSize,
          lineHeight: deathLabelLineHeight,
          color: theme.title,
          textAlign: "center",
          overflowWrap: "anywhere",
          wordBreak: "normal",
        }}
      >
        {deathLabel}
      </p>

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
          color: theme.muted,
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
            columnGap: hasManyEvents ? "0px" : undefined,
            rowGap: hasManyEvents ? "0px" : undefined,
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
                theme={theme}
                iconOffsetY={eventIconOffsetY}
              />
            </div>
          ))}
        </div>
      )}

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
              filter: variant === "elegante" ? "brightness(0) invert(1)" : undefined,
            }}
          />
        )}

        {(phoneDisplay || email || website) && (
          <div
            style={{
              marginTop: "-3px",
              marginLeft: `${11 + footerContactsOffsetX}px`,
              width: "205px",
              fontWeight: 400,
              fontSize: "10px",
              lineHeight: "14px",
              color: theme.muted,
              textAlign: "left",
            }}
          >
            {phoneDisplay && <p style={{ margin: 0 }}>{phoneDisplay}</p>}
            {email && <p style={{ margin: 0 }}>{email}</p>}
            {website && <p style={{ margin: 0 }}>{website}</p>}
          </div>
        )}
      </div>

      <div style={{ position: "absolute", left: "232px", top: "750px", width: "175px", height: "64px" }}>
        <div style={{ position: "absolute", left: 0, top: `${footerQrCodeOffsetY}px`, width: "64px", height: "64px" }}>
        {qrCodeImage ? (
          <div
            style={{
              width: "64px",
              height: "64px",
              backgroundImage: `url(${qrCodeImage})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundColor: "#ffffff",
            }}
          />
        ) : (
          <div
            style={{
              width: "64px",
              height: "64px",
              border: `1px solid ${theme.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "7px",
              color: theme.soft,
            }}
          >
            QR
          </div>
        )}
        </div>

      <div
        style={{
          position: "absolute",
          left: "74px",
          top: `${22 + footerCondolencesOffsetY}px`,
          width: "100px",
          fontWeight: 400,
          fontSize: "11px",
          lineHeight: "15px",
          color: theme.muted,
        }}
      >
        {condolencesText.split("\n").map((line, i) => (
          <p key={i} style={{ margin: 0, lineHeight: "15px" }}>{line}</p>
        ))}
      </div>
      </div>

      {flowerImage && (
        <div
          style={{
            position: "absolute",
            left: "360px",
            top: "515px",
            width: "250px",
            height: "300px",
            opacity: variant === "elegante" ? 0.62 : 1,
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
