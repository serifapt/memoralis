import { useEffect, useState } from "react";
import { EnhancedChatWindow } from "@/components/chat/EnhancedChatWindow";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function Support() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!hasLoaded) {
      loadOrCreateConversation();
    }
  }, [hasLoaded]);

  const loadOrCreateConversation = async () => {
    if (hasLoaded) return; // Prevent multiple calls
    setHasLoaded(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get funeraria_id for the current user
      const { data: funeraria } = await supabase
        .from("funerarias")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!funeraria) {
        console.error("Funerária não encontrada");
        return;
      }

      // Check if conversation already exists (including status 'fechada')
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id, status")
        .eq("funeraria_id", funeraria.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingConversation) {
        // Reopen if closed
        if (existingConversation.status === "fechada") {
          await supabase
            .from("conversations")
            .update({ status: "aberta" })
            .eq("id", existingConversation.id);
        }
        setConversationId(existingConversation.id);
      } else {
        // Create new conversation only if none exists
        const { data: newConversation, error } = await supabase
          .from("conversations")
          .insert({
            funeraria_id: funeraria.id,
            status: "aberta",
          })
          .select("id")
          .single();

        if (error) throw error;
        setConversationId(newConversation.id);
      }
    } catch (error) {
      console.error("Erro ao carregar conversa:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Não foi possível carregar o chat.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <h1 className="text-2xl font-archivo font-bold text-foreground">
          Chat de Suporte
        </h1>
        <p className="text-muted-foreground mt-1">
          Comunique diretamente com a equipa da Memoralis
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <EnhancedChatWindow
          conversationId={conversationId}
          userType="funeraria"
        />
      </div>
    </div>
  );
}
