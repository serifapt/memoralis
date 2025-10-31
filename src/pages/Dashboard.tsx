import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { ChatButton } from "@/components/chat/ChatButton";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="max-w-2xl w-full p-8 text-center space-y-6">
        <div>
          <h1 className="text-3xl font-archivo font-bold text-foreground mb-2">
            Bem-vindo à Memoralis
          </h1>
          <p className="text-muted-foreground">
            Para qualquer questão ou assistência, por favor utilize o chat de suporte.
          </p>
        </div>
        
        <div className="p-6 rounded-lg bg-muted/30 border border-border">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Chat de Suporte
          </h2>
          <p className="text-sm text-muted-foreground">
            Clique no ícone de chat no canto inferior direito para falar com um administrador.
          </p>
        </div>
      </Card>
      
      <ChatButton userType="funeraria" />
    </div>
  );
}
