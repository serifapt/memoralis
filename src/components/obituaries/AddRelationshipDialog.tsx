import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Obituary {
  id: string;
  display_name: string;
  death_date: string | null;
  full_name: string;
}

interface AddRelationshipDialogProps {
  currentObituaryId: string;
  funerariaId: string;
  onRelationshipAdded: () => void;
}

export function AddRelationshipDialog({ 
  currentObituaryId, 
  funerariaId,
  onRelationshipAdded 
}: AddRelationshipDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [obituaries, setObituaries] = useState<Obituary[]>([]);
  const [selectedObituary, setSelectedObituary] = useState("");
  const [relationshipType, setRelationshipType] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchObituaries();
    }
  }, [open, searchTerm, funerariaId]);

  const fetchObituaries = async () => {
    try {
      let query = supabase
        .from('obituaries')
        .select('id, display_name, death_date, full_name')
        .eq('funeraria_id', funerariaId)
        .neq('id', currentObituaryId);

      if (searchTerm) {
        query = query.or(`display_name.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setObituaries(data || []);
    } catch (error) {
      console.error('Error fetching obituaries:', error);
    }
  };

  const handleAddRelationship = async () => {
    if (!selectedObituary || !relationshipType) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione um óbito e o tipo de relação",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('obituary_relationships')
        .insert({
          obituary_id: currentObituaryId,
          related_obituary_id: selectedObituary,
          relationship_type: relationshipType,
        });

      if (error) throw error;

      toast({
        title: "Relação adicionada",
        description: "O óbito foi relacionado com sucesso",
      });

      setOpen(false);
      setSelectedObituary("");
      setRelationshipType("");
      onRelationshipAdded();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar a relação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Relação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Óbito Relacionado</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Search */}
          <div>
            <Label htmlFor="search">Pesquisar Óbito</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                placeholder="Nome do falecido..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Select Obituary */}
          <div>
            <Label htmlFor="obituary">Selecionar Óbito *</Label>
            <Select value={selectedObituary} onValueChange={setSelectedObituary}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Escolher óbito..." />
              </SelectTrigger>
              <SelectContent>
                {obituaries.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Nenhum óbito encontrado
                  </div>
                ) : (
                  obituaries.map((obit) => (
                    <SelectItem key={obit.id} value={obit.id}>
                      {obit.display_name} {obit.death_date ? `• ${new Date(obit.death_date).getFullYear()}` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Relationship Type */}
          <div>
            <Label htmlFor="relationship">Tipo de Relação *</Label>
            <Select value={relationshipType} onValueChange={setRelationshipType}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pai">Pai/Mãe</SelectItem>
                <SelectItem value="filho">Filho(a)</SelectItem>
                <SelectItem value="conjuge">Cônjuge</SelectItem>
                <SelectItem value="irmao">Irmão(ã)</SelectItem>
                <SelectItem value="avo">Avô/Avó</SelectItem>
                <SelectItem value="neto">Neto(a)</SelectItem>
                <SelectItem value="tio">Tio(a)</SelectItem>
                <SelectItem value="sobrinho">Sobrinho(a)</SelectItem>
                <SelectItem value="outro">Outro Familiar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddRelationship} disabled={loading}>
              {loading ? "A adicionar..." : "Adicionar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
