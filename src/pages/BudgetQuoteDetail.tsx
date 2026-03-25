import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Save,
  Printer,
  Send,
  Archive,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle,
  Copy,
  FileCheck,
  ExternalLink,
  ChevronDown,
  CalendarIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { 
  useBudgetQuotes, 
  BudgetQuote, 
  BudgetQuoteSection, 
  BudgetQuoteLine,
  BudgetQuoteStatus,
  DEFAULT_SECTIONS,
} from "@/hooks/useBudgetQuotes";
import { ClientSelector } from "@/components/clients/ClientSelector";
import { Client } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BudgetQuotePDF, BudgetQuotePDFHandle } from "@/components/budgets/BudgetQuotePDF";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusConfig: Record<BudgetQuoteStatus, { label: string; color: string }> = {
  DRAFT: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
  SENT: { label: "Enviado", color: "bg-blue-100 text-blue-700" },
  ACCEPTED: { label: "Aceite", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "Recusado", color: "bg-red-100 text-red-700" },
  ARCHIVED: { label: "Arquivado", color: "bg-gray-100 text-gray-500" },
};

function buildLocalSections(): BudgetQuoteSection[] {
  return DEFAULT_SECTIONS.map((s, i) => ({
    id: `temp-${crypto.randomUUID()}`,
    quote_id: "",
    title: s.title,
    sort_order: i,
    subtotal: 0,
    lines: s.lines.map((desc, j) => ({
      id: `temp-${crypto.randomUUID()}`,
      section_id: "",
      description: desc,
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      line_total: 0,
      sort_order: j,
    })),
  }));
}

