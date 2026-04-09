import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { FlowerProductCard } from "@/components/flowers/FlowerProductCard";
import { usePublicFlowerProducts, usePlatformConfig, type FlowerProduct } from "@/hooks/useFlowerService";
import { isFlowerOrderOpen, type CeremonyEvent } from "@/lib/ceremony-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import obituaryPlaceholder from "@/assets/obituary-placeholder.jpg";
import {
  Home, ChevronRight, MapPin, Flower2, Loader2,
  Minus, Plus, Check, ArrowLeft, ArrowRight, X,
} from "lucide-react";

const orderSchema = z.object({
  sender_name: z.string().min(1, "Nome é obrigatório"),
  sender_email: z.string().email("Email inválido").optional().or(z.literal("")),
  sender_phone: z.string().optional(),
  message: z.string().max(500, "Mensagem muito longa").optional(),
  observations: z.string().optional(),
});
type OrderFormValues = z.infer<typeof orderSchema>;

interface ObituaryData {
  id: string;
  display_name: string;
  birth_date: string | null;
  death_date: string | null;
  locality: string | null;
  freguesia: string | null;
  photo_url: string | null;
  funeraria_id: string;
}

interface FunerariaData {
  id: string;
  nome_comercial: string;
  servico_flores_ativo: boolean;
  flores_limite_horas: number;
}

function getYear(d: string | null) {
  if (!d) return "—";
  try { return new Date(d).getFullYear().toString(); } catch { return "—"; }
}

