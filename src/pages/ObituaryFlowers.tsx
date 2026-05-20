import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { FlowerProductCard } from "@/components/flowers/FlowerProductCard";
import { ProductDetailSheet } from "@/components/flowers/ProductDetailSheet";
import { CartSheet, type CartItem } from "@/components/flowers/CartSheet";
import { CartFab } from "@/components/flowers/CartFab";
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
  Check, ArrowLeft, ShoppingBag, Pencil,
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

  const [cart, setCart] = useState<CartItem[]>([]);
  const [detailProduct, setDetailProduct] = useState<FlowerProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep] = useState<"catalog" | "checkout">("catalog");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const { data: products, isLoading: productsLoading } = usePublicFlowerProducts(funeraria?.id);
  const { data: pctConfig } = usePlatformConfig("flowers_commission_percent");
  const { data: minConfig } = usePlatformConfig("flowers_commission_min");
  const { data: maxConfig } = usePlatformConfig("flowers_commission_max");
  const commissionPercent = parseFloat((pctConfig as string) || "10");
  const commissionMin = parseFloat((minConfig as string) || "5");
  const commissionMax = parseFloat((maxConfig as string) || "15");

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

      // DEV: bypass temporário das verificações de servico_flores_ativo / janela de tempo
      // if (!funRes.data?.servico_flores_ativo || !isFlowerOrderOpen(evRes.data || [], funRes.data?.flores_limite_horas ?? 4)) {
      //   navigate(`/obituario/${id}`, { replace: true });
      //   return;
      // }
      setLoading(false);
    })();
  }, [id]);

  const { subtotal, commissionValue, total } = useMemo(() => {
    const sub = cart.reduce((acc, { product, quantity }) => acc + product.price * quantity, 0);
    if (sub <= 0) return { subtotal: 0, commissionValue: 0, total: 0 };
    const raw = (sub * commissionPercent) / 100;
    const comm = Math.min(Math.max(raw, commissionMin), commissionMax);
    return { subtotal: sub, commissionValue: comm, total: sub + comm };
  }, [cart, commissionPercent, commissionMin, commissionMax]);

  const cartCount = cart.reduce((a, c) => a + c.quantity, 0);

  const addOrUpdateItem = (product: FlowerProduct, quantity: number) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, quantity } : i));
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i)));
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const getCartQty = (productId: string) =>
    cart.find((i) => i.product.id === productId)?.quantity ?? 0;

  const onSubmit = async (values: OrderFormValues) => {
    if (cart.length === 0 || !obituary || !funeraria) return;
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

      const itemsPayload = cart.map(({ product, quantity }) => ({
        order_id: order.id,
        product_id: product.id,
        product_name_snapshot: product.name,
        product_price_snapshot: product.price,
        quantity,
        line_total: product.price * quantity,
      }));
      const { error: itemError } = await supabase.from("flower_order_items").insert(itemsPayload);
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
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-primary" />
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

      <div className="container mx-auto px-4 py-8 pb-32 lg:pb-8">
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

        {step === "catalog" ? (
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
                      onClick={() => setDetailProduct(product)}
                      onAdd={() => setDetailProduct(product)}
                      inCartQuantity={getCartQty(product.id)}
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

            {/* Desktop cart sidebar */}
            <aside className="hidden lg:block">
              <Card className="sticky top-4">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-archivo font-semibold flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    O seu pedido {cartCount > 0 && <span className="text-sm text-muted-foreground">({cartCount})</span>}
                  </h3>
                  {cart.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Adicione produtos do catálogo para começar.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                        {cart.map(({ product, quantity }) => (
                          <div key={product.id} className="flex gap-2 items-center text-sm">
                            <button
                              type="button"
                              onClick={() => setDetailProduct(product)}
                              className="flex-1 text-left hover:text-primary truncate"
                            >
                              {quantity}× {product.name}
                            </button>
                            <span className="font-medium shrink-0">{(product.price * quantity).toFixed(2)} €</span>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      <div className="space-y-1.5 text-sm">
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
                      <Button className="w-full" onClick={() => setStep("checkout")}>
                        Continuar
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        ) : (
          // Checkout step
          <div className="max-w-2xl mx-auto">
            <Button variant="ghost" size="sm" onClick={() => setStep("catalog")} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar ao catálogo
            </Button>

            {/* Collapsible cart summary */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <button
                  type="button"
                  onClick={() => setSummaryOpen((o) => !o)}
                  className="w-full flex items-center justify-between gap-3"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    {cartCount} {cartCount === 1 ? "item" : "itens"} no pedido
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-bold text-primary">{total.toFixed(2)} €</span>
                    <span className="text-xs text-muted-foreground underline">
                      {summaryOpen ? "Ocultar" : "Ver detalhes"}
                    </span>
                  </span>
                </button>
                {summaryOpen && (
                  <div className="mt-4 space-y-2 text-sm">
                    {cart.map(({ product, quantity }) => (
                      <div key={product.id} className="flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => setDetailProduct(product)}
                          className="text-left hover:text-primary flex items-center gap-1.5"
                        >
                          {quantity}× {product.name}
                          <Pencil className="w-3 h-3 opacity-50" />
                        </button>
                        <span>{(product.price * quantity).toFixed(2)} €</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span><span>{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Taxa de serviço ({commissionPercent}%)</span><span>{commissionValue.toFixed(2)} €</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <h2 className="font-archivo font-semibold text-lg">Os seus dados</h2>
                  <div>
                    <Label htmlFor="sender_name">Nome *</Label>
                    <Input id="sender_name" {...form.register("sender_name")} placeholder="O seu nome" />
                    {form.formState.errors.sender_name && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.sender_name.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                  <Button type="submit" disabled={isSubmitting || cart.length === 0} className="w-full" size="lg">
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />A processar...</>
                    ) : (
                      <><Check className="w-4 h-4 mr-2" />Confirmar Pedido</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile FAB + Cart Sheet */}
      {step === "catalog" && (
        <CartFab count={cartCount} total={total} onClick={() => setCartOpen(true)} />
      )}
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cart}
        subtotal={subtotal}
        commissionValue={commissionValue}
        commissionPercent={commissionPercent}
        total={total}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onEdit={(p) => { setCartOpen(false); setDetailProduct(p); }}
        onContinue={() => { setCartOpen(false); setStep("checkout"); }}
      />

      <ProductDetailSheet
        product={detailProduct}
        initialQuantity={detailProduct ? getCartQty(detailProduct.id) || 1 : 1}
        inCart={detailProduct ? getCartQty(detailProduct.id) > 0 : false}
        onClose={() => setDetailProduct(null)}
        onConfirm={(q) => {
          if (detailProduct) addOrUpdateItem(detailProduct, q);
          setDetailProduct(null);
        }}
        onRemove={() => {
          if (detailProduct) removeItem(detailProduct.id);
          setDetailProduct(null);
        }}
      />
    </div>
  );
}