export default function BudgetQuoteDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = !id;
  const obituaryId = searchParams.get("obituaryId");

  const { 
    getQuoteById, 
    createQuoteWithSections,
    updateQuote,
    updateQuoteStatus,
    duplicateQuote,
    addSection,
    updateSection,
    deleteSection,
    addLine,
    updateLine,
    deleteLine,
  } = useBudgetQuotes();

  const [loading, setLoading] = useState(true);
  const pdfRef = useRef<BudgetQuotePDFHandle>(null);
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState<BudgetQuote | null>(null);
  const [sections, setSections] = useState<BudgetQuoteSection[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [funerariaData, setFunerariaData] = useState<{ nome_comercial: string; nif: string; telefone: string; morada: string; email: string; localidade: string; codigo_postal: string; logo_url: string | null } | null>(null);
  const [formData, setFormData] = useState({
    deceased_name: "",
    death_date: "",
    funeral_date: "",
    cemetery: "",
    place_of_death: "",
    service_type: "",
    vat_exempt: true,
    vat_exempt_reason_text: "Isento de IVA de acordo com o Art. 9º, nº 26 do Código do IVA",
    footer_text: "Este orçamento é válido como contrato após assinatura.",
  });
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Fetch funeraria data for PDF
  useEffect(() => {
    const fetchFunerariaData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("funerarias")
          .select("nome_comercial, nif, telefone, morada, email, localidade, codigo_postal, logo_url")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data) {
          setFunerariaData(data);
        }
      }
    };
    fetchFunerariaData();
  }, []);

  // Load quote data
  useEffect(() => {
    const loadData = async () => {
      setLoadError(false);
      if (isNew) {
        // Initialize with predefined sections immediately
        setSections(buildLocalSections());

        if (obituaryId) {
          const [{ data: obituary }, { data: funeralEvent }] = await Promise.all([
            supabase
              .from("obituaries")
              .select("*, client:clients(*)")
              .eq("id", obituaryId)
              .maybeSingle(),
            supabase
              .from("ceremony_events")
              .select("event_date, location")
              .eq("obituary_id", obituaryId)
              .eq("event_type", "funeral")
              .maybeSingle(),
          ]);

          if (obituary) {
            setFormData(prev => ({
              ...prev,
              deceased_name: obituary.display_name || obituary.full_name || "",
              death_date: obituary.death_date || "",
              place_of_death: obituary.death_location || "",
              funeral_date: funeralEvent?.event_date || "",
              cemetery: funeralEvent?.location || "",
            }));

            if (obituary.responsible_client_id) {
              setSelectedClientId(obituary.responsible_client_id);
            }
          }
        }
        setLoading(false);
        return;
      }

      if (id) {
        const data = await getQuoteById(id);
        if (data) {
          setQuote(data.quote);
          setSections(data.sections);
          setSelectedClientId(data.quote.client_id);
          setFormData({
            deceased_name: data.quote.deceased_name || "",
            death_date: data.quote.death_date || "",
            funeral_date: data.quote.funeral_date || "",
            cemetery: data.quote.cemetery || "",
            place_of_death: data.quote.place_of_death || "",
            service_type: data.quote.service_type || "",
            vat_exempt: data.quote.vat_exempt,
            vat_exempt_reason_text: data.quote.vat_exempt_reason_text || "",
            footer_text: data.quote.footer_text || "",
          });
        } else {
          setLoadError(true);
        }
      }
      setLoading(false);
    };

    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew, obituaryId]);

  const reloadQuote = async () => {
    if (!quote) return;
    const data = await getQuoteById(quote.id);
    if (data) {
      setQuote(data.quote);
      setSections(data.sections);
    }
  };

  const handleClientChange = (clientId: string, _client: Client) => {
    setSelectedClientId(clientId);
  };

  const handleSave = async () => {
    if (!selectedClientId) {
      toast({ title: "Erro", description: "Selecione um cliente", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        // Build sections payload from local state
        const sectionsPayload = sections.map(s => ({
          title: s.title,
          lines: s.lines.map(l => ({
            description: l.description,
            quantity: l.quantity,
            unit_price: l.unit_price,
            discount_percent: l.discount_percent,
            line_total: l.line_total,
          })),
        }));

        const newQuoteId = await createQuoteWithSections(
          { client_id: selectedClientId, obituary_id: obituaryId || undefined, ...formData },
          sectionsPayload
        );

        if (newQuoteId) {
          navigate(`/budgets/${newQuoteId}`, { replace: true });
        }
      } else if (quote) {
        const success = await updateQuote(quote.id, {
          client_id: selectedClientId,
          ...formData,
        });
        if (success) {
          await reloadQuote();
        }
      }
    } catch (error: any) {
      toast({ title: "Erro ao guardar", description: error.message || "Erro inesperado", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: BudgetQuoteStatus) => {
    if (!quote) return;
    const success = await updateQuoteStatus(quote.id, newStatus);
    if (success) {
      setQuote(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handlePrint = () => { pdfRef.current?.print(); };

  const handleDuplicate = async () => {
    if (!quote) return;
    const newId = await duplicateQuote(quote.id);
    if (newId) navigate(`/budgets/${newId}`);
  };

  // --- Section handlers (local for new, remote for existing) ---
  const handleAddSection = async () => {
    if (isNew) {
      const newSection: BudgetQuoteSection = {
        id: `temp-${crypto.randomUUID()}`,
        quote_id: "",
        title: "Nova Secção",
        sort_order: sections.length,
        subtotal: 0,
        lines: [],
      };
      setSections(prev => [...prev, newSection]);
      return;
    }
    if (!quote) return;
    const newSection = await addSection(quote.id, "Nova Secção");
    if (newSection) setSections(prev => [...prev, newSection]);
  };

  const handleUpdateSection = async (sectionId: string, title: string) => {
    if (sectionId.startsWith("temp-")) {
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, title } : s));
      return;
    }
    const success = await updateSection(sectionId, title);
    if (success) setSections(prev => prev.map(s => s.id === sectionId ? { ...s, title } : s));
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (sectionId.startsWith("temp-")) {
      setSections(prev => prev.filter(s => s.id !== sectionId));
      return;
    }
    const success = await deleteSection(sectionId);
    if (success) {
      setSections(prev => prev.filter(s => s.id !== sectionId));
      await reloadQuote();
    }
  };

  // --- Line handlers ---
  const handleAddLine = async (sectionId: string) => {
    if (sectionId.startsWith("temp-")) {
      const newLine: BudgetQuoteLine = {
        id: `temp-${crypto.randomUUID()}`,
        section_id: sectionId,
        description: "",
        quantity: 1,
        unit_price: 0,
        discount_percent: 0,
        line_total: 0,
        sort_order: 0,
      };
      setSections(prev => prev.map(s =>
        s.id === sectionId ? { ...s, lines: [...s.lines, newLine] } : s
      ));
      return;
    }
    const newLine = await addLine(sectionId);
    if (newLine) {
      setSections(prev => prev.map(s =>
        s.id === sectionId ? { ...s, lines: [...s.lines, newLine] } : s
      ));
    }
  };

  const handleUpdateLine = async (lineId: string, sectionId: string, updates: Partial<BudgetQuoteLine>) => {
    const isLocal = lineId.startsWith("temp-");

    if (!isLocal) {
      const success = await updateLine(lineId, updates);
      if (!success) return;
    }

    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const updatedLines = s.lines.map(l => {
        if (l.id !== lineId) return l;
        const updated = { ...l, ...updates };
        updated.line_total = updated.quantity * updated.unit_price * (1 - (updated.discount_percent || 0) / 100);
        return updated;
      });
      const subtotal = updatedLines.reduce((sum, l) => sum + l.line_total, 0);
      return { ...s, lines: updatedLines, subtotal };
    }));

    if (!isLocal) {
      setSections(prev => {
        const total = prev.reduce((sum, s) => sum + s.subtotal, 0);
        setQuote(q => q ? { ...q, subtotal: total, total_quote: total } : null);
        return prev;
      });
    }
  };

  const handleDeleteLine = async (lineId: string, sectionId: string) => {
    if (lineId.startsWith("temp-")) {
      setSections(prev => prev.map(s =>
        s.id === sectionId
          ? { ...s, lines: s.lines.filter(l => l.id !== lineId), subtotal: s.lines.filter(l => l.id !== lineId).reduce((sum, l) => sum + l.line_total, 0) }
          : s
      ));
      return;
    }
    const success = await deleteLine(lineId);
    if (!success) return;
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, lines: s.lines.filter(l => l.id !== lineId), subtotal: s.lines.filter(l => l.id !== lineId).reduce((sum, l) => sum + l.line_total, 0) }
        : s
    ));
    setTimeout(() => {
      setSections(prev => {
        const total = prev.reduce((sum, s) => sum + s.subtotal, 0);
        setQuote(q => q ? { ...q, subtotal: total, total_quote: total } : null);
        return prev;
      });
    }, 50);
  };

  // Computed local total for new quotes
  const displayTotal = isNew
    ? sections.reduce((sum, s) => sum + s.lines.reduce((ls, l) => ls + l.line_total, 0), 0)
    : (quote?.total_quote || 0);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-muted-foreground">A carregar...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4">
        <div className="text-destructive font-semibold">Orçamento não encontrado</div>
        <p className="text-muted-foreground">O orçamento solicitado não existe ou não tem permissão para o visualizar.</p>
        <Button variant="outline" onClick={() => navigate("/budgets")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Orçamentos
        </Button>
      </div>
    );
  }

  const isArchived = quote?.status === "ARCHIVED";

  return (
    <div className="p-8 space-y-6 print:p-0 print:space-y-4">
      {/* Header - Row 1: Title */}
      <div className="print:hidden space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/budgets")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-archivo font-bold text-foreground">
                {isNew ? "Novo Orçamento" : `Orçamento #${quote?.quote_number}`}
              </h1>
{quote && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none">
                      <Badge className={`${statusConfig[quote.status].color} cursor-pointer`}>
                        {statusConfig[quote.status].label}
                        <ChevronDown className="ml-1 h-3 w-3 inline" />
                      </Badge>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {(Object.entries(statusConfig) as [BudgetQuoteStatus, { label: string; color: string }][]).map(([key, config]) => (
                      <DropdownMenuItem
                        key={key}
                        className="focus:bg-primary/10 focus:text-primary"
                        disabled={key === quote.status}
                        onClick={() => handleStatusChange(key)}
                      >
                        <Badge className={`${config.color} mr-2 pointer-events-none`}>{config.label}</Badge>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {isNew ? "Preencha os dados e secções do orçamento" : "Editar detalhes do orçamento"}
            </p>
          </div>
        </div>

        {/* Header - Row 2: Action buttons */}
        <div className="flex flex-wrap gap-2">
          {!isNew && !isArchived && quote && (
            <>
               <BudgetQuotePDF
                ref={pdfRef}
                quote={quote} 
                sections={sections} 
                funerariaName={funerariaData?.nome_comercial}
                funerariaNif={funerariaData?.nif}
                funerariaPhone={funerariaData?.telefone}
                funerariaAddress={funerariaData?.morada}
                funerariaEmail={funerariaData?.email}
                funerariaLocality={funerariaData?.localidade}
                funerariaPostalCode={funerariaData?.codigo_postal}
                funerariaLogoUrl={funerariaData?.logo_url}
              />
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </Button>
              {quote.status === "DRAFT" && (
                <Button variant="outline" size="sm" onClick={() => handleStatusChange("SENT")}>
                  <Send className="w-4 h-4 mr-2" />
                  Marcar Enviado
                </Button>
              )}
              {quote.status === "SENT" && (
                <Button variant="outline" size="sm" onClick={() => handleStatusChange("ACCEPTED")}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar Aceite
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setArchiveDialogOpen(true)}>
                <Archive className="w-4 h-4 mr-2" />
                Arquivar
              </Button>
            </>
          )}
          {!isNew && quote?.status === "ACCEPTED" && !quote?.obituary_id && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/obituaries/new?fromQuoteId=${quote.id}`)}>
              <FileCheck className="w-4 h-4 mr-2" />
              Criar Processo de Óbito
            </Button>
          )}
          {!isNew && quote?.obituary_id && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/obituaries/${quote.obituary_id}/edit`)}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Processo de Óbito
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving || isArchived}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "A guardar..." : "Guardar"}
          </Button>
        </div>
      </div>

      {/* Quote Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Selection */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Cliente</h2>
            <ClientSelector
              value={selectedClientId}
              onChange={handleClientChange}
              disabled={isArchived}
            />
          </Card>

          {/* Deceased Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Informações Gerais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deceased_name">Nome do Falecido</Label>
                <Input id="deceased_name" value={formData.deceased_name} onChange={(e) => setFormData(prev => ({ ...prev, deceased_name: e.target.value }))} disabled={isArchived} />
              </div>
              <div className="space-y-2">
                <Label>Data Falecimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" disabled={isArchived} className={cn("w-full justify-start text-left font-normal", !formData.death_date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.death_date ? format(parse(formData.death_date, "yyyy-MM-dd", new Date()), "dd/MM/yyyy") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" locale={pt} selected={formData.death_date ? parse(formData.death_date, "yyyy-MM-dd", new Date()) : undefined} onSelect={(date) => setFormData(prev => ({ ...prev, death_date: date ? format(date, "yyyy-MM-dd") : "" }))} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="place_of_death">Local Falecimento</Label>
                <Input id="place_of_death" value={formData.place_of_death} onChange={(e) => setFormData(prev => ({ ...prev, place_of_death: e.target.value }))} disabled={isArchived} />
              </div>
              <div className="space-y-2">
                <Label>Data Funeral</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" disabled={isArchived} className={cn("w-full justify-start text-left font-normal", !formData.funeral_date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.funeral_date ? format(parse(formData.funeral_date, "yyyy-MM-dd", new Date()), "dd/MM/yyyy") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" locale={pt} selected={formData.funeral_date ? parse(formData.funeral_date, "yyyy-MM-dd", new Date()) : undefined} onSelect={(date) => setFormData(prev => ({ ...prev, funeral_date: date ? format(date, "yyyy-MM-dd") : "" }))} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cemetery">Cemitério</Label>
                <Input id="cemetery" value={formData.cemetery} onChange={(e) => setFormData(prev => ({ ...prev, cemetery: e.target.value }))} disabled={isArchived} />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Serviço</Label>
                <Select value={formData.service_type} onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))} disabled={isArchived}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="funeral_completo">Funeral Completo</SelectItem>
                    <SelectItem value="cremacao">Cremação</SelectItem>
                    <SelectItem value="translado">Translado</SelectItem>
                    <SelectItem value="basico">Serviço Básico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Quote Sections - always visible */}
          {sections.map((section) => (
            <Card key={section.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Input
                  className="text-lg font-semibold max-w-md"
                  value={section.title}
                  onChange={(e) => handleUpdateSection(section.id, e.target.value)}
                  disabled={isArchived}
                />
                {!isArchived && (
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteSection(section.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-muted-foreground">
                      <th className="text-left py-2 w-16">Qtd</th>
                      <th className="text-left py-2">Descrição</th>
                      <th className="text-right py-2 w-28">Preço Unit.</th>
                      <th className="text-right py-2 w-20">Desc. %</th>
                      <th className="text-right py-2 w-28">Total</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.lines.map((line) => (
                      <tr key={line.id} className="border-b">
                        <td className="py-2">
                          <Input type="number" min="0" step="1" className="w-16 text-center" value={line.quantity || ""} onFocus={(e) => e.target.select()} onBlur={(e) => { if (!e.target.value) handleUpdateLine(line.id, section.id, { quantity: 0 }); }} onChange={(e) => handleUpdateLine(line.id, section.id, { quantity: Number(e.target.value) })} disabled={isArchived} />
                        </td>
                        <td className="py-2">
                          <Input value={line.description} onChange={(e) => handleUpdateLine(line.id, section.id, { description: e.target.value })} disabled={isArchived} />
                        </td>
                        <td className="py-2">
                          <Input type="number" min="0" step="0.01" className="w-28 text-right" value={line.unit_price || ""} placeholder="0.00" onFocus={(e) => e.target.select()} onBlur={(e) => { if (!e.target.value) handleUpdateLine(line.id, section.id, { unit_price: 0 }); }} onChange={(e) => handleUpdateLine(line.id, section.id, { unit_price: Number(e.target.value) })} disabled={isArchived} />
                        </td>
                        <td className="py-2">
                          <Input type="number" min="0" max="100" step="1" className="w-20 text-right" value={line.discount_percent || ""} placeholder="0" onFocus={(e) => e.target.select()} onBlur={(e) => { if (!e.target.value) handleUpdateLine(line.id, section.id, { discount_percent: 0 }); }} onChange={(e) => handleUpdateLine(line.id, section.id, { discount_percent: Number(e.target.value) })} disabled={isArchived} />
                        </td>
                        <td className="py-2 text-right font-medium">
                          {line.line_total.toFixed(2)}€
                        </td>
                        <td className="py-2">
                          {!isArchived && (
                            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDeleteLine(line.id, section.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="py-3 text-right font-semibold">Subtotal:</td>
                      <td className="py-3 text-right font-bold text-primary">{section.subtotal.toFixed(2)}€</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {!isArchived && (
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => handleAddLine(section.id)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar linha
                </Button>
              )}
            </Card>
          ))}

          {!isArchived && (
            <Button variant="outline" className="w-full" onClick={handleAddSection}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Secção
            </Button>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-primary/5">
            <h2 className="text-lg font-semibold mb-4">Total do Orçamento</h2>
            <div className="text-4xl font-bold text-primary">
              {displayTotal.toFixed(2)}€
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Configurações IVA</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="vat_exempt">Isento de IVA</Label>
                <Switch id="vat_exempt" checked={formData.vat_exempt} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, vat_exempt: checked }))} disabled={isArchived} />
              </div>
              {formData.vat_exempt && (
                <div className="space-y-2">
                  <Label htmlFor="vat_reason">Motivo Isenção</Label>
                  <Textarea id="vat_reason" value={formData.vat_exempt_reason_text} onChange={(e) => setFormData(prev => ({ ...prev, vat_exempt_reason_text: e.target.value }))} rows={3} disabled={isArchived} />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Rodapé / Condições</h2>
            <Textarea value={formData.footer_text} onChange={(e) => setFormData(prev => ({ ...prev, footer_text: e.target.value }))} rows={4} placeholder="Condições do orçamento..." disabled={isArchived} />
          </Card>
        </div>
      </div>

      {/* Archive Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Após arquivar, o orçamento não poderá ser editado. Poderá apenas consultar e duplicar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { handleStatusChange("ARCHIVED"); setArchiveDialogOpen(false); }}>
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:p-0, .print\\:p-0 * { visibility: visible; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
