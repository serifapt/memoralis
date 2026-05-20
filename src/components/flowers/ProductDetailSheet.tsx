import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, Flower2 } from "lucide-react";
import type { FlowerProduct } from "@/hooks/useFlowerService";

interface ProductDetailSheetProps {
  product: FlowerProduct | null;
  initialQuantity?: number;
  inCart: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  onRemove?: () => void;
}

export function ProductDetailSheet({
  product,
  initialQuantity = 1,
  inCart,
  onClose,
  onConfirm,
  onRemove,
}: ProductDetailSheetProps) {
  const [qty, setQty] = useState(initialQuantity);

  useEffect(() => {
    if (product) setQty(initialQuantity || 1);
  }, [product, initialQuantity]);

  return (
    <Sheet open={!!product} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[92vh] sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:mx-auto rounded-t-2xl sm:rounded-2xl p-0 flex flex-col"
      >
        {product && (
          <>
            <SheetHeader className="px-4 pt-4 pb-2 text-left">
              <SheetTitle className="font-archivo">{product.name}</SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full aspect-square object-cover rounded-xl"
                />
              ) : (
                <div className="w-full aspect-square rounded-xl bg-muted flex items-center justify-center">
                  <Flower2 className="w-16 h-16 text-muted-foreground/50" />
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div>
                  {product.category && (
                    <Badge variant="secondary" className="mb-1">{product.category}</Badge>
                  )}
                  <p className="text-2xl font-bold text-primary">
                    {product.price.toFixed(2)} €
                  </p>
                </div>
              </div>

              {(product.full_description || product.short_description) && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.full_description || product.short_description}
                </p>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <Label className="text-sm">Quantidade</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-lg">{qty}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setQty(qty + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between text-sm pt-1">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{(product.price * qty).toFixed(2)} €</span>
              </div>
            </div>

            <div className="border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2">
              <Button className="w-full" size="lg" onClick={() => onConfirm(qty)}>
                {inCart ? "Atualizar no pedido" : "Adicionar ao pedido"}
              </Button>
              {inCart && onRemove && (
                <Button variant="ghost" className="w-full text-destructive hover:text-destructive" onClick={onRemove}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover do pedido
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}