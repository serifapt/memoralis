import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Funeraria {
  id: string;
  nome_comercial: string;
  responsavel_nome: string;
  status: string;
}

interface NewConversationDialogProps {
  onConversationCreated: (conversationId: string) => void;
}

export function NewConversationDialog({ onConversationCreated }: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [funerarias, setFunerarias] = useState<Funeraria[]>([]);
  const [filteredFunerarias, setFilteredFunerarias] = useState<Funeraria[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      loadFunerarias();
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = funerarias.filter((f) =>
        f.nome_comercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.responsavel_nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFunerarias(filtered);
    } else {
      setFilteredFunerarias(funerarias);
    }
  }, [searchTerm, funerarias]);

  const loadFunerarias = async () => {
    setLoading(true);
    try {
      // Get all approved funerarias
      const { data: allFunerarias, error: funError } = await supabase
        .from("funerarias")
        .select("id, nome_comercial, responsavel_nome, status")
        .eq("status", "aprovada")
        .order("nome_comercial");

      if (funError) throw funError;

      // Get existing conversations
      const { data: existingConvos, error: convoError } = await supabase
        .from("conversations")
        .select("funeraria_id")
        .eq("status", "aberta");

      if (convoError) throw convoError;

      // Filter out funerarias that already have open conversations
      const existingFunerariaIds = new Set(existingConvos?.map(c => c.funeraria_id));
      const availableFunerarias = allFunerarias?.filter(
        f => !existingFunerariaIds.has(f.id)
      ) || [];

      setFunerarias(availableFunerarias);
      setFilteredFunerarias(availableFunerarias);
    } catch (error) {
      console.error("Erro ao carregar funerárias:", error);
      toast.error("Erro ao carregar funerárias");
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (funerariaId: string) => {
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          funeraria_id: funerariaId,
          status: "aberta",
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success("Conversa criada com sucesso");
      setOpen(false);
      setSearchTerm("");
      onConversationCreated(data.id);
    } catch (error) {
      console.error("Erro ao criar conversa:", error);
      toast.error("Erro ao criar conversa");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conversa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Iniciar Nova Conversa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search">Pesquisar Funerária</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                placeholder="Nome comercial ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="h-[300px] rounded-md border p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredFunerarias.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchTerm
                  ? "Nenhuma funerária encontrada"
                  : "Todas as funerárias já têm conversas ativas"}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredFunerarias.map((funeraria) => (
                  <button
                    key={funeraria.id}
                    onClick={() => createConversation(funeraria.id)}
                    disabled={creating}
                    className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <p className="font-medium">{funeraria.nome_comercial}</p>
                    <p className="text-sm text-muted-foreground">
                      {funeraria.responsavel_nome}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
