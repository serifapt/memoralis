import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State =
  | { kind: "loading" }
  | { kind: "valid" }
  | { kind: "already" }
  | { kind: "invalid" }
  | { kind: "processing" }
  | { kind: "done" }
  | { kind: "error"; message: string };

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid" });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } }
        );
        const data = await res.json();
        if (res.ok && data.valid) setState({ kind: "valid" });
        else if (data.reason === "already_unsubscribed") setState({ kind: "already" });
        else setState({ kind: "invalid" });
      } catch (e) {
        setState({ kind: "error", message: e instanceof Error ? e.message : "Erro" });
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState({ kind: "processing" });
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
      body: { token },
    });
    if (error) setState({ kind: "error", message: error.message });
    else if (data?.success) setState({ kind: "done" });
    else if (data?.reason === "already_unsubscribed") setState({ kind: "already" });
    else setState({ kind: "error", message: "Não foi possível processar" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        <h1 className="font-archivo text-2xl font-bold text-foreground">
          Cancelar subscrição
        </h1>
        {state.kind === "loading" && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {state.kind === "valid" && (
          <>
            <p className="text-muted-foreground">
              Clique para confirmar que deseja deixar de receber emails da Memoralis.
            </p>
            <Button onClick={confirm} className="bg-primary hover:bg-primary/90">
              Confirmar cancelamento
            </Button>
          </>
        )}
        {state.kind === "processing" && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {state.kind === "done" && (
          <div className="space-y-2">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
            <p className="text-foreground">Subscrição cancelada com sucesso.</p>
          </div>
        )}
        {state.kind === "already" && (
          <div className="space-y-2">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
            <p className="text-foreground">Já tinha cancelado a subscrição.</p>
          </div>
        )}
        {state.kind === "invalid" && (
          <div className="space-y-2">
            <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
            <p className="text-foreground">Link inválido ou expirado.</p>
          </div>
        )}
        {state.kind === "error" && (
          <div className="space-y-2">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
            <p className="text-foreground">{state.message}</p>
          </div>
        )}
      </Card>
    </div>
  );
}