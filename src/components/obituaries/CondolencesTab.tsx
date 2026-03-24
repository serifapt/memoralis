import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Trash2, Download, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import * as XLSX from "xlsx";

interface Condolence {
  id: string;
  author_name: string;
  author_email: string;
  message: string;
  is_approved: boolean;
  created_at: string;
}

interface CondolencesTabProps {
  obituaryId: string;
  displayName: string;
}

export function CondolencesTab({ obituaryId, displayName }: CondolencesTabProps) {
  const [condolences, setCondolences] = useState<Condolence[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCondolences();
  }, [obituaryId]);

  const loadCondolences = async () => {
    try {
      const { data, error } = await supabase
        .from("condolences")
        .select("*")
        .eq("obituary_id", obituaryId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCondolences(data || []);
    } catch (err: any) {
      console.error("Error loading condolences:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("condolences")
        .update({ is_approved: !currentValue })
        .eq("id", id);

      if (error) throw error;
      setCondolences((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_approved: !currentValue } : c))
      );
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const deleteCondolence = async (id: string) => {
    try {
      const { error } = await supabase.from("condolences").delete().eq("id", id);
      if (error) throw error;
      setCondolences((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Eliminado", description: "Condolência removida." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const exportExcel = () => {
    const rows = condolences.map((c) => ({
      Nome: c.author_name,
      Email: c.author_email,
      Mensagem: c.message,
      Data: format(new Date(c.created_at), "dd/MM/yyyy HH:mm", { locale: pt }),
      Estado: c.is_approved ? "Aprovada" : "Pendente",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Condolências");

    const safeName = displayName.replace(/[^a-zA-Z0-9À-ú ]/g, "").replace(/\s+/g, "_");
    XLSX.writeFile(wb, `condolencias_${safeName}.xlsx`);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-sm">A carregar condolências...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-archivo font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Condolências
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {condolences.length} mensagen{condolences.length === 1 ? "" : "s"} recebida{condolences.length === 1 ? "" : "s"}
          </p>
        </div>
        {condolences.length > 0 && (
          <Button variant="outline" size="sm" onClick={exportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        )}
      </div>

      {condolences.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          Ainda não foram recebidas mensagens de condolências.
        </p>
      ) : (
        <div className="space-y-4">
          {condolences.map((c) => (
            <div
              key={c.id}
              className="border border-border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{c.author_name}</p>
                  <p className="text-sm text-muted-foreground">{c.author_email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={c.is_approved ? "default" : "secondary"}>
                    {c.is_approved ? "Aprovada" : "Pendente"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(c.created_at), "dd/MM/yyyy HH:mm", { locale: pt })}
                  </span>
                </div>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{c.message}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={c.is_approved}
                    onCheckedChange={() => toggleApproval(c.id, c.is_approved)}
                  />
                  <span className="text-xs text-muted-foreground">Visível publicamente</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteCondolence(c.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
