import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  subscriptionId: string;
}

type Slot = "before" | "after";

export function RegisterVisitDialog({ open, onOpenChange, taskId, subscriptionId }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [notes, setNotes] = useState("");
  const [beforeFiles, setBeforeFiles] = useState<File[]>([]);
  const [afterFiles, setAfterFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePick = (slot: Slot, files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    if (slot === "before") setBeforeFiles((prev) => [...prev, ...list]);
    else setAfterFiles((prev) => [...prev, ...list]);
  };

  const remove = (slot: Slot, idx: number) => {
    if (slot === "before") setBeforeFiles((prev) => prev.filter((_, i) => i !== idx));
    else setAfterFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadFiles = async (files: File[], type: Slot) => {
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${subscriptionId}/${taskId}/${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("care-media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadErr) throw uploadErr;
      const { data: publicUrl } = supabase.storage.from("care-media").getPublicUrl(path);
      const { error: insertErr } = await supabase.from("service_task_media").insert({
        service_task_id: taskId,
        type,
        file_url: publicUrl.publicUrl,
      });
      if (insertErr) throw insertErr;
    }
  };

  const handleSubmit = async () => {
    if (beforeFiles.length === 0 && afterFiles.length === 0) {
      toast({ title: "Adicione pelo menos uma foto", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await uploadFiles(beforeFiles, "before");
      await uploadFiles(afterFiles, "after");
      const { error } = await supabase
        .from("service_tasks")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          technician_notes: notes || null,
        })
        .eq("id", taskId);
      if (error) throw error;
      toast({ title: "Visita registada com sucesso" });
      qc.invalidateQueries({ queryKey: ["admin-service-tasks"] });
      onOpenChange(false);
      setNotes("");
      setBeforeFiles([]);
      setAfterFiles([]);
    } catch (e: any) {
      toast({ title: "Erro ao registar visita", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const renderSlot = (slot: Slot, files: File[], title: string) => (
    <div className="space-y-2">
      <Label>{title}</Label>
      <div className="border-2 border-dashed rounded-lg p-4">
        <label className="cursor-pointer flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <Upload className="w-4 h-4" />
          Adicionar fotos
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handlePick(slot, e.target.files)}
          />
        </label>
        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {files.map((f, i) => (
              <div key={i} className="relative aspect-square rounded overflow-hidden border">
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => remove(slot, i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registar Visita</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {renderSlot("before", beforeFiles, "Fotos Antes")}
          {renderSlot("after", afterFiles, "Fotos Depois")}
          <div>
            <Label>Notas da visita</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Trabalho realizado, observações, etc."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Concluir Visita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}