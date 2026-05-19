import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Flower,
  Loader2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useFlowerService } from "@/hooks/useFlowerService";
import { toast } from "sonner";

interface ConnectStatus {
  stripe_account_id: string | null;
  stripe_onboarding_completed: boolean;
  stripe_charges_enabled: boolean;
}

export function FlowerStripeOnboarding() {
  const { isFlowerServiceActive, funerariaId, toggleFlowerService } = useFlowerService();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [openingDashboard, setOpeningDashboard] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!funerariaId) return;
    const { data } = await supabase
      .from("funerarias")
      .select("stripe_account_id, stripe_onboarding_completed, stripe_charges_enabled")
      .eq("id", funerariaId)
      .maybeSingle();
    if (data) setStatus(data as ConnectStatus);
    setLoading(false);
  }, [funerariaId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Auto-refresh after return from Stripe onboarding
  useEffect(() => {
    const stripeParam = searchParams.get("stripe");
    if (stripeParam === "return" && funerariaId) {
      handleRefreshStatus();
      searchParams.delete("stripe");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funerariaId]);

  const handleToggle = async (next: boolean) => {
    if (next === isFlowerServiceActive) return;
    await toggleFlowerService();
  };

  const handleStartOnboarding = async () => {
    setCreatingAccount(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-flower-connect-account",
        { body: {} }
      );
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao iniciar configuração Stripe";
      toast.error(msg);
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "refresh-flower-connect-status",
        { body: {} }
      );
      if (error) throw error;
      await loadStatus();
      if (data?.charges_enabled) {
        toast.success("Conta Stripe ativa! Já pode receber pagamentos.");
      } else if (data?.onboarding_completed) {
        toast.info("Configuração submetida. A aguardar aprovação Stripe.");
      } else {
        toast.info("Configuração ainda incompleta.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar estado";
      toast.error(msg);
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenDashboard = async () => {
    setOpeningDashboard(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "stripe-connect-login-link",
        { body: {} }
      );
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank", "noopener");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao abrir dashboard";
      toast.error(msg);
    } finally {
      setOpeningDashboard(false);
    }
  };

  const hasAccount = !!status?.stripe_account_id;
  const chargesEnabled = !!status?.stripe_charges_enabled;
  const onboardingDone = !!status?.stripe_onboarding_completed;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-archivo font-semibold text-foreground mb-4">
        Catálogo de Flores
      </h3>

      {/* Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Flower className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Serviço de Flores</p>
            <p className="text-sm text-muted-foreground">
              Permita que visitantes encomendem flores para os funerais
            </p>
          </div>
        </div>
        <Switch
          checked={isFlowerServiceActive}
          onCheckedChange={handleToggle}
          disabled={!funerariaId}
        />
      </div>

      {!isFlowerServiceActive && (
        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-foreground">Como funciona o serviço</h4>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>O cliente final encomenda flores diretamente na página do obituário.</li>
            <li>
              A funerária recebe o pedido e coordena com a sua rede de floristas,
              garantindo a entrega no local do velório/funeral.
            </li>
            <li>
              Os pedidos só podem ser feitos até{" "}
              <strong>X horas antes do funeral</strong> (configurável).
            </li>
          </ul>

          <h4 className="font-semibold text-foreground pt-2">Regras de pagamento</h4>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              Os valores definidos no catálogo são <strong>com IVA incluído</strong>.
            </li>
            <li>
              A Memoralis cobra uma <strong>taxa de serviço de 10% (mínimo 5€)</strong>{" "}
              <em>adicionada</em> ao valor pago pelo cliente. O total do produto é
              transferido integralmente para a sua conta Stripe.
            </li>
            <li>
              Em caso de reembolso, a Memoralis retém 50% da taxa de serviço para
              cobrir custos de processamento Stripe.
            </li>
            <li>
              A <strong>emissão de fatura ao cliente final é da responsabilidade da
              funerária</strong>.
            </li>
          </ul>

          <Alert className="mt-4 border-primary/30 bg-primary/5">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              Para ativar é <strong>obrigatório criar uma conta Stripe</strong>. É
              através dela que recebe os valores das vendas diretamente.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {isFlowerServiceActive && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !hasAccount ? (
            <Alert className="border-amber-500/40 bg-amber-500/5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="space-y-3">
                <p className="text-foreground">
                  Configure a sua conta Stripe para começar a receber pedidos. Enquanto
                  não configurar, o botão "Enviar flores" não aparece aos visitantes.
                </p>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleStartOnboarding}
                  disabled={creatingAccount}
                >
                  {creatingAccount && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Configurar Stripe Connect
                </Button>
              </AlertDescription>
            </Alert>
          ) : !chargesEnabled ? (
            <Alert className="border-blue-500/40 bg-blue-500/5">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="space-y-3">
                <p className="text-foreground">
                  {onboardingDone
                    ? "A Stripe está a validar os seus dados. Pode demorar alguns minutos."
                    : "A configuração Stripe está incompleta. Conclua o processo no Stripe."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={handleStartOnboarding}
                    disabled={creatingAccount}
                  >
                    {creatingAccount && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Continuar configuração
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleRefreshStatus}
                    disabled={refreshing}
                  >
                    {refreshing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Verificar estado
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Pagamentos ativos
                </Badge>
                <span className="text-sm text-muted-foreground">
                  A receber pedidos de flores.
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleOpenDashboard}
                  disabled={openingDashboard}
                >
                  {openingDashboard ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Aceder ao dashboard Stripe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                A faturação ao cliente final é da sua responsabilidade. O Stripe envia
                um recibo automático mas <strong>não substitui fatura legal</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}