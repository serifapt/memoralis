import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Filter, Eye, CheckCircle2, PauseCircle, XCircle } from "lucide-react";
import { useAdminCareSubscriptions, useUpdateCareSubscriptionStatus } from "@/hooks/useCareOperations";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

export default function AdminCareSubscriptions() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: subscriptions, isLoading } = useAdminCareSubscriptions();
  const updateStatus = useUpdateCareSubscriptionStatus();

  const filteredSubscriptions = subscriptions?.filter(sub => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      sub.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.memorial_locations?.cemetery_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "Ativo", variant: "default" },
      pending: { label: "Pendente", variant: "secondary" },
      pending_payment: { label: "Aguarda Pagamento", variant: "secondary" },
      pending_activation: { label: "Aguarda Ativação", variant: "secondary" },
      trialing: { label: "Teste", variant: "secondary" },
      past_due: { label: "Pagamento Pendente", variant: "destructive" },
      canceled: { label: "Cancelado", variant: "outline" },
      paused: { label: "Pausado", variant: "secondary" }
    };
    const s = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscrições Care</h1>
          <p className="text-muted-foreground">Gerir todas as subscrições do módulo Cuidado & Homenagem</p>
        </div>
        <Button asChild>
          <Link to="/admin/care/tasks">
            Ver Tarefas
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por cliente ou cemitério..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="pending_activation">Aguarda Ativação</SelectItem>
                <SelectItem value="pending_payment">Aguarda Pagamento</SelectItem>
                <SelectItem value="paused">Pausados</SelectItem>
                <SelectItem value="past_due">Pagamento Pendente</SelectItem>
                <SelectItem value="canceled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Próx. Cobrança</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions?.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.customers?.name}</p>
                        <p className="text-sm text-muted-foreground">{sub.customers?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.care_plans?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {sub.billing_period === 'monthly' ? 'Mensal' : 'Anual'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{sub.memorial_locations?.cemetery_name}</p>
                        {sub.memorial_locations?.grave_number && (
                          <p className="text-sm text-muted-foreground">
                            Campa {sub.memorial_locations.grave_number}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>
                      {sub.current_period_end ? (
                        format(new Date(sub.current_period_end), "d MMM yyyy", { locale: pt })
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(sub.status === 'pending_payment' || sub.status === 'pending_activation' || sub.status === 'paused') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Ativar"
                            onClick={() => updateStatus.mutate({ id: sub.id, status: 'active' })}
                            disabled={updateStatus.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        {sub.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Pausar"
                            onClick={() => updateStatus.mutate({ id: sub.id, status: 'paused' })}
                            disabled={updateStatus.isPending}
                          >
                            <PauseCircle className="w-4 h-4 text-yellow-600" />
                          </Button>
                        )}
                        {sub.status !== 'canceled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Cancelar"
                            onClick={() => {
                              if (confirm('Cancelar esta subscrição?')) {
                                updateStatus.mutate({ id: sub.id, status: 'canceled' });
                              }
                            }}
                            disabled={updateStatus.isPending}
                          >
                            <XCircle className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalhes da Subscrição</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Cliente</p>
                              <p className="font-medium">{sub.customers?.name}</p>
                              <p className="text-sm">{sub.customers?.email}</p>
                              {sub.customers?.phone && (
                                <p className="text-sm">{sub.customers.phone}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Local</p>
                              <p className="font-medium">{sub.memorial_locations?.cemetery_name}</p>
                              {sub.memorial_locations?.cemetery_address && (
                                <p className="text-sm">{sub.memorial_locations.cemetery_address}</p>
                              )}
                              {sub.memorial_locations?.grave_number && (
                                <p className="text-sm">Campa: {sub.memorial_locations.grave_number}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Stripe ID</p>
                              <p className="text-sm font-mono">{sub.stripe_subscription_id || '-'}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredSubscriptions || filteredSubscriptions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma subscrição encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
