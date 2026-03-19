import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Star, Check, X, Trash2, MessageSquare, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Testimonial {
  id: string;
  author_name: string;
  author_email: string | null;
  message: string;
  rating: number;
  status: string;
  response: string | null;
  created_at: string;
}

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [funerariaId, setFunerariaId] = useState<string | null>(null);

  useEffect(() => {
    loadFunerariaAndTestimonials();
  }, []);

  const loadFunerariaAndTestimonials = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: funeraria } = await supabase
      .from("funerarias")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!funeraria) return;
    setFunerariaId(funeraria.id);

    const { data, error } = await supabase
      .from("funeraria_testimonials")
      .select("id, author_name, author_email, message, rating, status, response, created_at")
      .eq("funeraria_id", funeraria.id)
      .order("created_at", { ascending: false });

    if (!error && data) setTestimonials(data as Testimonial[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("funeraria_testimonials")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar estado");
    } else {
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      toast.success(status === "approved" ? "Testemunho aprovado" : "Testemunho rejeitado");
    }
  };

  const deleteTestimonial = async (id: string) => {
    const { error } = await supabase
      .from("funeraria_testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao apagar testemunho");
    } else {
      setTestimonials(prev => prev.filter(t => t.id !== id));
      toast.success("Testemunho apagado");
    }
  };

  const submitResponse = async (id: string) => {
    if (!responseText.trim()) return;

    const { error } = await supabase
      .from("funeraria_testimonials")
      .update({ response: responseText.trim() })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao guardar resposta");
    } else {
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, response: responseText.trim() } : t));
      setRespondingId(null);
      setResponseText("");
      toast.success("Resposta guardada");
    }
  };

  const filtered = testimonials.filter(t => {
    if (filter !== "all" && t.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.author_name.toLowerCase().includes(q) || t.message.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: testimonials.length,
    pending: testimonials.filter(t => t.status === "pending").length,
    approved: testimonials.filter(t => t.status === "approved").length,
    rejected: testimonials.filter(t => t.status === "rejected").length,
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="secondary">Pendente</Badge>;
      case "approved": return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Aprovado</Badge>;
      case "rejected": return <Badge variant="destructive">Rejeitado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-archivo font-bold text-foreground">Testemunhos</h1>
        <p className="text-muted-foreground mt-1">Gerir avaliações e testemunhos recebidos</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome ou mensagem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">Todos ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending">Pendentes ({counts.pending})</TabsTrigger>
            <TabsTrigger value="approved">Aprovados ({counts.approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitados ({counts.rejected})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Sem testemunhos</h3>
            <p className="text-muted-foreground">Nenhum testemunho encontrado com os filtros atuais.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const isExpanded = expandedId === t.id;
            const isResponding = respondingId === t.id;

            return (
              <Card key={t.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    className="w-full text-left p-4 hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : t.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-foreground">{t.author_name}</span>
                          {statusBadge(t.status)}
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{t.message}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString("pt-PT")}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Mensagem completa</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t.message}</p>
                      </div>

                      {t.author_email && (
                        <p className="text-sm text-muted-foreground">
                          Email: <a href={`mailto:${t.author_email}`} className="text-primary hover:underline">{t.author_email}</a>
                        </p>
                      )}

                      {t.response && !isResponding && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs font-medium text-foreground mb-1">A sua resposta:</p>
                          <p className="text-sm text-muted-foreground">{t.response}</p>
                        </div>
                      )}

                      {isResponding && (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Escreva a sua resposta..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => submitResponse(t.id)}>Guardar resposta</Button>
                            <Button size="sm" variant="outline" onClick={() => { setRespondingId(null); setResponseText(""); }}>Cancelar</Button>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {t.status !== "approved" && (
                          <Button size="sm" variant="outline" className="text-green-600" onClick={() => updateStatus(t.id, "approved")}>
                            <Check className="w-4 h-4 mr-1" /> Aprovar
                          </Button>
                        )}
                        {t.status !== "rejected" && (
                          <Button size="sm" variant="outline" className="text-orange-600" onClick={() => updateStatus(t.id, "rejected")}>
                            <X className="w-4 h-4 mr-1" /> Rejeitar
                          </Button>
                        )}
                        {!isResponding && (
                          <Button size="sm" variant="outline" onClick={() => { setRespondingId(t.id); setResponseText(t.response || ""); }}>
                            <MessageSquare className="w-4 h-4 mr-1" /> {t.response ? "Editar resposta" : "Responder"}
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-1" /> Apagar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Apagar testemunho?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteTestimonial(t.id)}>Apagar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
