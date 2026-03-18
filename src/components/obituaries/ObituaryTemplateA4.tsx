import { Calendar, Clock, MapPin } from "lucide-react";

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
  const birth = new Date(birthDate);
  const death = new Date(deathDate);
  let age = death.getFullYear() - birth.getFullYear();
  const m = death.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && death.getDate() < birth.getDate())) age--;
  return age;
};

export const ObituaryTemplateA4 = ({ data }: ObituaryTemplateA4Props) => {
  const age = data.age ?? calculateAge(data.birthDate, data.deathDate);
  const birthYear = data.birthDate ? new Date(data.birthDate).getFullYear() : "";
  const deathYear = data.deathDate ? new Date(data.deathDate).getFullYear() : "";

  return (
    <div
      id="obituary-template-a4"
      className="bg-white aspect-[210/297] w-full relative overflow-hidden font-playfair"
      style={{ maxWidth: "794px" }}
    >
      <div className="absolute inset-0 p-[6%] flex flex-col">
        {/* Header - Memoralis logo */}
        <div className="flex justify-end mb-6">
          <img
            src="/lovable-uploads/logo-memoralis-template.png"
            alt="Memoralis"
            className="h-6 object-contain opacity-60"
          />
        </div>

        {/* Main content - two columns */}
        <div className="flex-1 grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="flex flex-col justify-between">
            {/* Photo */}
            <div className="mb-5">
              {data.photoUrl ? (
                <img
                  src={data.photoUrl}
                  alt={data.displayName}
                  className="w-48 h-48 object-cover rounded-3xl"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded-3xl" />
              )}
            </div>

            {/* FALECEU block */}
            <div className="mb-4">
              <h2 className="text-4xl font-bold text-gray-400 uppercase leading-tight tracking-wide">
                FALECEU
                {data.deathLocation && (
                  <>
                    <br />
                    EM {data.deathLocation.toUpperCase()}
                  </>
                )}
              </h2>
            </div>

            {/* Public message / family text */}
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
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-1">
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
            <div className="space-y-5 flex-1">
              {/* Câmara Ardente */}
              {data.velorioDate && data.velorioLocation && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Câmara Ardente
                  </h3>
                  <div className="space-y-1.5 text-sm text-gray-600 font-sans">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                      {formatDatePT(data.velorioDate)}
                    </p>
                    {data.velorioTime && (
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                        {data.velorioTime}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      {data.velorioLocation}
                    </p>
                  </div>
                </div>
              )}

              {/* Funeral */}
              {data.funeralDate && data.funeralLocation && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Funeral
                  </h3>
                  <div className="space-y-1.5 text-sm text-gray-600 font-sans">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                      {formatDatePT(data.funeralDate)}
                    </p>
                    {data.funeralTime && (
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                        {data.funeralTime}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      {data.funeralLocation}
                    </p>
                  </div>
                </div>
              )}

              {/* Cemitério */}
              {data.cemeteryName && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Cemitério
                  </h3>
                  <div className="text-sm text-gray-600 font-sans">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      {data.cemeteryName}
                    </p>
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
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <img
                  src="/lovable-uploads/logo-funeraria.png"
                  alt="Funerária"
                  className="h-10 w-10 object-contain"
                />
              )}
              <div>
                <p className="text-base font-bold text-gray-900 font-sans leading-tight">
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
