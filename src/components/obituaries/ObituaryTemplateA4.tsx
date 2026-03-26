import { type AnnouncementType } from "./types";

export interface ObituaryTemplateA4Data {
  displayName: string;
  birthDate: string;
  deathDate: string;
  age?: number;
  parish?: string;
  municipality?: string;
  deathLocation?: string;
  photoUrl?: string;
  publicMessage?: string;
  velorioDate?: string;
  velorioTime?: string;
  velorioLocation?: string;
  funeralDate?: string;
  funeralTime?: string;
  funeralLocation?: string;
  cemeteryName?: string;
  funerariaName?: string;
  funerariaPhone?: string;
  funerariaEmail?: string;
  funerariaWebsite?: string;
  funerariaLogoUrl?: string;
  announcementType?: AnnouncementType;
  includeDeathLocation?: boolean;
  includeFamilyMessage?: boolean;
}

interface ObituaryTemplateA4Props {
  data: ObituaryTemplateA4Data;
}

const formatDatePT = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const calculateAge = (birthDate: string, deathDate: string): number | null => {
  if (!birthDate || !deathDate) return null;
  try {
    const [bY, bM, bD] = birthDate.split("-").map(Number);
    const [dY, dM, dD] = deathDate.split("-").map(Number);
    let age = dY - bY;
    if (dM < bM || (dM === bM && dD < bD)) age--;
    return age;
  } catch { return null; }
};

export const ObituaryTemplateA4 = ({ data }: ObituaryTemplateA4Props) => {
  const age = data.age ?? calculateAge(data.birthDate, data.deathDate);
  const birthYear = data.birthDate ? new Date(data.birthDate).getFullYear() : "";
  const deathYear = data.deathDate ? new Date(data.deathDate).getFullYear() : "";
  const announcementType = data.announcementType || "faleceu";
  const includeFamilyMessage = data.includeFamilyMessage !== false;

  return (
    <div
      id="obituary-template-a4"
      className="bg-white aspect-[210/297] w-full relative overflow-hidden font-playfair"
      style={{ maxWidth: "794px" }}
    >
      <div className="absolute inset-0 p-[6%] flex flex-col">
        {/* Header - Memoralis logo */}
        <div className="flex justify-end mb-8">
          <img
            src="/lovable-uploads/logo-memoralis-template.png"
            alt="Memoralis"
            className="h-6 object-contain opacity-60"
          />
        </div>

        {/* Main content - two columns */}
        <div className="flex-1 grid grid-cols-2 gap-10">
          {/* Left Column */}
          <div className="flex flex-col justify-between">
            {/* Photo */}
            <div className="mb-6">
              {data.photoUrl ? (
                <img
                  src={data.photoUrl}
                  alt={data.displayName}
                  className="w-48 h-64 object-cover rounded-[40px]"
                />
              ) : (
                <div className="w-48 h-64 bg-gray-200 rounded-[40px]" />
              )}
            </div>

            {/* Announcement type block */}
            <div className="mb-6">
              <p className="font-sans font-bold text-sm text-gray-400 uppercase tracking-[0.25em] leading-relaxed">
                {(!announcementType || announcementType === "faleceu") && "FALECEU"}
                {announcementType === "faleceu_local" && (
                  <>
                    FALECEU
                    {data.deathLocation && (
                      <>
                        <br />
                        EM {data.deathLocation.toUpperCase()}
                      </>
                    )}
                  </>
                )}
                {announcementType === "missa_7" && "MISSA DO 7º DIA"}
                {announcementType === "missa_30" && "MISSA DO 30º DIA"}
                {announcementType === "missa_aniversario" && "MISSA DO 1º ANIVERSÁRIO"}
              </p>
            </div>

            {/* Public message / family text */}
            {includeFamilyMessage && (
              <div className="space-y-3 text-[11px] text-gray-600 leading-relaxed font-sans">
                {data.publicMessage ? (
                  <p>{data.publicMessage}</p>
                ) : (
                  <p>
                    Sua Família cumpre o doloroso dever de participar a todas as
                    pessoas de suas relações e amizade o falecimento do seu
                    saudoso familiar.
                  </p>
                )}
                <p>Antecipadamente, a Família reconhecida agradece!</p>
              </div>
            )}

            {/* QR code area */}
            <div className="mt-auto pt-4">
              <p className="text-[10px] text-gray-500 font-sans mb-2">
                Deixe uma mensagem
                <br />
                de condolências.
              </p>
              <div className="w-16 h-16 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            {/* Name and details */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-1">
                {data.displayName || "Nome do Falecido"}
              </h1>
              {(age || birthYear) && (
                <p className="text-xl text-gray-500 font-sans mb-1">
                  {age && <span className="font-semibold">{age} anos</span>}
                  {age && birthYear && " · "}
                  {birthYear && deathYear && (
                    <span>
                      {birthYear} - {deathYear}
                    </span>
                  )}
                </p>
              )}
              {(data.parish || data.municipality) && (
                <p className="text-base text-gray-500 font-sans">
                  {[data.parish, data.municipality].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>

            {/* Ceremony sections */}
            <div className="space-y-6 flex-1">
              {/* Câmara Ardente */}
              {data.velorioDate && data.velorioLocation && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">
                    Câmara Ardente
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 font-sans pl-1">
                    <p>{formatDatePT(data.velorioDate)}</p>
                    {data.velorioTime && <p>{data.velorioTime}</p>}
                    <p>{data.velorioLocation}</p>
                  </div>
                </div>
              )}

              {/* Funeral */}
              {data.funeralDate && data.funeralLocation && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">
                    Funeral
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 font-sans pl-1">
                    <p>{formatDatePT(data.funeralDate)}</p>
                    {data.funeralTime && <p>{data.funeralTime}</p>}
                    <p>{data.funeralLocation}</p>
                  </div>
                </div>
              )}

              {/* Cemitério */}
              {data.cemeteryName && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">
                    Cemitério
                  </h3>
                  <div className="text-sm text-gray-600 font-sans pl-1">
                    <p>{data.cemeteryName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-end justify-between">
            {/* Funeral home info */}
            <div className="flex items-center gap-3">
              {data.funerariaLogoUrl ? (
                <img
                  src={data.funerariaLogoUrl}
                  alt={data.funerariaName || "Funerária"}
                  className="h-12 w-12 object-contain"
                />
              ) : (
                <img
                  src="/lovable-uploads/logo-funeraria.png"
                  alt="Funerária"
                  className="h-12 w-12 object-contain"
                />
              )}
              <div>
                <p className="text-lg font-bold text-gray-900 font-sans leading-tight">
                  {data.funerariaName || "FUNERÁRIA"}
                </p>
                <div className="text-[9px] text-gray-500 font-sans space-y-0">
                  {data.funerariaPhone && <p>{data.funerariaPhone}</p>}
                  {data.funerariaEmail && <p>{data.funerariaEmail}</p>}
                  {data.funerariaWebsite && <p>{data.funerariaWebsite}</p>}
                </div>
              </div>
            </div>

            {/* Decorative flowers */}
            <img
              src="/lovable-uploads/flores-template.png"
              alt=""
              className="h-24 w-24 object-contain opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
