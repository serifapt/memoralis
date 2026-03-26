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
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <IconCalendar />
            <span style={{ fontWeight: 400, fontSize: 12, color: "#4e5562" }}>{date}</span>
          </div>
        )}
        {timeDisplay && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <IconClock />
            <span style={{ fontWeight: 400, fontSize: 12, color: "#4e5562" }}>{timeDisplay}</span>
          </div>
        )}
        {location && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <IconMapPin />
            <span style={{ fontWeight: 400, fontSize: 12, color: "#4e5562" }}>{location}</span>
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
  familyText = DEFAULT_FAMILY_TEXT,
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
        width: 595,
        height: 842,
        backgroundColor: "#ffffff",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Memoralis logo */}
      {memoralisLogo && (
        <div style={{ position: "absolute", top: 27, left: 471 }}>
          <LogoMemoralis />
        </div>
      )}

      {/* Photo */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40.67,
          width: 173.333,
          height: 208,
          borderRadius: 30,
          overflow: "hidden",
        }}
      >
        {photo ? (
          <img
            src={photo}
            alt={fullName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(100%)",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", backgroundColor: "#d1d5db" }} />
        )}
      </div>

      {/* Full name */}
      <div
        style={{
          position: "absolute",
          top: 103,
          left: 255.78,
          width: 309.6,
        }}
      >
        <p
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontWeight: 500,
            fontSize: 32,
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
            top: 194,
            left: 255.78,
            display: "flex",
            alignItems: "baseline",
            gap: 4,
          }}
        >
          {age && (
            <span style={{ fontWeight: 600, fontSize: 20, color: "#6c727f" }}>
              {age} anos
            </span>
          )}
          {birthYear && deathYear && (
            <span style={{ fontWeight: 400, fontSize: 14, color: "#6c727f" }}>
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
            top: 224,
            left: 255.78,
          }}
        >
          <p style={{ fontWeight: 600, fontSize: 16, color: "#1d2735", margin: 0 }}>
            {locality}
          </p>
        </div>
      )}

      {/* FALECEU EM [country] */}
      <div
        style={{
          position: "absolute",
          top: 304,
          left: 40,
          width: 160,
        }}
      >
        <p
          style={{
            fontWeight: 600,
            fontSize: 24,
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
      <div
        style={{
          position: "absolute",
          top: 425.21,
          left: 40.67,
          width: 160,
        }}
      >
        <p
          style={{
            fontWeight: 400,
            fontSize: 12,
            lineHeight: "18px",
            color: "#4e5562",
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {familyText}
        </p>
      </div>

      {/* Câmara Ardente */}
      {wake && (
        <div style={{ position: "absolute", top: 307, left: 256.78 }}>
          <EventSection
            title="Câmara Ardente"
            date={wake.date}
            startTime={wake.startTime}
            endTime={wake.endTime}
            location={wake.location}
          />
        </div>
      )}

      {/* Funeral */}
      {funeral && (
        <div style={{ position: "absolute", top: 422.21, left: 254 }}>
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
        <div style={{ position: "absolute", top: 547.42, left: 254 }}>
          <EventSection
            title="Cemitério"
            location={cemetery.location}
          />
        </div>
      )}

      {/* Condolences text */}
      <div style={{ position: "absolute", top: 697.2, left: 40 }}>
        <p
          style={{
            fontWeight: 400,
            fontSize: 12,
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
          top: 745,
          left: 40.7,
          width: 56.88,
          height: 56.88,
        }}
      >
        {qrCodeImage ? (
          <img
            src={qrCodeImage}
            alt="QR Code"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", backgroundColor: "#d1d5db", borderRadius: 4 }} />
        )}
      </div>

      {/* Funeral home logo */}
      {funeralHomeLogo && (
        <div style={{ position: "absolute", top: 697.2, left: 254 }}>
          <img
            src={funeralHomeLogo}
            alt="Funerária"
            style={{ width: 150, height: 43, objectFit: "contain" }}
          />
        </div>
      )}

      {/* Contacts */}
      {(phone1 || phone2 || email || website) && (
        <div
          style={{
            position: "absolute",
            top: 754.89,
            left: 254.58,
            fontWeight: 400,
            fontSize: 9,
            lineHeight: "18px",
            color: "#4e5562",
          }}
        >
          {phone1 && phone2 && <p style={{ margin: 0 }}>{phone1} · {phone2}</p>}
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
            top: 568.42,
            left: 326.25,
            width: 275.298,
            height: 313.631,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <img
            src={flowerImage}
            alt=""
            style={{
              width: 204.885,
              height: 263.908,
              transform: "rotate(17.66deg)",
              objectFit: "contain",
            }}
          />
        </div>
      )}
    </div>
  );
};
