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

  const total = sections.reduce((sum, s) => sum + s.subtotal, 0);
  const funerariaFullAddress = [funerariaAddress, funerariaLocality, funerariaPostalCode].filter(Boolean).join(", ");

  return (
    <>
      <Button variant="outline" onClick={handleGeneratePDF}>
        <FileText className="w-4 h-4 mr-2" />
        Gerar PDF
      </Button>

      {/* Hidden PDF Template */}
      <div className="fixed left-[-9999px] top-0">
        <div 
          ref={pdfRef} 
          className="bg-white text-black w-[210mm] min-h-[297mm] p-8 font-sans text-[11px]"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
            <div>
              <h1 className="text-xl font-bold mb-1">{funerariaName}</h1>
              {funerariaFullAddress && <p className="text-[10px]">{funerariaFullAddress}</p>}
              {funerariaEmail && <p className="text-[10px]">Email: {funerariaEmail}</p>}
              {funerariaPhone && <p className="text-[10px]">Tel: {funerariaPhone}</p>}
              {funerariaNif && <p className="text-[10px]">NIF: {funerariaNif}</p>}
            </div>
            <div className="text-right">
              <div className="border-2 border-black px-4 py-2 inline-block">
                <p className="text-sm font-bold">ORÇAMENTO</p>
                <p className="text-xl font-bold">Nº {quote.quote_number}</p>
              </div>
              <p className="mt-2 text-[10px]">Data: {formatDate(quote.issue_date)}</p>
            </div>
          </div>

          {/* Client + Deceased side by side */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-400 p-3">
              <h2 className="font-bold text-[11px] border-b border-gray-300 pb-1 mb-2">CLIENTE</h2>
              <div className="space-y-0.5 text-[10px]">
                <p><span className="font-semibold">Nome:</span> {quote.client?.full_name || "-"}</p>
                <p><span className="font-semibold">Endereço:</span> {quote.client?.address || "-"}</p>
                <p><span className="font-semibold">Localidade:</span> {quote.client?.city || "-"}</p>
                <p><span className="font-semibold">C.P.:</span> {quote.client?.postal_code || "-"}</p>
                <p><span className="font-semibold">Parentesco:</span> -</p>
                <p><span className="font-semibold">Telefone:</span> {quote.client?.phone || "-"}</p>
                <p><span className="font-semibold">NIF:</span> {quote.client?.nif || "-"}</p>
              </div>
            </div>
            <div className="border border-gray-400 p-3">
              <h2 className="font-bold text-[11px] border-b border-gray-300 pb-1 mb-2">DADOS DO FALECIDO</h2>
              <div className="space-y-0.5 text-[10px]">
                <p><span className="font-semibold">Nome:</span> {quote.deceased_name || "-"}</p>
                <p><span className="font-semibold">Data Falecimento:</span> {formatDate(quote.death_date)}</p>
                <p><span className="font-semibold">Data Funeral:</span> {formatDate(quote.funeral_date)}</p>
                <p><span className="font-semibold">Cemitério:</span> {quote.cemetery || "-"}</p>
                <p><span className="font-semibold">Local Falecimento:</span> {quote.place_of_death || "-"}</p>
              </div>
            </div>
          </div>

          {/* Sections / Services */}
          {sections.map((section) => (
            <div key={section.id} className="mb-4">
              <h3 className="font-bold bg-gray-200 px-2 py-1 text-[11px]">{section.title}</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-400 text-[10px]">
                    <th className="text-center py-1 w-10">Qtd</th>
                    <th className="text-left py-1">Descrição</th>
                    <th className="text-right py-1 w-20">Preço Unit.</th>
                    <th className="text-right py-1 w-16">Desc. (%)</th>
                    <th className="text-right py-1 w-20">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {section.lines.map((line) => (
                    <tr key={line.id} className="border-b border-gray-200 text-[10px]">
                      <td className="text-center py-1">{line.quantity}</td>
                      <td className="py-1">{line.description}</td>
                      <td className="text-right py-1">{formatCurrency(line.unit_price)}</td>
                      <td className="text-right py-1">{line.discount_percent > 0 ? `${line.discount_percent}%` : "-"}</td>
                      <td className="text-right py-1 font-medium">{formatCurrency(line.line_total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100">
                    <td colSpan={4} className="text-right py-1 font-semibold text-[10px]">Total {section.title}:</td>
                    <td className="text-right py-1 font-bold text-[10px]">{formatCurrency(section.subtotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}

          {/* Total */}
          <div className="mt-6 flex justify-end">
            <div className="border-2 border-black p-3 bg-gray-100 w-60">
              <div className="flex justify-between text-sm font-bold">
                <span>TOTAL:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* VAT Exemption */}
          {quote.vat_exempt && (
            <p className="mt-3 text-[9px] italic text-gray-600">
              {quote.vat_exempt_reason_text || "Isento de IVA de acordo com o Art. 9º, nº 26 do Código do IVA"}
            </p>
          )}

          {/* Footer */}
          <div className="mt-6 text-[10px]">
            <p className="text-center mb-3">Nesta firma existe Livro de Reclamações</p>
            
            {quote.footer_text && (
              <p className="mb-4 text-center italic">{quote.footer_text}</p>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-10">
              <div className="text-center">
                <div className="border-t border-black pt-2 mx-8">
                  <p className="font-semibold">A Gerência</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-black pt-2 mx-8">
                  <p className="font-semibold">Adjudicante do Serviço</p>
                  <p className="text-[9px] mt-1">Declaro que li e aceito o presente orçamento</p>
                </div>
              </div>
            </div>

            <p className="text-center mt-6 text-[9px] font-medium">
              Este orçamento é válido como contrato após assinatura
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
