import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { useCarePlans, CarePlanWithPrices } from "@/hooks/useCareService";

export default function CarePlans() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const { data: plans, isLoading } = useCarePlans();

  const getPrice = (plan: CarePlanWithPrices) => {
    const price = plan.prices.find(p => p.billing_period === billingPeriod);
    return price ? price.amount : 0;
  };

  const getPriceId = (plan: CarePlanWithPrices) => {
    const price = plan.prices.find(p => p.billing_period === billingPeriod);
    return price?.id;
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getAnnualSavings = (plan: CarePlanWithPrices) => {
    const monthly = plan.prices.find(p => p.billing_period === 'monthly');
    const annual = plan.prices.find(p => p.billing_period === 'annual');
    if (monthly && annual) {
      const savings = (monthly.amount * 12) - annual.amount;
      return savings > 0 ? savings : 0;
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/care" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Escolha o Seu Plano</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Selecione o plano que melhor se adapta às suas necessidades. 
            Todos os planos incluem relatório fotográfico após cada visita.
          </p>

          <Tabs value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as 'monthly' | 'annual')} className="inline-flex">
            <TabsList>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="annual">
                Anual
                <Badge variant="secondary" className="ml-2 text-xs">-17%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans?.map((plan, index) => {
            const isPopular = plan.code === 'HOMENAGEM';
            const priceId = getPriceId(plan);
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Mais Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="h-12">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{formatPrice(getPrice(plan))}</span>
                    <span className="text-muted-foreground">/{billingPeriod === 'monthly' ? 'mês' : 'ano'}</span>
                    
                    {billingPeriod === 'annual' && getAnnualSavings(plan) > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Poupa {formatPrice(getAnnualSavings(plan))}/ano
                      </p>
                    )}
                  </div>

                  <ul className="text-left space-y-3 mb-6">
                    {(plan.includes_json || []).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={isPopular ? "default" : "outline"}
                    asChild
                  >
                    <Link to={`/care/checkout?plan=${priceId}`}>
                      Selecionar
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Todos os planos podem ser cancelados a qualquer momento.</p>
          <p className="mt-1">Pagamento seguro processado por Stripe.</p>
        </div>
      </div>
    </div>
  );
}
