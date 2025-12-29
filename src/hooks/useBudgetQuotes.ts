import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type BudgetQuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "ARCHIVED";

export interface BudgetQuote {
  id: string;
  funeraria_id: string;
  quote_number: number;
  issue_date: string;
  status: BudgetQuoteStatus;
  client_id: string;
  obituary_id?: string;
  deceased_name?: string;
  death_date?: string;
  funeral_date?: string;
  cemetery?: string;
  place_of_death?: string;
  vat_exempt: boolean;
  vat_exempt_reason_text?: string;
  subtotal: number;
  total_quote: number;
  footer_text?: string;
  sent_at?: string;
  accepted_at?: string;
  archived_at?: string;
  last_sent_to_email?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
    nif?: string;
    address?: string;
    city?: string;
    postal_code?: string;
  };
}

export interface BudgetQuoteSection {
  id: string;
  quote_id: string;
  title: string;
  sort_order: number;
  subtotal: number;
  lines: BudgetQuoteLine[];
}

export interface BudgetQuoteLine {
  id: string;
  section_id: string;
  quantity: number;
  description: string;
  unit_price: number;
  discount_percent: number;
  line_total: number;
  sort_order: number;
}

export interface BudgetQuoteFormData {
  client_id: string;
  obituary_id?: string;
  deceased_name?: string;
  death_date?: string;
  funeral_date?: string;
  cemetery?: string;
  place_of_death?: string;
  vat_exempt?: boolean;
  vat_exempt_reason_text?: string;
  footer_text?: string;
}

export const DEFAULT_SECTIONS = [
  {
    title: "Materiais Utilizados",
    lines: [
      "Urna",
      "Cobertura de Urna",
      "Saco Sudário",
      "Terço",
      "Lenço de Rosto",
      "Lençol de Tule",
      "Cera",
      "Livro de Condolências",
      "Pasta para cartões",
      "Panfletos de comunicação de funeral",
      "Pagelas",
    ],
  },
  {
    title: "Serviços Prestados pela Agência",
    lines: [
      "Ornamentação / Câmara Ardente",
      "Carro Fúnebre - Taxa de Saída",
      "Transporte de Auto-fúnebre (Km a percorrer)",
      "Auto para serviço de voltas",
      "Pessoal ao serviço da agência",
      "Serviços Técnicos e Encargos da Agência",
      "Tanatoestética - Tratamento do corpo",
      "Tanatopraxia",
      "Soldagem de urna de Zinco",
      "Outros serviços da Agência",
    ],
  },
  {
    title: "Serviços Prestados por Terceiros",
    lines: [],
  },
  {
    title: "Outros Serviços",
    lines: [],
  },
];

