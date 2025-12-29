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
  sender_email: z.string().email("Email inválido").optional().or(z.literal("")),
  sender_phone: z.string().optional(),
  message: z.string().max(500, "Mensagem muito longa").optional(),
  observations: z.string().optional(),
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
  const [orderComplete, setOrderComplete] = useState(false);

  const { data: products, isLoading } = usePublicFlowerProducts(funerariaId);
  const { data: commissionConfig } = usePlatformConfig("flower_commission_percent");

  const commissionPercent = parseFloat(commissionConfig || "10");

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
    const comm = (sub * commissionPercent) / 100;
    return {
      subtotal: sub,
      commissionValue: comm,
      total: sub + comm,
    };
  }, [selectedProduct, quantity, commissionPercent]);

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
      // Create order
      const orderData = {
        obituary_id: obituaryId,
        funeraria_id: funerariaId,
        sender_name: values.sender_name,
        sender_email: values.sender_email || null,
        sender_phone: values.sender_phone || null,
        message: values.message || null,
        observations: values.observations || null,
        subtotal,
        commission_percent: commissionPercent,
        commission_value: commissionValue,
        total,
        status: "PENDENTE",
      };

      const { data: order, error: orderError } = await supabase
        .from("flower_orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order item
      const itemData = {
        order_id: order.id,
        product_id: selectedProduct.id,
        product_name_snapshot: selectedProduct.name,
        product_price_snapshot: selectedProduct.price,
        quantity,
        line_total: subtotal,
      };

      const { error: itemError } = await supabase
        .from("flower_order_items")
        .insert(itemData);

      if (itemError) throw itemError;

      setOrderComplete(true);
      setStep("confirmation");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Erro ao criar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("catalog");
    setSelectedProduct(null);
    setQuantity(1);
    setOrderComplete(false);
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
                  Taxa de serviço ({commissionPercent}%)
                </span>
                <span>{commissionValue.toFixed(2)} €</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
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
                    A processar...
                  </>
                ) : (
                  <>
                    Confirmar Pedido
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === "confirmation" && orderComplete && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Pedido Confirmado!
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              O seu pedido foi recebido com sucesso. A funerária entrará em contacto
              consigo em breve para confirmar os detalhes da entrega.
            </p>
            <Button onClick={handleClose} className="bg-primary hover:bg-primary/90">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
