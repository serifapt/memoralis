import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, Flower2, ArrowRight } from "lucide-react";
import type { FlowerProduct } from "@/hooks/useFlowerService";

export type CartItem = { product: FlowerProduct; quantity: number };

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  subtotal: number;
  commissionValue: number;
  commissionPercent: number;
  total: number;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onEdit: (product: FlowerProduct) => void;
  onContinue: () => void;
}

export function CartSheet({
  open,
  onOpenChange,
  items,
  subtotal,
  commissionValue,
  commissionPercent,
  total,
  onUpdateQty,
  onRemove,
  onEdit,
  onContinue,
}: CartSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[92vh] sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:mx-auto rounded-t-2xl sm:rounded-2xl p-0 flex flex-col"
      >
        <SheetHeader className="px-4 pt-4 pb-2 text-left">
          <SheetTitle className="font-archivo">O seu pedido</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Flower2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">O seu pedido está vazio.</p>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-3 p-3 rounded-lg border bg-card">
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="shrink-0"
                  aria-label={`Editar ${product.name}`}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                      <Flower2 className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="text-left w-full"
                  >
                    <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.price.toFixed(2)} € / unidade
                    </p>
                  </button>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQty(product.id, Math.max(1, quantity - 1))}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQty(product.id, quantity + 1)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {(product.price * quantity).toFixed(2)} €
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemove(product.id)}
                        aria-label="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de serviço</span>
                <span>{commissionValue.toFixed(2)} €</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-primary">{total.toFixed(2)} €</span>
              </div>
            </div>
            <Button size="lg" className="w-full" onClick={onContinue}>
              Continuar para os seus dados
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}