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
}

export function BudgetQuotePDF({ 
  quote, 
  sections, 
  funerariaName = "Funerária", 
  funerariaNif = "",
  funerariaPhone = ""
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
    const imgY = 0;

    pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`orcamento-${quote.quote_number}.pdf`);
  };

  const total = sections.reduce((sum, s) => sum + s.subtotal, 0);

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
          <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{funerariaName}</h1>
              {funerariaNif && <p className="text-sm">NIF: {funerariaNif}</p>}
              {funerariaPhone && <p className="text-sm">Tel: {funerariaPhone}</p>}
            </div>
            <div className="text-right">
              <div className="border-2 border-gray-800 px-4 py-2 inline-block">
                <p className="text-lg font-bold">ORÇAMENTO</p>
                <p className="text-2xl font-bold">Nº {quote.quote_number}</p>
              </div>
              <p className="mt-2 text-sm">Data: {formatDate(quote.issue_date)}</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-6 border border-gray-400 p-4">
            <h2 className="font-bold mb-2 text-sm border-b border-gray-300 pb-1">CLIENTE</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div><span className="font-semibold">Nome:</span> {quote.client?.full_name || "-"}</div>
              <div><span className="font-semibold">NIF:</span> {quote.client?.nif || "-"}</div>
              <div><span className="font-semibold">Morada:</span> {quote.client?.address || "-"}</div>
              <div><span className="font-semibold">Telefone:</span> {quote.client?.phone || "-"}</div>
              <div><span className="font-semibold">Localidade:</span> {quote.client?.city || "-"} {quote.client?.postal_code || ""}</div>
              <div><span className="font-semibold">Email:</span> {quote.client?.email || "-"}</div>
            </div>
          </div>

          {/* Deceased Info */}
          <div className="mb-6 border border-gray-400 p-4">
            <h2 className="font-bold mb-2 text-sm border-b border-gray-300 pb-1">DADOS DO FALECIDO</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div><span className="font-semibold">Nome:</span> {quote.deceased_name || "-"}</div>
              <div><span className="font-semibold">Data Falecimento:</span> {formatDate(quote.death_date)}</div>
              <div><span className="font-semibold">Local Falecimento:</span> {quote.place_of_death || "-"}</div>
              <div><span className="font-semibold">Data Funeral:</span> {formatDate(quote.funeral_date)}</div>
              <div className="col-span-2"><span className="font-semibold">Cemitério:</span> {quote.cemetery || "-"}</div>
            </div>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.id} className="mb-4">
              <h3 className="font-bold bg-gray-200 px-2 py-1 text-sm">{section.title}</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-400 text-xs">
                    <th className="text-center py-1 w-12">Qtd</th>
                    <th className="text-left py-1">Descrição</th>
                    <th className="text-right py-1 w-20">Preço Unit.</th>
                    <th className="text-right py-1 w-16">Desc.</th>
                    <th className="text-right py-1 w-20">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {section.lines.map((line) => (
                    <tr key={line.id} className="border-b border-gray-200">
                      <td className="text-center py-1">{line.quantity}</td>
                      <td className="py-1">{line.description}</td>
                      <td className="text-right py-1">{formatCurrency(line.unit_price)}</td>
                      <td className="text-right py-1">{line.discount_percent > 0 ? `${line.discount_percent}%` : "-"}</td>
                      <td className="text-right py-1 font-medium">{formatCurrency(line.line_total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100">
                    <td colSpan={4} className="text-right py-1 font-semibold">Total {section.title}:</td>
                    <td className="text-right py-1 font-bold">{formatCurrency(section.subtotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}

          {/* Total */}
          <div className="mt-6 flex justify-end">
            <div className="border-2 border-gray-800 p-4 bg-gray-100 w-64">
              <div className="flex justify-between text-lg font-bold">
                <span>TOTAL DO ORÇAMENTO:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* VAT Exemption */}
          {quote.vat_exempt && (
            <p className="mt-4 text-xs italic text-gray-600">
              {quote.vat_exempt_reason_text || "Isento de IVA de acordo com o Art. 9º, nº 26 do Código do IVA"}
            </p>
          )}

          {/* Footer */}
          <div className="mt-8 text-xs">
            <p className="text-center mb-4">Nesta firma existe Livro de Reclamações</p>
            
            {quote.footer_text && (
              <p className="mb-6 text-center italic">{quote.footer_text}</p>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="text-center">
                <div className="border-t border-gray-800 pt-2 mx-8">
                  <p className="font-semibold">A Gerência</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-800 pt-2 mx-8">
                  <p className="font-semibold">Adjudicante do Serviço</p>
                  <p className="text-xs mt-1">Declaro que li e aceito o presente orçamento</p>
                </div>
              </div>
            </div>

            <p className="text-center mt-8 text-xs font-medium">
              Este orçamento é válido como contrato após assinatura
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
