import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
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
import { SeventhDayMassTemplate } from "@/components/SeventhDayMassTemplate";

interface AnnouncementGeneratorProps {
  obituaryId?: string;
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
    funerariaPhone2?: string;
    funerariaEmail?: string;
    funerariaWebsite?: string;
    funerariaLogoUrl?: string;
  };
}

const convertToGrayscale = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No canvas context");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const avg = (imageData.data[i] * 0.299 + imageData.data[i + 1] * 0.587 + imageData.data[i + 2] * 0.114);
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};

export const AnnouncementGenerator = ({ obituaryId, obituaryData }: AnnouncementGeneratorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("profissional");
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>("faleceu");
  const [includeFamilyMessage, setIncludeFamilyMessage] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | undefined>(undefined);
  const [grayscalePhoto, setGrayscalePhoto] = useState<string | undefined>(undefined);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const publicUrl = obituaryId ? `${window.location.origin}/obituario/${obituaryId}` : undefined;

  useEffect(() => {
    if (!publicUrl) return;
    const timer = setTimeout(() => {
      const canvas = qrRef.current?.querySelector("canvas");
      if (canvas) {
        setQrCodeDataUrl(canvas.toDataURL("image/png"));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [publicUrl]);

  useEffect(() => {
    if (!obituaryData.photoUrl) return;
    convertToGrayscale(obituaryData.photoUrl)
      .then(setGrayscalePhoto)
      .catch(() => setGrayscalePhoto(obituaryData.photoUrl));
  }, [obituaryData.photoUrl]);

  const formatDatePT = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const formatted = date.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return undefined;
    return timeStr.substring(0, 5);
  };

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

      if (announcementType === "missa_7") {
        return (
          <div id="obituary-template-a4">
            <SeventhDayMassTemplate
              fullName={obituaryData.displayName}
              photo={grayscalePhoto || obituaryData.photoUrl}
              age={calcAge}
              birthYear={birthYear}
              deathYear={deathYear}
              parish={obituaryData.parish}
              municipality={obituaryData.municipality}
              massDate={obituaryData.cerimoniaDate ? formatDatePT(obituaryData.cerimoniaDate) : undefined}
              massStartTime={formatTime(obituaryData.cerimoniaTime)}
              massLocation={obituaryData.cerimoniaChurch}
              familyText={includeFamilyMessage ? (obituaryData.publicMessage && obituaryData.publicMessage.length >= 10 ? obituaryData.publicMessage : undefined) : ""}
              funeralHomeLogo={obituaryData.funerariaLogoUrl}
              phone1={obituaryData.funerariaPhone}
              phone2={obituaryData.funerariaPhone2}
              email={obituaryData.funerariaEmail}
              website={obituaryData.funerariaWebsite}
              flowerImage="/images/flores-obituario.png"
            />
          </div>
        );
      }

      return (
        <ObituaryTemplateA4
          fullName={obituaryData.displayName}
          photo={grayscalePhoto || obituaryData.photoUrl}
          age={calcAge}
          birthYear={birthYear}
          deathYear={deathYear}
          parish={obituaryData.parish}
          municipality={obituaryData.municipality}
          deathCountry={obituaryData.deathLocation?.toUpperCase()}
          familyText={includeFamilyMessage ? (obituaryData.publicMessage && obituaryData.publicMessage.length >= 10 ? obituaryData.publicMessage : undefined) : ""}
          wake={obituaryData.velorioDate ? {
            date: formatDatePT(obituaryData.velorioDate),
            startTime: formatTime(obituaryData.velorioTime),
            location: obituaryData.velorioLocation,
          } : undefined}
          funeral={obituaryData.funeralDate ? {
            date: formatDatePT(obituaryData.funeralDate),
            time: formatTime(obituaryData.funeralTime),
            location: obituaryData.funeralCemetery,
          } : undefined}
          cemetery={obituaryData.funeralCemetery ? {
            location: obituaryData.funeralCemetery,
          } : undefined}
          funeralHomeLogo={obituaryData.funerariaLogoUrl}
          phone1={obituaryData.funerariaPhone}
          phone2={obituaryData.funerariaPhone2}
          email={obituaryData.funerariaEmail}
          website={obituaryData.funerariaWebsite}
          qrCodeImage={qrCodeDataUrl}
          flowerImage="/images/flores-obituario.png"
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
    if (selectedTemplate === "profissional") {
      // Native print approach – opens a new window with the template and triggers print
      const element = document.getElementById("obituary-template-a4");
      if (!element) {
        toast({ title: "Erro ao gerar PDF", description: "Template não encontrado", variant: "destructive" });
        return;
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({ title: "Erro ao gerar PDF", description: "Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desativado.", variant: "destructive" });
        return;
      }

      // Collect all stylesheets from the current page for font imports etc.
      const styleSheets = Array.from(document.styleSheets);
      let cssText = "";
      styleSheets.forEach((sheet) => {
        try {
          Array.from(sheet.cssRules).forEach((rule) => {
            cssText += rule.cssText + "\n";
          });
        } catch {
          // External sheets may throw SecurityError – import via link instead
          if (sheet.href) {
            cssText += `@import url("${sheet.href}");\n`;
          }
        }
      });

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Anúncio - ${obituaryData.displayName || "Obituário"}</title>
<style>
${cssText}
@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body { margin: 0; padding: 0; width: 210mm; height: 297mm; overflow: hidden; }
  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  #obituary-template-a4 { transform: scale(calc(210mm / 595px)); transform-origin: top left; }
}
html, body { margin: 0; padding: 0; }
</style>
</head>
<body>${element.outerHTML}</body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      // Wait for all images in the print window to load
      const imgs = printWindow.document.querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map(
          (img) =>
            img.complete && img.naturalWidth > 0
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                })
        )
      );

      // Small stabilization delay
      await new Promise((resolve) => setTimeout(resolve, 400));

      printWindow.focus();
      printWindow.print();

      toast({ title: "PDF pronto", description: "Use 'Guardar como PDF' no diálogo de impressão." });
      return;
    }

    // Fallback for other templates: use html2canvas + jsPDF
    setIsGenerating(true);
    try {
      const element = document.getElementById("announcement-preview");
      if (!element) throw new Error("Preview element not found");

      const images = element.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            img.complete && img.naturalWidth > 0
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                })
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`anuncio-${obituaryData.displayName || "obituario"}.pdf`);

      toast({ title: "PDF gerado com sucesso", description: "O anúncio foi exportado em formato A4" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "Erro ao gerar PDF", description: "Não foi possível gerar o PDF do anúncio", variant: "destructive" });
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
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
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

      {/* Hidden QR code canvas for generating data URL */}
      {publicUrl && (
        <div ref={qrRef} style={{ position: "absolute", left: -9999, top: -9999 }}>
          <QRCodeCanvas value={publicUrl} size={120} />
        </div>
      )}
    </div>
  );
};
