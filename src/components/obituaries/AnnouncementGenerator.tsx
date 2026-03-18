import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileDown, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { TemplateThumbnail } from "./TemplateThumbnail";
import { type TemplateType } from "./types";
import { ObituaryTemplateA4 } from "./ObituaryTemplateA4";

interface AnnouncementGeneratorProps {
  obituaryData: {
    displayName: string;
    birthDate: string;
    deathDate: string;
    publicMessage: string;
    velorioDate?: string;
    velorioTime?: string;
    velorioLocation?: string;
    cerimoniaDate?: string;
    cerimoniaTime?: string;
    cerimoniaChurch?: string;
    funeralDate?: string;
    funeralTime?: string;
    funeralCemetery?: string;
  };
}

export const AnnouncementGenerator = ({ obituaryData }: AnnouncementGeneratorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("profissional");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
  };

  const getTemplateStyles = (template: TemplateType) => {
    const styles = {
      profissional: {
        bg: "bg-white",
        text: "text-gray-800",
        accent: "text-gray-700",
        border: "border-gray-200",
        font: "font-sans",
      },
      elegante: {
        bg: "bg-gradient-to-br from-slate-900 to-slate-700",
        text: "text-white",
        accent: "text-amber-400",
        border: "border-amber-400/30",
        font: "font-serif",
      },
      classico: {
        bg: "bg-white",
        text: "text-gray-900",
        accent: "text-blue-900",
        border: "border-gray-300",
        font: "font-serif",
      },
    };
    return styles[template];
  };

  const renderPreview = () => {
    const styles = getTemplateStyles(selectedTemplate);
    
    if (selectedTemplate === "profissional") {
      return (
        <div 
          id="announcement-preview"
          className="bg-white p-8 rounded-lg min-h-[800px] relative"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          {/* Header - Logo memoralis */}
          <div className="absolute top-6 right-8 text-gray-400 text-sm font-light tracking-wider">
            ||| memoralis
          </div>

          <div className="grid grid-cols-2 gap-8 mt-12">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Photo placeholder */}
              <div className="w-64 h-64 bg-gray-300 rounded-3xl mx-auto"></div>

              {/* FALECEU text */}
              <div className="text-left">
                <h2 className="text-5xl font-bold text-gray-500 leading-tight mb-4">
                  FALECEU<br />EM FRANÇA
                </h2>
                
                {obituaryData.publicMessage && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {obituaryData.publicMessage}
                  </p>
                )}
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  Antecipadamente, a Família<br />reconhecida agradece!
                </p>
              </div>

              {/* QR Code and message */}
              <div className="mt-auto">
                <p className="text-sm text-gray-600 mb-2">
                  Deixe uma mensagem<br />de condolências.
                </p>
                <div className="w-24 h-24 bg-gray-300"></div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Name and details */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {obituaryData.displayName || "Nome do Falecido"}
                </h1>
                {obituaryData.birthDate && obituaryData.deathDate && (
                  <p className="text-2xl text-gray-500 mb-2">
                    55 anos · {new Date(obituaryData.birthDate).getFullYear()} - {new Date(obituaryData.deathDate).getFullYear()}
                  </p>
                )}
                <p className="text-lg text-gray-600">
                  Couto · Arcos de Valdevez
                </p>
              </div>

              {/* Ceremonies */}
              <div className="space-y-6 mt-8">
                {obituaryData.velorioDate && obituaryData.velorioLocation && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Câmara Ardente</h3>
                    <div className="space-y-1 text-gray-600">
                      <p className="flex items-center gap-2">
                        <span>📅</span> {formatDate(obituaryData.velorioDate)}
                      </p>
                      <p className="flex items-center gap-2">
                        <span>🕐</span> {obituaryData.velorioTime}
                      </p>
                      <p className="flex items-center gap-2">
                        <span>📍</span> {obituaryData.velorioLocation}
                      </p>
                    </div>
                  </div>
                )}

                {obituaryData.funeralDate && obituaryData.funeralCemetery && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Funeral</h3>
                    <div className="space-y-1 text-gray-600">
                      <p className="flex items-center gap-2">
                        <span>📅</span> {formatDate(obituaryData.funeralDate)}
                      </p>
                      <p className="flex items-center gap-2">
                        <span>🕐</span> {obituaryData.funeralTime}
                      </p>
                      <p className="flex items-center gap-2">
                        <span>📍</span> {obituaryData.funeralCemetery}
                      </p>
                    </div>
                  </div>
                )}

                {obituaryData.cerimoniaChurch && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Cemitério</h3>
                    <div className="space-y-1 text-gray-600">
                      <p className="flex items-center gap-2">
                        <span>📍</span> {obituaryData.cerimoniaChurch}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-black"></div>
                <div>
                  <p className="text-2xl font-bold">FUNERÁRIA</p>
                  <p className="text-2xl font-light">S. JOÃO</p>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                <p>962 766 625 | 258 515 233</p>
                <p>funeraria.s.joao@gmail.com</p>
                <p>funerariasjoao.pt</p>
              </div>
            </div>
            
            {/* Decorative flower */}
            <div className="w-32 h-32 opacity-50">
              <svg viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="30" r="8" fill="#666" />
                <circle cx="35" cy="40" r="8" fill="#666" />
                <circle cx="65" cy="40" r="8" fill="#666" />
                <circle cx="50" cy="50" r="8" fill="#666" />
                <rect x="48" y="50" width="4" height="40" fill="#333" />
              </svg>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        id="announcement-preview"
        className={`${styles.bg} ${styles.text} ${styles.font} p-8 rounded-lg border-2 ${styles.border} min-h-[600px] flex flex-col justify-center items-center text-center`}
      >
        <div className="space-y-6 max-w-2xl">
          <div className={`text-6xl ${styles.accent}`}>✞</div>
          
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${styles.accent}`}>
              {obituaryData.displayName || "Nome do Falecido"}
            </h1>
            {obituaryData.birthDate && obituaryData.deathDate && (
              <p className="text-xl opacity-80">
                {formatDate(obituaryData.birthDate)} - {formatDate(obituaryData.deathDate)}
              </p>
            )}
          </div>

          {obituaryData.publicMessage && (
            <p className="text-lg leading-relaxed italic max-w-xl mx-auto opacity-90">
              {obituaryData.publicMessage}
            </p>
          )}

          <div className="space-y-4 text-left max-w-xl mx-auto">
            {obituaryData.velorioDate && obituaryData.velorioLocation && (
              <div className="space-y-1">
                <p className={`font-semibold ${styles.accent}`}>Velório</p>
                <p>{formatDate(obituaryData.velorioDate)} às {obituaryData.velorioTime}</p>
                <p>{obituaryData.velorioLocation}</p>
              </div>
            )}

            {obituaryData.cerimoniaDate && obituaryData.cerimoniaChurch && (
              <div className="space-y-1">
                <p className={`font-semibold ${styles.accent}`}>Cerimónia</p>
                <p>{formatDate(obituaryData.cerimoniaDate)} às {obituaryData.cerimoniaTime}</p>
                <p>{obituaryData.cerimoniaChurch}</p>
              </div>
            )}

            {obituaryData.funeralDate && obituaryData.funeralCemetery && (
              <div className="space-y-1">
                <p className={`font-semibold ${styles.accent}`}>Funeral</p>
                <p>{formatDate(obituaryData.funeralDate)} às {obituaryData.funeralTime}</p>
                <p>{obituaryData.funeralCemetery}</p>
              </div>
            )}
          </div>

          <div className="pt-6">
            <p className="text-sm opacity-70">Descanse em paz</p>
          </div>
        </div>
      </div>
    );
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("announcement-preview");
      if (!element) {
        throw new Error("Preview element not found");
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`anuncio-${obituaryData.displayName || 'obituario'}.pdf`);

      toast({
        title: "PDF gerado com sucesso",
        description: "O anúncio foi exportado em formato A4",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF do anúncio",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async (format: "story" | "post") => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("announcement-preview");
      if (!element) {
        throw new Error("Preview element not found");
      }

      // Aspect ratios: 9:16 for stories, 3:4 for posts
      const aspectRatio = format === "story" ? 9 / 16 : 3 / 4;
      const width = format === "story" ? 1080 : 1080;
      const height = Math.round(width / aspectRatio);

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        width: width,
        height: height,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `anuncio-${obituaryData.displayName || 'obituario'}-${format}.jpg`;
          link.click();
          URL.revokeObjectURL(url);

          toast({
            title: "Imagem gerada com sucesso",
            description: `Formato ${format === "story" ? "9:16 (Stories)" : "3:4 (Post)"} exportado`,
          });
        }
      }, "image/jpeg", 0.95);
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Erro ao gerar imagem",
        description: "Não foi possível gerar a imagem do anúncio",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const templates = [
    { type: "profissional" as const, name: "Profissional", description: "Layout moderno com foto e detalhes" },
    { type: "elegante" as const, name: "Elegante", description: "Fundo escuro com elementos dourados" },
    { type: "classico" as const, name: "Clássico", description: "Design tradicional e sóbrio" },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label>Selecionar Template</Label>
            <div className="grid grid-cols-3 gap-4 mt-3">
              {templates.map((template) => (
                <TemplateThumbnail
                  key={template.type}
                  type={template.type}
                  name={template.name}
                  description={template.description}
                  isSelected={selectedTemplate === template.type}
                  onClick={() => setSelectedTemplate(template.type)}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Escolha um dos 3 templates predefinidos. Templates personalizados disponíveis com subscrição Pro.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={generatePDF} 
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              Gerar PDF (A4)
            </Button>
            
            <Button 
              onClick={() => generateImage("story")} 
              disabled={isGenerating}
              variant="secondary"
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              Gerar Story (9:16)
            </Button>
            
            <Button 
              onClick={() => generateImage("post")} 
              disabled={isGenerating}
              variant="secondary"
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              Gerar Post (3:4)
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Preview do Anúncio</h3>
        <div className="max-w-2xl mx-auto">
          {renderPreview()}
        </div>
      </Card>
    </div>
  );
};
