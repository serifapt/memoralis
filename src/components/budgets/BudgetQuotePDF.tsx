import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { BudgetQuote, BudgetQuoteSection } from "@/hooks/useBudgetQuotes";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface BudgetQuotePDFProps {
  quote: BudgetQuote;
  sections: BudgetQuoteSection[];
  funerariaName?: string;
  funerariaNif?: string;
  funerariaPhone?: string;
  funerariaAddress?: string;
  funerariaEmail?: string;
  funerariaLocality?: string;
  funerariaPostalCode?: string;
  funerariaLogoUrl?: string | null;
}

export function BudgetQuotePDF({ 
  quote, 
  sections, 
  funerariaName = "Funerária", 
  funerariaNif = "",
  funerariaPhone = "",
  funerariaAddress = "",
  funerariaEmail = "",
  funerariaLocality = "",
  funerariaPostalCode = "",
  funerariaLogoUrl,
}: BudgetQuotePDFProps) {
  const pdfRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-PT");
  };

  const handleGeneratePDF = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;

    pdf.addImage(imgData, "PNG", imgX, 0, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`orcamento-${quote.quote_number}.pdf`);
  };

  // Filter out zero-value lines per section
  const visibleSections = sections
    .map((section) => {
      const visibleLines = section.lines.filter(
        (line) => line.line_total > 0 || line.unit_price > 0
      );
      const subtotal = visibleLines.reduce((sum, l) => sum + l.line_total, 0);
      return { ...section, lines: visibleLines, subtotal };
    })
    .filter((section) => section.lines.length > 0);

  const total = visibleSections.reduce((sum, s) => sum + s.subtotal, 0);
  const funerariaFullAddress = [funerariaAddress, funerariaLocality, funerariaPostalCode].filter(Boolean).join(", ");

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleGeneratePDF}>
        <FileText className="w-4 h-4 mr-2" />
        Gerar PDF
      </Button>

      {/* Hidden PDF Template */}
      <div className="fixed left-[-9999px] top-0">
        <div 
          ref={pdfRef} 
          className="bg-white text-black w-[210mm] min-h-[297mm] font-sans text-[11px]"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b-2" style={{ borderColor: "#000000" }}>
            <div className="flex items-center gap-4">
              {funerariaLogoUrl && (
                <img 
                  src={funerariaLogoUrl} 
                  alt="Logo" 
                  className="object-contain"
                  style={{ maxHeight: "56px", maxWidth: "120px" }}
                  crossOrigin="anonymous"
                />
              )}
              <div>
                <h1 className="text-lg font-bold" style={{ color: "#000000" }}>{funerariaName}</h1>
                {funerariaFullAddress && (
                  <p className="text-[10px]" style={{ color: "#333333" }}>{funerariaFullAddress}</p>
                )}
                <div className="flex gap-4 mt-0.5">
                  {funerariaPhone && (
                    <span className="text-[10px]" style={{ color: "#333333" }}>Tel: {funerariaPhone}</span>
                  )}
                  {funerariaEmail && (
                    <span className="text-[10px]" style={{ color: "#333333" }}>{funerariaEmail}</span>
                  )}
                </div>
                {funerariaNif && (
                  <p className="text-[10px] mt-0.5" style={{ color: "#555555" }}>NIF: {funerariaNif}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="px-5 py-3 border-2" style={{ borderColor: "#000000" }}>
                <p className="text-[10px] font-medium tracking-wider uppercase" style={{ color: "#555555" }}>Orçamento</p>
                <p className="text-xl font-bold" style={{ color: "#000000" }}>Nº {quote.quote_number}</p>
              </div>
              <p className="mt-2 text-[10px]" style={{ color: "#555555" }}>Data: {formatDate(quote.issue_date)}</p>
            </div>
          </div>

          <div className="px-8 pt-5 pb-6">
            {/* Client + Deceased side by side */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="border border-gray-200 rounded overflow-hidden">
                <div className="px-3 py-1.5" style={{ backgroundColor: "#f1f5f9" }}>
                  <h2 className="font-bold text-[11px]" style={{ color: "#334155" }}>CLIENTE</h2>
                </div>
                <div className="p-3 space-y-0.5 text-[10px]">
                  <p><span className="font-semibold" style={{ color: "#475569" }}>Nome:</span> {quote.client?.full_name || "-"}</p>
                  <p><span className="font-semibold" style={{ color: "#475569" }}>Endereço:</span> {quote.client?.address || "-"}</p>
                  <p><span className="font-semibold" style={{ color: "#475569" }}>Localidade:</span> {quote.client?.city || "-"}</p>
                  <p><span className="font-semibold" style={{ color: "#475569" }}>C.P.:</span> {quote.client?.postal_code || "-"}</p>
                  <p><span className="font-semibold" style={{ color: "#475569" }}>Telefone:</span> {quote.client?.phone || "-"}</p>
                  <p><span className="font-semibold" style={{ color: "#475569" }}>NIF:</span> {quote.client?.nif || "-"}</p>
                </div>
              </div>
              <div className="border border-gray-200 rounded overflow-hidden">
                <div className="px-3 py-1.5" style={{ backgroundColor: "#f1f5f9" }}>
                  <h2 className="font-bold text-[11px]" style={{ color: "#334155" }}>DADOS DO FALECIDO</h2>
                </div>
                <div className="p-3 space-y-0.5 text-[10px]">
                  <p><span className="font-semibold" style={{ color: "#475569" }}>Nome:</span> {quote.deceased_name || "-"}</p>
                  <p><span className="font-semibold" style={{ color: "#475569" }}>Data Falecimento:</span> {formatDate(quote.death_date)}</p>
                  <p><span className="font-semibold" style={{ color: "#475569" }}>Data Funeral:</span> {formatDate(quote.funeral_date)}</p>
                  <p><span className="font-semibold" style={{ color: "#475569" }}>Cemitério:</span> {quote.cemetery || "-"}</p>
                  <p><span className="font-semibold" style={{ color: "#475569" }}>Local Falecimento:</span> {quote.place_of_death || "-"}</p>
                </div>
              </div>
            </div>

            {/* Sections / Services */}
            {visibleSections.map((section) => (
              <div key={section.id} className="mb-4">
                <div className="px-2 py-1.5" style={{ backgroundColor: "#f1f5f9", borderBottom: "1px solid #000000" }}>
                  <h3 className="font-bold text-[11px]" style={{ color: "#000000" }}>{section.title}</h3>
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc" }}>
                      <th className="text-center py-1.5 w-10 text-[10px] font-semibold border-b" style={{ color: "#000000", borderColor: "#cccccc" }}>Qtd</th>
                      <th className="text-left py-1.5 text-[10px] font-semibold border-b" style={{ color: "#000000", borderColor: "#cccccc" }}>Descrição</th>
                      <th className="text-right py-1.5 w-20 text-[10px] font-semibold border-b" style={{ color: "#000000", borderColor: "#cccccc" }}>Preço Unit.</th>
                      <th className="text-right py-1.5 w-16 text-[10px] font-semibold border-b" style={{ color: "#000000", borderColor: "#cccccc" }}>Desc. (%)</th>
                      <th className="text-right py-1.5 w-20 text-[10px] font-semibold border-b" style={{ color: "#000000", borderColor: "#cccccc" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.lines.map((line, idx) => (
                      <tr 
                        key={line.id} 
                        style={{ backgroundColor: idx % 2 === 1 ? "#f8fafc" : "#ffffff" }}
                        className="border-b border-gray-100 text-[10px]"
                      >
                        <td className="text-center py-1.5">{line.quantity}</td>
                        <td className="py-1.5">{line.description}</td>
                        <td className="text-right py-1.5">{formatCurrency(line.unit_price)}</td>
                        <td className="text-right py-1.5">{line.discount_percent > 0 ? `${line.discount_percent}%` : "-"}</td>
                        <td className="text-right py-1.5 font-medium">{formatCurrency(line.line_total)}</td>
                      </tr>
                    ))}
                    {section.subtotal > 0 && (
                      <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <td colSpan={4} className="text-right py-1.5 font-semibold text-[10px]" style={{ color: "#000000" }}>
                          Subtotal {section.title}:
                        </td>
                        <td className="text-right py-1.5 font-bold text-[10px]" style={{ color: "#000000" }}>
                          {formatCurrency(section.subtotal)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Total */}
            <div className="mt-6 flex justify-end">
              <div className="p-4 border-2" style={{ borderColor: "#000000", minWidth: "220px" }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold" style={{ color: "#000000" }}>TOTAL:</span>
                  <span className="text-lg font-bold" style={{ color: "#000000" }}>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* VAT Exemption */}
            {quote.vat_exempt && (
              <p className="mt-3 text-[9px] italic" style={{ color: "#64748b" }}>
                {quote.vat_exempt_reason_text || "Isento de IVA de acordo com o Art. 9º, nº 26 do Código do IVA"}
              </p>
            )}

            {/* Footer */}
            <div className="mt-6 text-[10px]">
              <p className="text-center mb-3" style={{ color: "#64748b" }}>
                Nesta firma existe Livro de Reclamações
              </p>
              
              {quote.footer_text && (
                <p className="mb-4 text-center italic" style={{ color: "#475569" }}>{quote.footer_text}</p>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 mt-14">
                <div className="text-center">
                  <div className="border-t border-gray-400 pt-2 mx-8">
                    <p className="font-semibold" style={{ color: "#334155" }}>A Gerência</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-gray-400 pt-2 mx-8">
                    <p className="font-semibold" style={{ color: "#334155" }}>Adjudicante do Serviço</p>
                    <p className="text-[9px] mt-1" style={{ color: "#64748b" }}>
                      Declaro que li e aceito o presente orçamento
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-center mt-8 text-[9px] font-medium" style={{ color: "#475569" }}>
                Este orçamento é válido como contrato após assinatura
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
