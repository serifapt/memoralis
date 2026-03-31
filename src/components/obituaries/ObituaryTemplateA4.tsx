import { ObituaryTemplateProps } from "./ObituaryTypes";
import { IconCalendar, IconClock, IconMapPin, LogoMemoralis } from "./ObituaryIcons";

interface EventSectionProps {
  title: string;
  date?: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
}

const IconSlot = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      width: "14px",
      height: "18px",
    }}
  >
    {children}
  </span>
);

const EventSection = ({ title, date, time, startTime, endTime, location }: EventSectionProps) => {
  const timeDisplay = startTime && endTime
    ? `${startTime} - ${endTime}`
    : startTime || endTime || time;

  return (
    <div>
      <p style={{ fontWeight: 600, fontSize: 14, color: "#1d2735", marginBottom: 8 }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {date && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <IconSlot><IconCalendar /></IconSlot>
            <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#4e5562" }}>{date}</span>
          </div>
        )}
        {timeDisplay && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <IconSlot><IconClock /></IconSlot>
            <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#4e5562" }}>{timeDisplay}</span>
          </div>
        )}
        {location && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <IconSlot><IconMapPin /></IconSlot>
            <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", color: "#4e5562" }}>{location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const DEFAULT_FAMILY_TEXT =
  "Sua Família cumpre o doloroso dever de participar a todas as pessoas das suas relações e amizade o seu falecimento.\n\nAntecipadamente, a Família reconhecida agradece!";

const DEFAULT_CONDOLENCES_TEXT = "Deixe uma mensagem\nde condolências.";

export const ObituaryTemplateA4 = ({
  memoralisLogo = true,
  photo,
  fullName = "Nome Completo",
  age,
  birthYear,
  deathYear,
  parish,
  municipality,
  deathCountry,
  familyText,
  wake,
  funeral,
  cemetery,
  condolencesText = DEFAULT_CONDOLENCES_TEXT,
  qrCodeImage,
  funeralHomeLogo,
  phone1,
  phone2,
  email,
  website,
  flowerImage,
}: ObituaryTemplateProps) => {
  const locality = [parish, municipality].filter(Boolean).join(" · ");

  return (
    <div
      id="obituary-template-a4"
      style={{
        position: "relative",
        width: "595px",
        height: "842px",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Memoralis logo */}
      {memoralisLogo && (
        <div style={{ position: "absolute", top: "24px", left: "440px", width: "130px", height: "17px", overflow: "hidden", opacity: 0.3 }}>
          <LogoMemoralis />
        </div>
      )}

      {/* Photo */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "40px",
          width: "173px",
          height: "208px",
          borderRadius: "30px",
          overflow: "hidden",
          background: "#d1d5db",
        }}
      >
        {photo ? (
          <img
            src={photo}
            alt={fullName}
            style={{
              display: "block",
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
        ) : null}
      </div>

      {/* Full name */}
      <div
        style={{
          position: "absolute",
          top: "103px",
          left: "256px",
          width: "310px",
        }}
      >
        <p
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontWeight: 500,
            fontSize: "32px",
            lineHeight: "40px",
            color: "#1d2735",
            margin: 0,
          }}
        >
          {fullName}
        </p>
      </div>

      {/* Age + years */}
      {(age || birthYear || deathYear) && (
        <div
          style={{
            position: "absolute",
            top: "194px",
            left: "256px",
            display: "flex",
            alignItems: "baseline",
            gap: "4px",
          }}
        >
          {age && (
            <span style={{ fontWeight: 600, fontSize: "20px", color: "#6c727f" }}>
              {age} anos
            </span>
          )}
          {birthYear && deathYear && (
            <span style={{ fontWeight: 400, fontSize: "14px", color: "#6c727f" }}>
              · {birthYear} - {deathYear}
            </span>
          )}
        </div>
      )}

      {/* Locality */}
      {locality && (
        <div
          style={{
            position: "absolute",
            top: "224px",
            left: "256px",
          }}
        >
          <p style={{ fontWeight: 600, fontSize: "16px", color: "#1d2735", margin: 0 }}>
            {locality}
          </p>
        </div>
      )}

      {/* FALECEU EM [country] */}
      <div
        style={{
          position: "absolute",
          top: "304px",
          left: "40px",
          width: "160px",
        }}
      >
        <p
          style={{
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "32px",
            color: "#6c727f",
            margin: 0,
          }}
        >
          FALECEU
          {deathCountry && (
            <>
              {" "}EM {deathCountry.toUpperCase()}
            </>
          )}
        </p>
      </div>

      {/* Family text */}
      {familyText && (
        <div
          style={{
            position: "absolute",
            top: "425px",
            left: "40px",
            width: "160px",
          }}
        >
          <p
            style={{
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "18px",
              color: "#4e5562",
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {familyText}
          </p>
        </div>
      )}

      {/* Velório */}
      {wake && (
        <div style={{ position: "absolute", top: "307px", left: "257px" }}>
          <EventSection
            title="Velório"
            date={wake.date}
            startTime={wake.startTime}
            endTime={wake.endTime}
            location={wake.location}
          />
        </div>
      )}

      {/* Funeral */}
      {funeral && (
        <div style={{ position: "absolute", top: "422px", left: "254px" }}>
          <EventSection
            title="Funeral"
            date={funeral.date}
            time={funeral.time}
            location={funeral.location}
          />
        </div>
      )}

      {/* Cemitério */}
      {cemetery && (
        <div style={{ position: "absolute", top: "547px", left: "254px" }}>
          <EventSection
            title="Cemitério"
            location={cemetery.location}
          />
        </div>
      )}

      {/* Condolences text */}
      <div style={{ position: "absolute", top: "697px", left: "40px" }}>
        <p
          style={{
            fontWeight: 400,
            fontSize: "12px",
            color: "#4e5562",
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {condolencesText}
        </p>
      </div>

      {/* QR code */}
      <div
        style={{
          position: "absolute",
          top: "745px",
          left: "40px",
          width: "57px",
          height: "57px",
        }}
      >
        {qrCodeImage ? (
          <img
            src={qrCodeImage}
            alt="QR Code"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", backgroundColor: "#d1d5db", borderRadius: "4px" }} />
        )}
      </div>

      {/* Funeral home logo */}
      {funeralHomeLogo && (
        <div style={{ position: "absolute", top: "697px", left: "254px" }}>
          <img
            src={funeralHomeLogo}
            alt="Funerária"
            style={{ width: "150px", height: "43px", objectFit: "contain" }}
          />
        </div>
      )}

      {/* Contacts */}
      {(phone1 || phone2 || email || website) && (
        <div
          style={{
            position: "absolute",
            top: "755px",
            left: "255px",
            fontWeight: 400,
            fontSize: "9px",
            lineHeight: "18px",
            color: "#4e5562",
          }}
        >
          {phone1 && phone2 && <p style={{ margin: 0 }}>{phone1} | {phone2}</p>}
          {phone1 && !phone2 && <p style={{ margin: 0 }}>{phone1}</p>}
          {!phone1 && phone2 && <p style={{ margin: 0 }}>{phone2}</p>}
          {email && <p style={{ margin: 0 }}>{email}</p>}
          {website && <p style={{ margin: 0 }}>{website}</p>}
        </div>
      )}

      {/* Decorative flowers */}
      {flowerImage && (
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            width: "250px",
            height: "250px",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <img
            src={flowerImage}
            alt=""
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "bottom right",
            }}
          />
        </div>
      )}
    </div>
  );
};