export default function ObituaryFlowers() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [obituary, setObituary] = useState<ObituaryData | null>(null);
  const [funeraria, setFuneraria] = useState<FunerariaData | null>(null);
  const [events, setEvents] = useState<CeremonyEvent[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<FlowerProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const { data: products, isLoading: productsLoading } = usePublicFlowerProducts(funeraria?.id);
  const { data: commissionConfig } = usePlatformConfig("flower_commission_percent");
  const commissionPercent = parseFloat(commissionConfig || "10");

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { sender_name: "", sender_email: "", sender_phone: "", message: "", observations: "" },
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data: obit } = await supabase
        .from("obituaries")
        .select("id, display_name, birth_date, death_date, locality, freguesia, photo_url, funeraria_id")
        .eq("id", id)
        .eq("is_public", true)
        .maybeSingle();

      if (!obit) { navigate(`/obituario/${id}`, { replace: true }); return; }
      setObituary(obit);

      const [funRes, evRes] = await Promise.all([
        supabase.from("funerarias").select("id, nome_comercial, servico_flores_ativo, flores_limite_horas").eq("id", obit.funeraria_id).maybeSingle(),
        supabase.from("ceremony_events").select("event_type, event_date, event_time, location").eq("obituary_id", obit.id),
      ]);
      setFuneraria(funRes.data);
      setEvents(evRes.data || []);

      // Check if flowers are open
      if (!funRes.data?.servico_flores_ativo || !isFlowerOrderOpen(evRes.data || [], funRes.data?.flores_limite_horas ?? 4)) {
        navigate(`/obituario/${id}`, { replace: true });
        return;
      }
      setLoading(false);
    })();
  }, [id]);

  const { subtotal, commissionValue, total } = useMemo(() => {
    if (!selectedProduct) return { subtotal: 0, commissionValue: 0, total: 0 };
    const sub = selectedProduct.price * quantity;
    const comm = (sub * commissionPercent) / 100;
    return { subtotal: sub, commissionValue: comm, total: sub + comm };
  }, [selectedProduct, quantity, commissionPercent]);

  const onSubmit = async (values: OrderFormValues) => {
    if (!selectedProduct || !obituary || !funeraria) return;
    setIsSubmitting(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from("flower_orders")
        .insert({
          obituary_id: obituary.id,
          funeraria_id: funeraria.id,
          sender_name: values.sender_name,
          sender_email: values.sender_email || null,
          sender_phone: values.sender_phone || null,
          message: values.message || null,
          observations: values.observations || null,
          subtotal, commission_percent: commissionPercent, commission_value: commissionValue, total,
          status: "PENDENTE",
        })
        .select()
        .single();
      if (orderError) throw orderError;

      const { error: itemError } = await supabase.from("flower_order_items").insert({
        order_id: order.id,
        product_id: selectedProduct.id,
        product_name_snapshot: selectedProduct.name,
        product_price_snapshot: selectedProduct.price,
        quantity,
        line_total: subtotal,
      });
      if (itemError) throw itemError;

      setOrderComplete(true);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Erro ao criar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const locationStr = [obituary?.freguesia, obituary?.locality].filter(Boolean).join(" - ");

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="container mx-auto px-4 py-8"><Skeleton className="h-96 w-full" /></div>
      </div>
    );
  }

  if (!obituary || !funeraria) return null;

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="container mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-archivo font-bold text-foreground">Pedido Confirmado!</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            O seu pedido foi recebido com sucesso. A funerária entrará em contacto consigo em breve para confirmar os detalhes da entrega.
          </p>
          <Button asChild>
            <Link to={`/obituario/${obituary.id}`}>Voltar ao Obituário</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-primary flex items-center gap-1"><Home className="w-4 h-4" />Início</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link to="/obituario" className="text-muted-foreground hover:text-primary">Obituário</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link to={`/obituario/${obituary.id}`} className="text-muted-foreground hover:text-primary">{obituary.display_name}</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">Enviar Flores</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Obituary Summary */}
        <Card className="mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <img
                src={obituary.photo_url || obituaryPlaceholder}
                alt={obituary.display_name}
                className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-lg"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-archivo font-bold text-foreground">{obituary.display_name}</h1>
                <p className="text-sm text-muted-foreground">
                  {getYear(obituary.birth_date)} - {getYear(obituary.death_date)}
                </p>
                {locationStr && (
                  <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs">{locationStr}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Product Catalog */}
          <div>
            <h2 className="text-xl font-archivo font-semibold text-foreground mb-6 flex items-center gap-2">
              <Flower2 className="w-5 h-5 text-primary" />
              Catálogo de Flores
            </h2>

            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <FlowerProductCard
                    key={product.id}
                    product={product}
                    onClick={() => { setSelectedProduct(product); setQuantity(1); }}
                    selected={selectedProduct?.id === product.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Flower2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum produto disponível de momento.</p>
              </div>
            )}
          </div>

          {/* Product Detail & Order Form (sidebar) */}
          <div>
            {selectedProduct ? (
              <Card className="sticky top-4">
                <CardContent className="p-6 space-y-5">
                  {/* Product Detail */}
                  {selectedProduct.image_url && (
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{selectedProduct.name}</h3>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSelectedProduct(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    {selectedProduct.category && (
                      <span className="text-xs text-muted-foreground">{selectedProduct.category}</span>
                    )}
                    <p className="text-xl font-bold text-primary mt-1">{selectedProduct.price.toFixed(2)} €</p>
                  </div>
                  {selectedProduct.full_description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedProduct.full_description}</p>
                  )}
                  {!selectedProduct.full_description && selectedProduct.short_description && (
                    <p className="text-sm text-muted-foreground">{selectedProduct.short_description}</p>
                  )}

                  {/* Quantity */}
                  <div className="flex items-center gap-3">
                    <Label className="text-sm">Quantidade:</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="w-4 h-4" /></Button>
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(quantity + 1)}><Plus className="w-4 h-4" /></Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Order Form */}
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <h4 className="font-semibold text-foreground">Os seus dados</h4>
                    <div>
                      <Label htmlFor="sender_name">Nome *</Label>
                      <Input id="sender_name" {...form.register("sender_name")} placeholder="O seu nome" />
                      {form.formState.errors.sender_name && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.sender_name.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="sender_email">Email</Label>
                        <Input id="sender_email" type="email" {...form.register("sender_email")} placeholder="email@exemplo.com" />
                      </div>
                      <div>
                        <Label htmlFor="sender_phone">Telefone</Label>
                        <Input id="sender_phone" {...form.register("sender_phone")} placeholder="+351..." />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="message">Mensagem de Condolências (opcional)</Label>
                      <Textarea id="message" {...form.register("message")} placeholder="Sentidas condolências..." rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="observations">Observações (opcional)</Label>
                      <Textarea id="observations" {...form.register("observations")} placeholder="Notas adicionais..." rows={2} />
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{subtotal.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxa de serviço ({commissionPercent}%)</span>
                        <span>{commissionValue.toFixed(2)} €</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-base">
                        <span>Total</span>
                        <span className="text-primary">{total.toFixed(2)} €</span>
                      </div>
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />A processar...</>
                      ) : (
                        <><Check className="w-4 h-4 mr-2" />Confirmar Pedido</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Flower2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Selecione um produto do catálogo para ver os detalhes e fazer o seu pedido.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
