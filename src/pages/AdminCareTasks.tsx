import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Filter, Calendar, User, Plus } from "lucide-react";
import { useAdminServiceTasks, useAdminTechnicians, useAssignTask, useCreateServiceTask, useAdminCareSubscriptions } from "@/hooks/useCareOperations";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export default function AdminCareTasks() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    subscription_id: '',
    scheduled_for: format(new Date(), 'yyyy-MM-dd'),
    assigned_to: ''
  });

  const { data: tasks, isLoading: loadingTasks } = useAdminServiceTasks({
    status: statusFilter === 'all' ? undefined : statusFilter,
    technician_id: technicianFilter === 'all' ? undefined : technicianFilter
  });
  const { data: technicians } = useAdminTechnicians();
  const { data: subscriptions } = useAdminCareSubscriptions();
  const assignTask = useAssignTask();
  const createTask = useCreateServiceTask();

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      scheduled: { label: "Agendada", variant: "secondary" },
      in_progress: { label: "Em Curso", variant: "default" },
      completed: { label: "Concluída", variant: "outline" },
      canceled: { label: "Cancelada", variant: "destructive" }
    };
    const s = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const handleCreateTask = async () => {
    await createTask.mutateAsync({
      subscription_id: newTaskData.subscription_id,
      scheduled_for: newTaskData.scheduled_for,
      assigned_to: newTaskData.assigned_to || undefined
    });
    setIsCreateOpen(false);
    setNewTaskData({
      subscription_id: '',
      scheduled_for: format(new Date(), 'yyyy-MM-dd'),
      assigned_to: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tarefas de Serviço</h1>
          <p className="text-muted-foreground">Gerir e atribuir tarefas aos técnicos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/care/subscriptions">
              Ver Subscrições
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/care/technicians">
              Gerir Técnicos
            </Link>
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Subscrição</Label>
                  <Select 
                    value={newTaskData.subscription_id} 
                    onValueChange={(v) => setNewTaskData(prev => ({ ...prev, subscription_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar subscrição" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptions?.filter(s => s.status === 'active').map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.customers?.name} - {sub.memorial_locations?.cemetery_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data Agendada</Label>
                  <Input
                    type="date"
                    value={newTaskData.scheduled_for}
                    onChange={(e) => setNewTaskData(prev => ({ ...prev, scheduled_for: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Técnico (opcional)</Label>
                  <Select 
                    value={newTaskData.assigned_to} 
                    onValueChange={(v) => setNewTaskData(prev => ({ ...prev, assigned_to: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar técnico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Não atribuído</SelectItem>
                      {technicians?.filter(t => t.active).map(tech => (
                        <SelectItem key={tech.id} value={tech.user_id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateTask} disabled={!newTaskData.subscription_id || createTask.isPending}>
                  {createTask.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Agendadas</SelectItem>
                <SelectItem value="in_progress">Em Curso</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
              <SelectTrigger className="w-[180px]">
                <User className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Técnico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {technicians?.map(tech => (
                  <SelectItem key={tech.id} value={tech.user_id}>{tech.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loadingTasks ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks?.map((task: any) => {
                  const techName = technicians?.find(t => t.user_id === task.assigned_to)?.name;
                  
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(task.scheduled_for), "d MMM yyyy", { locale: pt })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.care_subscriptions?.customers?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{task.care_subscriptions?.memorial_locations?.cemetery_name}</p>
                          {task.care_subscriptions?.memorial_locations?.grave_number && (
                            <p className="text-sm text-muted-foreground">
                              Campa {task.care_subscriptions.memorial_locations.grave_number}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.care_subscriptions?.care_plans?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {techName || (
                          <span className="text-muted-foreground italic">Não atribuído</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell className="text-right">
                        {task.status === 'scheduled' && !task.assigned_to && (
                          <Select onValueChange={(v) => assignTask.mutate({ taskId: task.id, technicianUserId: v })}>
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Atribuir" />
                            </SelectTrigger>
                            <SelectContent>
                              {technicians?.filter(t => t.active).map(tech => (
                                <SelectItem key={tech.id} value={tech.user_id}>
                                  {tech.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!tasks || tasks.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma tarefa encontrada
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
