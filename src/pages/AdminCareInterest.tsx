import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CARE_PLANS } from "@/lib/care-plans";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  locality: string | null;
  parish: string | null;
  cemetery_name: string;
  plan_code: string | null;
  message: string | null;
  status: string;
  contacted_at: string | null;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: "new", label: "Novo" },
  { value: "contacted", label: "Contactado" },
  { value: "converted", label: "Convertido" },
  { value: "archived", label: "Arquivado" },
];

const statusBadge: Record<string, string> = {
  new: "bg-amber-100 text-amber-900 border-amber-200",
  contacted: "bg-blue-100 text-blue-900 border-blue-200",
  converted: "bg-emerald-100 text-emerald-900 border-emerald-200",
  archived: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

export default function AdminCareInterest() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["care-interest-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("care_interest_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const patch: Record<string, unknown> = { status };
      if (status === "contacted") patch.contacted_at = new Date().toISOString();
      const { error } = await supabase.from("care_interest_leads").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["care-interest-leads"] });
      toast.success("Estado atualizado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("care_interest_leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["care-interest-leads"] });
      toast.success("Registo eliminado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  const planName = (code: string | null) =>
    code ? CARE_PLANS.find((p) => p.code === code)?.name ?? code : "—";

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lista de interessados — Care</h1>
            <p className="text-muted-foreground text-sm">
              Pedidos de pessoas que querem ser contactadas quando o serviço estiver disponível no cemitério delas.
            </p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos ({leads.length})</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label} ({leads.filter((l) => l.status === s.value).length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          {isLoading ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">Sem pedidos.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Cemitério</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(l.created_at).toLocaleDateString("pt-PT")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{l.name}</div>
                      <a
                        href={`mailto:${l.email}`}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                      >
                        <Mail className="w-3 h-3" /> {l.email}
                      </a>
                      {l.phone && (
                        <a
                          href={`tel:${l.phone}`}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <Phone className="w-3 h-3" /> {l.phone}
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {[l.parish, l.locality].filter(Boolean).join(", ") || "—"}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{l.cemetery_name}</TableCell>
                    <TableCell className="text-sm">{planName(l.plan_code)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {l.message || "—"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={l.status}
                        onValueChange={(status) => updateStatus.mutate({ id: l.id, status })}
                      >
                        <SelectTrigger className="h-8 w-36">
                          <Badge variant="outline" className={statusBadge[l.status] ?? ""}>
                            {STATUS_OPTIONS.find((s) => s.value === l.status)?.label ?? l.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Eliminar este pedido?")) remove.mutate(l.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}