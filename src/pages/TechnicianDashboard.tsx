import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Calendar, CheckCircle, Camera, Upload, LogOut, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTechnicianTasks, useUpdateTaskStatus } from "@/hooks/useCareOperations";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const { data: tasks, isLoading, refetch } = useTechnicianTasks();
  const updateStatus = useUpdateTaskStatus();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (!session) {
        navigate('/technician/auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        navigate('/technician/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/technician/auth');
  };

  const handleStartTask = async (taskId: string) => {
    await updateStatus.mutateAsync({ taskId, status: 'in_progress' });
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    await updateStatus.mutateAsync({ 
      taskId: selectedTask, 
      status: 'completed',
      notes: completionNotes 
    });
    setSelectedTask(null);
    setCompletionNotes('');
  };

  const handleUploadMedia = async (taskId: string, file: File, type: 'before' | 'after') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${taskId}/${type}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('care-media')
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Erro ao carregar foto", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('care-media')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from('service_task_media')
      .insert({
        service_task_id: taskId,
        type,
        file_url: publicUrl
      });

    if (dbError) {
      toast({ title: "Erro ao guardar foto", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: `Foto ${type === 'before' ? 'antes' : 'depois'} carregada` });
      refetch();
    }
  };

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const scheduledTasks = tasks?.filter(t => t.status === 'scheduled') || [];
  const inProgressTasks = tasks?.filter(t => t.status === 'in_progress') || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-semibold">Painel do Técnico</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* In Progress Tasks */}
        {inProgressTasks.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-primary" />
              Em Curso ({inProgressTasks.length})
            </h2>
            <div className="space-y-4">
              {inProgressTasks.map((task: any) => (
                <Card key={task.id} className="border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {task.care_subscriptions?.care_plans?.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {task.care_subscriptions?.memorial_locations?.cemetery_name}
                          {task.care_subscriptions?.memorial_locations?.grave_number && 
                            ` • Campa ${task.care_subscriptions.memorial_locations.grave_number}`
                          }
                        </CardDescription>
                      </div>
                      <Badge>Em Curso</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {task.care_subscriptions?.memorial_locations?.cemetery_address && (
                      <p className="text-sm text-muted-foreground">
                        {task.care_subscriptions.memorial_locations.cemetery_address}
                      </p>
                    )}
                    
                    {task.care_subscriptions?.memorial_locations?.notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Notas do Local:</p>
                        <p className="text-sm">{task.care_subscriptions.memorial_locations.notes}</p>
                      </div>
                    )}

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Foto Antes</Label>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                          <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Carregar</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadMedia(task.id, file, 'before');
                            }}
                          />
                        </label>
                      </div>
                      <div>
                        <Label className="text-sm">Foto Depois</Label>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                          <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Carregar</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadMedia(task.id, file, 'after');
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full" onClick={() => setSelectedTask(task.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Concluir Tarefa
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Concluir Tarefa</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Notas (opcional)</Label>
                            <Textarea
                              placeholder="Observações sobre o serviço realizado..."
                              value={completionNotes}
                              onChange={(e) => setCompletionNotes(e.target.value)}
                              rows={4}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedTask(null)}>Cancelar</Button>
                          <Button onClick={handleCompleteTask} disabled={updateStatus.isPending}>
                            {updateStatus.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirmar Conclusão
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Tasks */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Agendadas ({scheduledTasks.length})
          </h2>
          
          {scheduledTasks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Não tem tarefas agendadas.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {scheduledTasks.map((task: any) => (
                <Card key={task.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {task.care_subscriptions?.care_plans?.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {task.care_subscriptions?.memorial_locations?.cemetery_name}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {format(new Date(task.scheduled_for), "d MMM", { locale: pt })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleStartTask(task.id)}
                      disabled={updateStatus.isPending}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Iniciar Tarefa
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
