import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

interface CartFabProps {
  count: number;
  total: number;
  onClick: () => void;
}

export function CartFab({ count, total, onClick }: CartFabProps) {
  if (count <= 0) return null;
  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none">
      <Button
        onClick={onClick}
        size="lg"
        className="w-full h-14 shadow-2xl pointer-events-auto rounded-full justify-between px-5"
        aria-label={`Ver pedido com ${count} ${count === 1 ? "item" : "itens"}`}
      >
        <span className="flex items-center gap-3">
          <span className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-primary-foreground text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {count}
            </span>
          </span>
          <span className="font-semibold">Ver pedido</span>
        </span>
        <span className="font-bold">{total.toFixed(2)} €</span>
      </Button>
    </div>
  );
}