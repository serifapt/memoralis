import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Bell } from "lucide-react";
import { EnhancedChatWindow } from "./EnhancedChatWindow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChatButtonProps {
  funerariaId?: string;
  userType: "admin" | "funeraria";
}

export function EnhancedChatButton({ funerariaId, userType }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pulse, setPulse] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create notification sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS67OilUBELTKXh8K1gGgU7k9nxx3kpBSh+zPLaizsIEV6y6+ejUhILSaHg8L9pHwU7k9nxx3kpBSh+zPLaizsIEV6y6+ejUhILSaHg8L9pHwU7k9nxx3kpBSh+zPLaizsI');
    
    if (funerariaId || userType === "funeraria") {
      loadOrCreateConversation();
    }
  }, [funerariaId, userType]);

  useEffect(() => {
    if (conversationId) {
      subscribeToUnreadMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    if (unreadCount > 0 && !isOpen) {
      setPulse(true);
      playNotificationSound();
      
      // Show desktop notification if permitted
      if (Notification.permission === "granted") {
        new Notification("Nova mensagem no chat", {
          body: `Tem ${unreadCount} mensagem${unreadCount > 1 ? 's' : ''} não lida${unreadCount > 1 ? 's' : ''}`,
          icon: "/favicon.ico",
        });
      }
    }
  }, [unreadCount, isOpen]);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  const requestNotificationPermission = async () => {
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const loadOrCreateConversation = async () => {
    try {
      let query = supabase
        .from("conversations")
        .select("id")
        .eq("status", "aberta");

      if (userType === "admin" && funerariaId) {
        query = query.eq("funeraria_id", funerariaId);
      } else if (userType === "funeraria") {
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

  const subscribeToUnreadMessages = () => {
    const updateUnreadCount = async () => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId)
        .eq("is_read", false)
        .neq("sender_type", userType);

      setUnreadCount(count || 0);
    };

    updateUnreadCount();

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
    setPulse(false);
    
    if (!isOpen) {
      requestNotificationPermission();
    }
    
    if (!isOpen && unreadCount > 0) {
      // Mark messages as read when opening
      setTimeout(() => {
        supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_type", userType)
          .eq("is_read", false)
          .then(() => setUnreadCount(0));
      }, 500);
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
            className={cn(
              "rounded-full h-14 w-14 shadow-lg relative transition-all",
              pulse && "animate-pulse"
            )}
          >
            <MessageSquare className="h-6 w-6" />
            {unreadCount > 0 && (
              <>
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 animate-bounce"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
                <Bell className="absolute -top-1 -right-1 h-3 w-3 text-destructive animate-ping" />
              </>
            )}
          </Button>
        ) : (
          <div className="bg-background rounded-lg shadow-2xl w-96 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between p-4 border-b bg-muted/50">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Chat de Suporte</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <EnhancedChatWindow conversationId={conversationId} userType={userType} />
          </div>
        )}
      </div>
    </>
  );
}