export function useBudgetQuotes() {
  const [quotes, setQuotes] = useState<BudgetQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [funerariaId, setFunerariaId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFunerariaId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: funeraria } = await supabase
      .from("funerarias")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (funeraria) {
      setFunerariaId(funeraria.id);
      return funeraria.id;
    }
    return null;
  }, []);

  const fetchQuotes = useCallback(async (includeArchived = false) => {
    setLoading(true);
    try {
      const funId = funerariaId || await fetchFunerariaId();
      if (!funId) {
        setQuotes([]);
        return;
      }

      let query = supabase
        .from("budget_quotes")
        .select(`
          *,
          client:clients(id, full_name, email, phone, nif, address, city, postal_code)
        `)
        .eq("funeraria_id", funId)
        .order("created_at", { ascending: false });

      if (!includeArchived) {
        query = query.neq("status", "ARCHIVED");
      }

      const { data, error } = await query;

      if (error) throw error;
      setQuotes((data as BudgetQuote[]) || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar orçamentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [funerariaId, fetchFunerariaId, toast]);

  const getQuoteById = async (id: string): Promise<{ quote: BudgetQuote; sections: BudgetQuoteSection[] } | null> => {
    try {
      const { data: quote, error: quoteError } = await supabase
        .from("budget_quotes")
        .select(`
          *,
          client:clients(id, full_name, email, phone, nif, address, city, postal_code)
        `)
        .eq("id", id)
        .single();

      if (quoteError) throw quoteError;

      const { data: sections, error: sectionsError } = await supabase
        .from("budget_quote_sections")
        .select("*")
        .eq("quote_id", id)
        .order("sort_order");

      if (sectionsError) throw sectionsError;

      // Fetch lines for each section
      const sectionsWithLines: BudgetQuoteSection[] = [];
      for (const section of sections || []) {
        const { data: lines } = await supabase
          .from("budget_quote_lines")
          .select("*")
          .eq("section_id", section.id)
          .order("sort_order");

        sectionsWithLines.push({
          ...section,
          lines: (lines || []) as BudgetQuoteLine[],
        });
      }

      return {
        quote: quote as BudgetQuote,
        sections: sectionsWithLines,
      };
    } catch (error: any) {
      toast({
        title: "Erro ao carregar orçamento",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const createQuote = async (data: BudgetQuoteFormData, applyDefaultTemplate = true): Promise<string | null> => {
    try {
      const funId = funerariaId || await fetchFunerariaId();
      if (!funId) throw new Error("Funerária não encontrada");

      // Get next quote number
      const { data: nextNumber, error: numError } = await supabase
        .rpc("get_next_quote_number", { p_funeraria_id: funId });

      if (numError) throw numError;

      // Create quote
      const { data: newQuote, error: quoteError } = await supabase
        .from("budget_quotes")
        .insert({
          funeraria_id: funId,
          quote_number: nextNumber,
          client_id: data.client_id,
          obituary_id: data.obituary_id || null,
          deceased_name: data.deceased_name || null,
          death_date: data.death_date || null,
          funeral_date: data.funeral_date || null,
          cemetery: data.cemetery || null,
          place_of_death: data.place_of_death || null,
          vat_exempt: data.vat_exempt ?? true,
          vat_exempt_reason_text: data.vat_exempt_reason_text || "Isento de IVA de acordo com o Art. 9º, nº 26 do Código do IVA",
          footer_text: data.footer_text || "Este orçamento é válido como contrato após assinatura.",
          status: "DRAFT",
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Apply default template if requested
      if (applyDefaultTemplate) {
        for (let i = 0; i < DEFAULT_SECTIONS.length; i++) {
          const section = DEFAULT_SECTIONS[i];
          
          const { data: newSection, error: sectionError } = await supabase
            .from("budget_quote_sections")
            .insert({
              quote_id: newQuote.id,
              title: section.title,
              sort_order: i,
            })
            .select()
            .single();

          if (sectionError) throw sectionError;

          // Add default lines
          if (section.lines.length > 0) {
            const linesToInsert = section.lines.map((desc, j) => ({
              section_id: newSection.id,
              description: desc,
              quantity: 1,
              unit_price: 0,
              discount_percent: 0,
              line_total: 0,
              sort_order: j,
            }));

            const { error: linesError } = await supabase
              .from("budget_quote_lines")
              .insert(linesToInsert);

            if (linesError) throw linesError;
          }
        }
      }

      toast({
        title: "Orçamento criado",
        description: `Orçamento nº ${nextNumber} criado com sucesso`,
      });

      await fetchQuotes();
      return newQuote.id;
    } catch (error: any) {
      toast({
        title: "Erro ao criar orçamento",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateQuote = async (id: string, data: Partial<BudgetQuoteFormData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("budget_quotes")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Orçamento atualizado",
        description: "Os dados do orçamento foram atualizados",
      });

      await fetchQuotes();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar orçamento",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateQuoteStatus = async (id: string, status: BudgetQuoteStatus): Promise<boolean> => {
    try {
      const updates: Record<string, any> = { status };
      
      if (status === "SENT") {
        updates.sent_at = new Date().toISOString();
      } else if (status === "ACCEPTED") {
        updates.accepted_at = new Date().toISOString();
      } else if (status === "ARCHIVED") {
        updates.archived_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("budget_quotes")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      const statusLabels: Record<BudgetQuoteStatus, string> = {
        DRAFT: "Rascunho",
        SENT: "Enviado",
        ACCEPTED: "Aceite",
        ARCHIVED: "Arquivado",
      };

      toast({
        title: "Estado atualizado",
        description: `Orçamento marcado como ${statusLabels[status]}`,
      });

      await fetchQuotes();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar estado",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const duplicateQuote = async (id: string): Promise<string | null> => {
    try {
      const original = await getQuoteById(id);
      if (!original) throw new Error("Orçamento não encontrado");

      const funId = funerariaId || await fetchFunerariaId();
      if (!funId) throw new Error("Funerária não encontrada");

      // Get next quote number
      const { data: nextNumber, error: numError } = await supabase
        .rpc("get_next_quote_number", { p_funeraria_id: funId });

      if (numError) throw numError;

      // Create new quote
      const { data: newQuote, error: quoteError } = await supabase
        .from("budget_quotes")
        .insert({
          funeraria_id: funId,
          quote_number: nextNumber,
          client_id: original.quote.client_id,
          obituary_id: original.quote.obituary_id,
          deceased_name: original.quote.deceased_name,
          death_date: original.quote.death_date,
          funeral_date: original.quote.funeral_date,
          cemetery: original.quote.cemetery,
          place_of_death: original.quote.place_of_death,
          vat_exempt: original.quote.vat_exempt,
          vat_exempt_reason_text: original.quote.vat_exempt_reason_text,
          footer_text: original.quote.footer_text,
          status: "DRAFT",
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Copy sections and lines
      for (const section of original.sections) {
        const { data: newSection, error: sectionError } = await supabase
          .from("budget_quote_sections")
          .insert({
            quote_id: newQuote.id,
            title: section.title,
            sort_order: section.sort_order,
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        if (section.lines.length > 0) {
          const linesToInsert = section.lines.map(line => ({
            section_id: newSection.id,
            description: line.description,
            quantity: line.quantity,
            unit_price: line.unit_price,
            discount_percent: line.discount_percent,
            line_total: line.line_total,
            sort_order: line.sort_order,
          }));

          const { error: linesError } = await supabase
            .from("budget_quote_lines")
            .insert(linesToInsert);

          if (linesError) throw linesError;
        }
      }

      toast({
        title: "Orçamento duplicado",
        description: `Novo orçamento nº ${nextNumber} criado`,
      });

      await fetchQuotes();
      return newQuote.id;
    } catch (error: any) {
      toast({
        title: "Erro ao duplicar orçamento",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteQuote = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("budget_quotes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Orçamento eliminado",
        description: "O orçamento foi eliminado com sucesso",
      });

      await fetchQuotes();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao eliminar orçamento",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Section operations
  const addSection = async (quoteId: string, title: string): Promise<BudgetQuoteSection | null> => {
    try {
      const { data: existingSections } = await supabase
        .from("budget_quote_sections")
        .select("sort_order")
        .eq("quote_id", quoteId)
        .order("sort_order", { ascending: false })
        .limit(1);

      const sortOrder = existingSections && existingSections.length > 0 
        ? existingSections[0].sort_order + 1 
        : 0;

      const { data, error } = await supabase
        .from("budget_quote_sections")
        .insert({
          quote_id: quoteId,
          title,
          sort_order: sortOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, lines: [] } as BudgetQuoteSection;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar secção",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSection = async (sectionId: string, title: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("budget_quote_sections")
        .update({ title })
        .eq("id", sectionId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar secção",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteSection = async (sectionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("budget_quote_sections")
        .delete()
        .eq("id", sectionId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao eliminar secção",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Line operations
  const addLine = async (sectionId: string, description: string = ""): Promise<BudgetQuoteLine | null> => {
    try {
      const { data: existingLines } = await supabase
        .from("budget_quote_lines")
        .select("sort_order")
        .eq("section_id", sectionId)
        .order("sort_order", { ascending: false })
        .limit(1);

      const sortOrder = existingLines && existingLines.length > 0 
        ? existingLines[0].sort_order + 1 
        : 0;

      const { data, error } = await supabase
        .from("budget_quote_lines")
        .insert({
          section_id: sectionId,
          description,
          quantity: 1,
          unit_price: 0,
          discount_percent: 0,
          line_total: 0,
          sort_order: sortOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data as BudgetQuoteLine;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar linha",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateLine = async (lineId: string, data: Partial<Omit<BudgetQuoteLine, "id" | "section_id">>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("budget_quote_lines")
        .update(data)
        .eq("id", lineId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar linha",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteLine = async (lineId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("budget_quote_lines")
        .delete()
        .eq("id", lineId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao eliminar linha",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return {
    quotes,
    loading,
    funerariaId,
    fetchQuotes,
    getQuoteById,
    createQuote,
    updateQuote,
    updateQuoteStatus,
    duplicateQuote,
    deleteQuote,
    addSection,
    updateSection,
    deleteSection,
    addLine,
    updateLine,
    deleteLine,
  };
}
