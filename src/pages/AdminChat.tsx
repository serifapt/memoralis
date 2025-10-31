import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Trash2, X } from "lucide-react";
import { EnhancedChatWindow } from "@/components/chat/EnhancedChatWindow";
import { NewConversationDialog } from "@/components/admin/NewConversationDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ConversationWithFuneraria {
  id: string;
  funeraria_id: string;
  status: string;
  last_message_at: string;
  funerarias: {
    nome_comercial: string;
  };
  unread_count: number;
}

export default function AdminChat() {
  const [conversations, setConversations] = useState<ConversationWithFuneraria[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadConversations();
    subscribeToConversations();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!roles?.some((r) => r.role === "admin")) {
      navigate("/dashboard");
    }
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data: convos, error } = await supabase
        .from("conversations")
        .select(`
          id,
          funeraria_id,
          status,
          last_message_at,
          funerarias (
            nome_comercial
          )
        `)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      // Get unread counts for each conversation
      const conversationsWithUnread = await Promise.all(
        (convos || []).map(async (conv) => {
          const { count } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("is_read", false)
            .eq("sender_type", "funeraria");

          return {
            ...conv,
            unread_count: count || 0,
          };
        })
      );

      setConversations(conversationsWithUnread as any);
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel("admin-conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          console.log("Conversation changed:", payload);
          loadConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("Message inserted:", payload);
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleConversationCreated = (conversationId: string) => {
    loadConversations();
    setSelectedConversation(conversationId);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedConversations(new Set());
  };

  const toggleConversationSelection = (conversationId: string) => {
    const newSelected = new Set(selectedConversations);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedConversations(newSelected);
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      // First delete all messages in the conversation
      await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", conversationToDelete);

      // Then delete the conversation
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationToDelete);

      if (error) throw error;

      toast({
        title: "Conversa eliminada",
        description: "A conversa foi eliminada com sucesso.",
      });

      // If the deleted conversation was selected, clear selection
      if (selectedConversation === conversationToDelete) {
        setSelectedConversation(null);
      }

      loadConversations();
    } catch (error) {
      console.error("Erro ao eliminar conversa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar a conversa.",
        variant: "destructive",
      });
    } finally {
      setConversationToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedConversations.size === 0) return;

    try {
      const conversationIds = Array.from(selectedConversations);
      
      // Delete all messages and conversations in parallel
      await Promise.all(
        conversationIds.map(async (convId) => {
          // Delete messages first
          await supabase
            .from("messages")
            .delete()
            .eq("conversation_id", convId);
          
          // Then delete conversation
          await supabase
            .from("conversations")
            .delete()
            .eq("id", convId);
        })
      );

      toast({
        title: "Conversas eliminadas",
        description: `${conversationIds.length} conversa${conversationIds.length > 1 ? 's' : ''} eliminada${conversationIds.length > 1 ? 's' : ''} com sucesso.`,
      });

      // Clear selection if the current conversation was deleted
      if (selectedConversation && conversationIds.includes(selectedConversation)) {
        setSelectedConversation(null);
      }

      // Exit selection mode and reload
      setIsSelectionMode(false);
      setSelectedConversations(new Set());
      loadConversations();
    } catch (error) {
      console.error("Erro ao eliminar conversas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar as conversas.",
        variant: "destructive",
      });
    } finally {
      setConversationToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Chat de Suporte</h1>
            <p className="text-muted-foreground">
              Gerir conversas com as funerárias
            </p>
          </div>
          <div className="flex gap-2">
            {isSelectionMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={toggleSelectionMode}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConversationToDelete("bulk")}
                  disabled={selectedConversations.size === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Selecionadas ({selectedConversations.size})
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={toggleSelectionMode}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Selecionar
                </Button>
                <NewConversationDialog onConversationCreated={handleConversationCreated} />
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-1 p-4">
            <h3 className="font-semibold mb-4">Conversas</h3>
            <div className="space-y-2">
              {loading ? (
                <p className="text-sm text-muted-foreground">A carregar...</p>
              ) : conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma conversa
                </p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group relative w-full text-left p-3 rounded-lg transition-colors ${
                      isSelectionMode && selectedConversations.has(conv.id)
                        ? "border-2 border-primary bg-primary/10"
                        : selectedConversation === conv.id && !isSelectionMode
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {isSelectionMode ? (
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedConversations.has(conv.id)}
                          onCheckedChange={() => toggleConversationSelection(conv.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2 flex-1">
                              <MessageSquare className="h-4 w-4 flex-shrink-0" />
                              <span className="font-medium text-sm truncate">
                                {conv.funerarias?.nome_comercial}
                              </span>
                            </div>
                            {conv.unread_count > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-[20px] flex items-center justify-center px-1 text-xs">
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs opacity-70">
                              {new Date(conv.last_message_at).toLocaleString("pt-PT")}
                            </p>
                            {conv.status === "resolvido" ? (
                              <Badge variant="secondary" className="text-xs h-5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Resolvido
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs h-5">
                                Em Aberto
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedConversation(conv.id)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2 flex-1">
                              <MessageSquare className="h-4 w-4 flex-shrink-0" />
                              <span className="font-medium text-sm truncate">
                                {conv.funerarias?.nome_comercial}
                              </span>
                            </div>
                            {conv.unread_count > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-[20px] flex items-center justify-center px-1 text-xs">
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs opacity-70">
                              {new Date(conv.last_message_at).toLocaleString("pt-PT")}
                            </p>
                            {conv.status === "resolvido" ? (
                              <Badge variant="secondary" className="text-xs h-5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Resolvido
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs h-5">
                                Em Aberto
                              </Badge>
                            )}
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConversationToDelete(conv.id);
                          }}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                          aria-label="Eliminar conversa"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          <div className="col-span-2">
            {selectedConversation ? (
              <EnhancedChatWindow
                conversationId={selectedConversation}
                userType="admin"
              />
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma conversa para começar</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        <AlertDialog open={!!conversationToDelete} onOpenChange={() => setConversationToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar eliminação</AlertDialogTitle>
              <AlertDialogDescription>
                {conversationToDelete === "bulk" ? (
                  <>
                    Tem a certeza que deseja eliminar <strong>{selectedConversations.size} conversa{selectedConversations.size > 1 ? 's' : ''}</strong>? 
                    Esta ação não pode ser revertida. Todas as mensagens associadas serão também eliminadas.
                  </>
                ) : (
                  <>
                    Tem a certeza que deseja eliminar esta conversa? Esta ação não pode ser revertida.
                    Todas as mensagens associadas serão também eliminadas.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={conversationToDelete === "bulk" ? handleBulkDelete : handleDeleteConversation} 
                className="bg-destructive hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}
