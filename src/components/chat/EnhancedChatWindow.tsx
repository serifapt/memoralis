import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, Loader2, Check, CheckCheck, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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

interface Message {
  id: string;
  content: string;
  sender_type: "admin" | "funeraria";
  created_at: string;
  is_read: boolean;
}

interface ChatWindowProps {
  conversationId: string;
  userType: "admin" | "funeraria";
}

export function EnhancedChatWindow({ conversationId, userType }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStatus, setConversationStatus] = useState<"aberta" | "resolvido">("aberta");
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS67OilUBELTKXh8K1gGgU7k9nxx3kpBSh+zPLaizsIEV6y6+ejUhILSaHg8L9pHwU7k9nxx3kpBSh+zPLaizsIEV6y6+ejUhILSaHg8L9pHwU7k9nxx3kpBSh+zPLaizsI');
    
    loadConversationStatus();
    loadMessages();
    subscribeToMessages();
    subscribeToTyping();
    subscribeToConversationStatus();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  const loadConversationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("status")
        .eq("id", conversationId)
        .single();

      if (error) throw error;
      if (data) {
        setConversationStatus(data.status as "aberta" | "resolvido");
      }
    } catch (error) {
      console.error("Erro ao carregar status da conversa:", error);
    }
  };

  const markAsResolved = async () => {
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ status: "resolvido" })
        .eq("id", conversationId);

      if (error) throw error;

      setConversationStatus("resolvido");
      toast.success("Conversa marcada como resolvida");
    } catch (error) {
      console.error("Erro ao marcar como resolvido:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageToDelete);

      if (error) throw error;

      setMessages((prev) => prev.filter((msg) => msg.id !== messageToDelete));
      toast.success("Mensagem eliminada");
    } catch (error) {
      console.error("Erro ao eliminar mensagem:", error);
      toast.error("Erro ao eliminar mensagem");
    } finally {
      setMessageToDelete(null);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);

      // Mark messages as read
      if (data && data.length > 0) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_type", userType)
          .eq("is_read", false);
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          
          // Play sound if message is from other user
          if (newMsg.sender_type !== userType) {
            playNotificationSound();
            
            // Mark as read immediately
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMsg.id)
              .then();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as Message) : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTyping = () => {
    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const otherUserTyping = Object.values(state).some(
          (presences: any) =>
            presences[0]?.typing && presences[0]?.userType !== userType
        );
        setIsTyping(otherUserTyping);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToConversationStatus = () => {
    const channel = supabase
      .channel(`conversation-status:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          if (payload.new.status) {
            setConversationStatus(payload.new.status as "aberta" | "resolvido");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleTyping = () => {
    const channel = supabase.channel(`typing:${conversationId}`);
    
    channel.track({ typing: true, userType }).then();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      channel.track({ typing: false, userType }).then();
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilizador não autenticado");

      // If funeraria is sending message and conversation is resolved, reopen it
      if (userType === "funeraria" && conversationStatus === "resolvido") {
        await supabase
          .from("conversations")
          .update({ status: "aberta" })
          .eq("id", conversationId);
        setConversationStatus("aberta");
      }

      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_type: userType,
        content: newMessage.trim(),
      });

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      setNewMessage("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      handleTyping();
    }
  };


  const formatDate = (date: string) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return msgDate.toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return `Ontem ${msgDate.toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return msgDate.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b flex items-center gap-2 bg-muted/50">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Chat de Suporte</h3>
        
        {conversationStatus === "resolvido" ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Problema Resolvido
          </Badge>
        ) : (
          <Badge variant="default">
            Em Aberto
          </Badge>
        )}
        
        {isTyping && (
          <Badge variant="secondary">
            A escrever...
          </Badge>
        )}
        
        {userType === "admin" && conversationStatus === "aberta" && (
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={markAsResolved}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar como Resolvido
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isOwnMessage = message.sender_type === userType;
            const showDate = index === 0 || 
              new Date(messages[index - 1].created_at).toDateString() !== 
              new Date(message.created_at).toDateString();

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <Badge variant="outline" className="text-xs">
                      {new Date(message.created_at).toLocaleDateString("pt-PT", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </Badge>
                  </div>
                )}
                
                <div
                  className={cn(
                    "flex",
                    isOwnMessage ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn("relative group", isOwnMessage ? "flex-row-reverse" : "flex-row")}>
                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg px-4 py-2 shadow-sm",
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs opacity-70">
                          {formatDate(message.created_at)}
                        </p>
                        {isOwnMessage && (
                          <span className="text-xs">
                            {message.is_read ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {isOwnMessage && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity ml-2",
                          isOwnMessage ? "text-destructive hover:text-destructive hover:bg-destructive/10" : ""
                        )}
                        onClick={() => setMessageToDelete(message.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <Input
            placeholder="Escreva a sua mensagem..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1"
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={loading || !newMessage.trim()}
            size="icon"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={!!messageToDelete} onOpenChange={() => setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar mensagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser revertida. A mensagem será permanentemente eliminada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
