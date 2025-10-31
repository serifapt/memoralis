import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare } from "lucide-react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { NewConversationDialog } from "@/components/admin/NewConversationDialog";

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
  const navigate = useNavigate();

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
        () => {
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
        () => {
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

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Chat de Suporte</h1>
            <p className="text-muted-foreground">
              Gerir conversas com as funerárias
            </p>
          </div>
          <NewConversationDialog onConversationCreated={handleConversationCreated} />
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
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConversation === conv.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium text-sm">
                          {conv.funerarias?.nome_comercial}
                        </span>
                      </div>
                      {conv.unread_count > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(conv.last_message_at).toLocaleString("pt-PT")}
                    </p>
                  </button>
                ))
              )}
            </div>
          </Card>

          <div className="col-span-2">
            {selectedConversation ? (
              <ChatWindow
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
      </div>
  );
}
