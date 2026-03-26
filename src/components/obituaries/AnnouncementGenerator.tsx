import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { TemplateThumbnail } from "./TemplateThumbnail";
import { type TemplateType, type AnnouncementType } from "./types";
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
    photoUrl?: string;
    deathLocation?: string;
    parish?: string;
    municipality?: string;
    funerariaName?: string;
    funerariaPhone?: string;
    funerariaEmail?: string;
    funerariaWebsite?: string;
    funerariaLogoUrl?: string;
  };
}

export const AnnouncementGenerator = ({ obituaryData }: AnnouncementGeneratorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("profissional");
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>("faleceu");
  const [includeFamilyMessage, setIncludeFamilyMessage] = useState(true);
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
      const birthYear = obituaryData.birthDate ? new Date(obituaryData.birthDate).getFullYear() : undefined;
      const deathYear = obituaryData.deathDate ? new Date(obituaryData.deathDate).getFullYear() : undefined;
      const calcAge = birthYear && deathYear ? deathYear - birthYear : undefined;

      return (
        <ObituaryTemplateA4
          fullName={obituaryData.displayName}
          photo={obituaryData.photoUrl}
          age={calcAge}
          birthYear={birthYear}
          deathYear={deathYear}
          parish={obituaryData.parish}
          municipality={obituaryData.municipality}
          deathCountry={announcementType === "faleceu_local" ? obituaryData.deathLocation : undefined}
          familyText={includeFamilyMessage ? (obituaryData.publicMessage || undefined) : ""}
          wake={obituaryData.velorioDate ? {
            date: obituaryData.velorioDate,
            startTime: obituaryData.velorioTime,
            location: obituaryData.velorioLocation,
          } : undefined}
          funeral={obituaryData.funeralDate ? {
            date: obituaryData.funeralDate,
            time: obituaryData.funeralTime,
            location: obituaryData.funeralCemetery,
          } : undefined}
          cemetery={obituaryData.cerimoniaChurch ? {
            location: obituaryData.cerimoniaChurch,
          } : undefined}
          funeralHomeLogo={obituaryData.funerariaLogoUrl}
          phone1={obituaryData.funerariaPhone}
          email={obituaryData.funerariaEmail}
          website={obituaryData.funerariaWebsite}
        />
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
      const elementId = selectedTemplate === "profissional" ? "obituary-template-a4" : "announcement-preview";
      const element = document.getElementById(elementId);
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
      const elementId = selectedTemplate === "profissional" ? "obituary-template-a4" : "announcement-preview";
      const element = document.getElementById(elementId);
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
      {/* Announcement options */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label>Tipo de Anúncio</Label>
            <Select value={announcementType} onValueChange={(v) => setAnnouncementType(v as AnnouncementType)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="faleceu">Faleceu</SelectItem>
                <SelectItem value="faleceu_local">
                  Faleceu em "{obituaryData.deathLocation || 'local'}"
                </SelectItem>
                <SelectItem value="missa_7">Missa 7º Dia</SelectItem>
                <SelectItem value="missa_30">Missa 30º Dia</SelectItem>
                <SelectItem value="missa_aniversario">Missa 1º Aniversário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="includeFamilyMessage"
              checked={includeFamilyMessage}
              onCheckedChange={(checked) => setIncludeFamilyMessage(checked === true)}
            />
            <Label htmlFor="includeFamilyMessage" className="cursor-pointer">
              Incluir mensagem da família do processo
            </Label>
          </div>
        </div>
      </Card>

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
