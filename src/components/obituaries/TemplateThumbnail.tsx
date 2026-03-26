import { type TemplateType } from "./types";

interface TemplateThumbnailProps {
  type: TemplateType;
  name: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

export const TemplateThumbnail = ({ type, name, description, isSelected, onClick }: TemplateThumbnailProps) => {
  const renderContent = () => {
    if (type === "profissional") {
      return (
        <div className="w-full h-full bg-white relative overflow-hidden" style={{ padding: '6%' }}>
          {/* Memoralis logo top-right */}
          <div className="absolute" style={{ top: '4%', right: '5%', width: '28%', height: '4%', backgroundColor: '#2d595e', borderRadius: 1, opacity: 0.7 }} />

          {/* Photo placeholder */}
          <div className="absolute" style={{ top: '6%', left: '7%', width: '29%', height: '25%', backgroundColor: '#d1d5db', borderRadius: 6 }} />

          {/* Name bars */}
          <div className="absolute" style={{ top: '14%', left: '42%', width: '48%', height: '3%', backgroundColor: '#1d2735', borderRadius: 1 }} />
          <div className="absolute" style={{ top: '19%', left: '42%', width: '35%', height: '2%', backgroundColor: '#1d2735', borderRadius: 1, opacity: 0.7 }} />

          {/* Age + locality */}
          <div className="absolute" style={{ top: '24%', left: '42%', width: '22%', height: '1.5%', backgroundColor: '#6c727f', borderRadius: 1 }} />
          <div className="absolute" style={{ top: '27%', left: '42%', width: '30%', height: '1.5%', backgroundColor: '#1d2735', borderRadius: 1 }} />

          {/* FALECEU text */}
          <div className="absolute" style={{ top: '36%', left: '7%', width: '22%', height: '2.5%', backgroundColor: '#6c727f', borderRadius: 1 }} />
          <div className="absolute" style={{ top: '40%', left: '7%', width: '16%', height: '2.5%', backgroundColor: '#6c727f', borderRadius: 1 }} />

          {/* Velório section */}
          <div className="absolute" style={{ top: '37%', left: '42%', width: '14%', height: '1.5%', backgroundColor: '#1d2735', borderRadius: 1 }} />
          <div className="absolute" style={{ top: '40%', left: '42%', width: '30%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.5 }} />
          <div className="absolute" style={{ top: '42.5%', left: '42%', width: '25%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.5 }} />
          <div className="absolute" style={{ top: '45%', left: '42%', width: '35%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.5 }} />

          {/* Family text */}
          <div className="absolute" style={{ top: '51%', left: '7%', width: '27%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.5 }} />
          <div className="absolute" style={{ top: '53.5%', left: '7%', width: '25%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.5 }} />
          <div className="absolute" style={{ top: '56%', left: '7%', width: '22%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.5 }} />
          <div className="absolute" style={{ top: '58.5%', left: '7%', width: '20%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.5 }} />

          {/* Funeral section */}
          <div className="absolute" style={{ top: '50%', left: '42%', width: '14%', height: '1.5%', backgroundColor: '#1d2735', borderRadius: 1 }} />
          <div className="absolute" style={{ top: '53%', left: '42%', width: '28%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.5 }} />
          <div className="absolute" style={{ top: '55.5%', left: '42%', width: '22%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.5 }} />
          <div className="absolute" style={{ top: '58%', left: '42%', width: '32%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.5 }} />

          {/* Cemitério section */}
          <div className="absolute" style={{ top: '64%', left: '42%', width: '16%', height: '1.5%', backgroundColor: '#1d2735', borderRadius: 1 }} />
          <div className="absolute" style={{ top: '67%', left: '42%', width: '30%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.5 }} />

          {/* Condolences text + QR */}
          <div className="absolute" style={{ top: '83%', left: '7%', width: '20%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.5 }} />
          <div className="absolute" style={{ top: '85.5%', left: '7%', width: '16%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.5 }} />
          <div className="absolute" style={{ top: '89%', left: '7%', width: '10%', height: '7%', backgroundColor: '#d1d5db', borderRadius: 1 }} />

          {/* Funeral home logo placeholder */}
          <div className="absolute" style={{ top: '83%', left: '42%', width: '25%', height: '5%', backgroundColor: '#d1d5db', borderRadius: 2 }} />
          {/* Contacts */}
          <div className="absolute" style={{ top: '90%', left: '42%', width: '30%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.4 }} />
          <div className="absolute" style={{ top: '92.5%', left: '42%', width: '24%', height: '1%', backgroundColor: '#4e5562', borderRadius: 1, opacity: 0.4 }} />
        </div>
      );
    } else if (type === "elegante") {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-700 p-2 flex flex-col items-center justify-center">
          <div className="text-amber-400 text-xl">✞</div>
          <div className="h-2 bg-white/80 rounded w-2/3 mt-2"></div>
          <div className="h-1 bg-white/60 rounded w-1/2 mt-1"></div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-full bg-white border-2 border-gray-300 p-2 flex flex-col items-center justify-center">
          <div className="text-blue-900 text-xl">✞</div>
          <div className="h-2 bg-gray-800 rounded w-2/3 mt-2"></div>
          <div className="h-1 bg-gray-600 rounded w-1/2 mt-1"></div>
        </div>
      );
    }
  };

  return (
    <button
      onClick={onClick}
      className={`relative rounded-lg border-2 overflow-hidden transition-all hover:scale-[1.02] ${
        isSelected
          ? "border-primary shadow-lg"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="aspect-[3/4] bg-muted">
        {renderContent()}
      </div>
      <div className={`p-2 text-center ${
        isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-background/90"
      }`}>
        <p className="text-xs font-medium">{name}</p>
        <p className="text-xs opacity-70">{description}</p>
      </div>
    </button>
  );
};
