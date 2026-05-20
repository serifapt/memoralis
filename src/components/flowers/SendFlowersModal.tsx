import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlowerProductCard } from "./FlowerProductCard";
import {
  FlowerProduct,
  usePublicFlowerProducts,
  usePlatformConfig,
} from "@/hooks/useFlowerService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  Flower2,
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  Plus,
} from "lucide-react";

const orderSchema = z.object({
  sender_name: z.string().min(1, "Nome é obrigatório"),
  sender_email: z.string().email("Email inválido"),
  sender_phone: z.string().optional(),
  message: z.string().max(500, "Mensagem muito longa").optional(),
  observations: z.string().optional(),
  want_invoice: z.boolean().optional(),
  billing_nif: z.string().optional(),
  billing_name: z.string().optional(),
  billing_address: z.string().optional(),
  billing_postal_code: z.string().optional(),
  billing_city: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface SendFlowersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funerariaId: string;
  obituaryId: string;
  obituaryName: string;
}

type Step = "catalog" | "details" | "confirmation";

export function SendFlowersModal({
  open,
  onOpenChange,
  funerariaId,
  obituaryId,
  obituaryName,
}: SendFlowersModalProps) {
  const [step, setStep] = useState<Step>("catalog");
  const [selectedProduct, setSelectedProduct] = useState<FlowerProduct | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wantInvoice, setWantInvoice] = useState(false);

  const { data: products, isLoading } = usePublicFlowerProducts(funerariaId);
  const { data: pctConfig } = usePlatformConfig("flowers_commission_percent");
  const { data: minConfig } = usePlatformConfig("flowers_commission_min");
  const { data: maxConfig } = usePlatformConfig("flowers_commission_max");

  const commissionPercent = parseFloat(pctConfig || "10");
  const commissionMin = parseFloat(minConfig || "5");
  const commissionMax = parseFloat(maxConfig || "15");

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      sender_name: "",
      sender_email: "",
      sender_phone: "",
      message: "",
      observations: "",
    },
  });

  const { subtotal, commissionValue, total } = useMemo(() => {
    if (!selectedProduct) return { subtotal: 0, commissionValue: 0, total: 0 };
    const sub = selectedProduct.price * quantity;
    const raw = (sub * commissionPercent) / 100;
    const comm = Math.min(Math.max(raw, commissionMin), commissionMax);
    return {
      subtotal: sub,
      commissionValue: comm,
      total: sub + comm,
    };
  }, [selectedProduct, quantity, commissionPercent, commissionMin, commissionMax]);

  const handleProductSelect = (product: FlowerProduct) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleContinue = () => {
    if (step === "catalog" && selectedProduct) {
      setStep("details");
    }
  };

  const handleBack = () => {
    if (step === "details") {
      setStep("catalog");
    }
  };

  const onSubmit = async (values: OrderFormValues) => {
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      const billing = wantInvoice
        ? {
            nif: values.billing_nif || undefined,
            name: values.billing_name || values.sender_name,
            address: values.billing_address || undefined,
            postal_code: values.billing_postal_code || undefined,
            city: values.billing_city || undefined,
            country: "PT",
          }
        : undefined;

      const { data, error } = await supabase.functions.invoke(
        "create-flower-checkout",
        {
          body: {
            obituary_id: obituaryId,
            funeraria_id: funerariaId,
            items: [{ product_id: selectedProduct.id, quantity }],
            sender_name: values.sender_name,
            sender_email: values.sender_email,
            sender_phone: values.sender_phone || undefined,
            message: values.message || undefined,
            observations: values.observations || undefined,
            billing,
          },
        }
      );
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Sessão de pagamento não criada");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      const msg = error instanceof Error ? error.message : "Erro ao criar pedido.";
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("catalog");
    setSelectedProduct(null);
    setQuantity(1);
    setWantInvoice(false);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-primary" />
            Enviar Flores - {obituaryName}
          </DialogTitle>
        </DialogHeader>

        {step === "catalog" && (
          <>
            <ScrollArea className="flex-1 max-h-[60vh]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-1">
                  {products.map((product) => (
                    <FlowerProductCard
                      key={product.id}
                      product={product}
                      onClick={() => handleProductSelect(product)}
                      selected={selectedProduct?.id === product.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Flower2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhum produto disponível de momento.
                  </p>
                </div>
              )}
            </ScrollArea>

            {selectedProduct && (
              <>
                <Separator />
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{selectedProduct.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.price.toFixed(2)} € cada
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button onClick={handleContinue} className="bg-primary hover:bg-primary/90">
                      Continuar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {step === "details" && selectedProduct && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-4 pr-4">
                {/* Order Summary */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{selectedProduct.name}</span>
                    <span>{quantity}x</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct.price.toFixed(2)} € x {quantity} = {subtotal.toFixed(2)} €
                  </p>
                </div>

                {/* Sender Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Os seus dados</h3>
                  <div>
                    <Label htmlFor="sender_name">Nome *</Label>
                    <Input
                      id="sender_name"
                      {...form.register("sender_name")}
                      placeholder="O seu nome"
                    />
                    {form.formState.errors.sender_name && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.sender_name.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="sender_email">Email</Label>
                      <Input
                        id="sender_email"
                        type="email"
                        {...form.register("sender_email")}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sender_phone">Telefone</Label>
                      <Input
                        id="sender_phone"
                        {...form.register("sender_phone")}
                        placeholder="+351..."
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Mensagem de Condolências (opcional)</Label>
                  <Textarea
                    id="message"
                    {...form.register("message")}
                    placeholder="Sentidas condolências..."
                    rows={3}
                  />
                </div>

                {/* Observations */}
                <div>
                  <Label htmlFor="observations">Observações (opcional)</Label>
                  <Textarea
                    id="observations"
                    {...form.register("observations")}
                    placeholder="Notas adicionais..."
                    rows={2}
                  />
                </div>

                {/* Billing details */}
                <div className="border-t pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wantInvoice}
                      onChange={(e) => setWantInvoice(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-sm">
                      Quero fatura (introduzir NIF e dados de faturação)
                    </span>
                  </label>
                  {wantInvoice && (
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="billing_nif">NIF</Label>
                          <Input id="billing_nif" {...form.register("billing_nif")} placeholder="999999999" />
                        </div>
                        <div>
                          <Label htmlFor="billing_name">Nome fiscal</Label>
                          <Input id="billing_name" {...form.register("billing_name")} placeholder="Se diferente" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="billing_address">Morada</Label>
                        <Input id="billing_address" {...form.register("billing_address")} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="billing_postal_code">Código postal</Label>
                          <Input id="billing_postal_code" {...form.register("billing_postal_code")} placeholder="0000-000" />
                        </div>
                        <div>
                          <Label htmlFor="billing_city">Localidade</Label>
                          <Input id="billing_city" {...form.register("billing_city")} />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        A fatura é emitida pela funerária.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            <Separator />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Taxa de serviço Memoralis
                </span>
                <span>{commissionValue.toFixed(2)} €</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total a pagar</span>
                <span className="text-primary">{total.toFixed(2)} €</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    A redirecionar para Stripe...
                  </>
                ) : (
                  <>
                    Pagar com Stripe
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

      </DialogContent>
    </Dialog>
  );
}
