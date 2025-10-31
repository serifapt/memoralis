import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ChatButtonProps {
  funerariaId?: string;
  userType: "admin" | "funeraria";
}

export function ChatButton({ funerariaId, userType }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (funerariaId || userType === "funeraria") {
      loadOrCreateConversation();
      subscribeToUnreadMessages();
    }
  }, [funerariaId, userType]);

  const loadOrCreateConversation = async () => {
    try {
      let query = supabase
        .from("conversations")
        .select("id")
        .eq("status", "aberta");

      if (userType === "admin" && funerariaId) {
        query = query.eq("funeraria_id", funerariaId);
      } else if (userType === "funeraria") {
        // Get funeraria_id for current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: funeraria } = await supabase
          .from("funerarias")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!funeraria) return;
        query = query.eq("funeraria_id", funeraria.id);
      }

      const { data: existing } = await query.single();

      if (existing) {
        setConversationId(existing.id);
      } else if (userType === "funeraria") {
        // Create new conversation for funeraria
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: funeraria } = await supabase
          .from("funerarias")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!funeraria) return;

        const { data: newConv, error } = await supabase
          .from("conversations")
          .insert({ funeraria_id: funeraria.id })
          .select("id")
          .single();

        if (error) throw error;
        setConversationId(newConv.id);
      }
    } catch (error) {
      console.error("Erro ao carregar conversa:", error);
      toast.error("Erro ao iniciar chat");
    }
  };

  const subscribeToUnreadMessages = async () => {
    if (!conversationId) return;

    const updateUnreadCount = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id", { count: "exact" })
        .eq("conversation_id", conversationId)
        .eq("is_read", false)
        .neq("sender_type", userType);

      if (!error && data) {
        setUnreadCount(data.length);
      }
    };

    await updateUnreadCount();

    const channel = supabase
      .channel(`unread:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          updateUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  if (!conversationId) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <Button
            onClick={handleToggle}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg relative"
          >
            <MessageSquare className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        ) : (
          <div className="bg-background rounded-lg shadow-2xl w-96">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Chat de Suporte</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ChatWindow conversationId={conversationId} userType={userType} />
          </div>
        )}
      </div>
    </>
  );
}
