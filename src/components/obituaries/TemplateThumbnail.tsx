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
        <div className="w-full h-full bg-white p-2 flex items-center justify-center">
          <div className="space-y-1 w-full">
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <div className="flex-1 space-y-1">
                <div className="h-2 bg-gray-400 rounded w-3/4"></div>
                <div className="h-1 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-1 bg-gray-200 rounded w-full"></div>
            <div className="h-1 bg-gray-200 rounded w-5/6"></div>
          </div>
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
