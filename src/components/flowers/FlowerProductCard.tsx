import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlowerProduct } from "@/hooks/useFlowerService";
import { Flower2, Plus, Check } from "lucide-react";

interface FlowerProductCardProps {
  product: FlowerProduct;
  onClick?: () => void;
  selected?: boolean;
  onAdd?: () => void;
  inCartQuantity?: number;
}

export function FlowerProductCard({
  product,
  onClick,
  selected,
  onAdd,
  inCartQuantity = 0,
}: FlowerProductCardProps) {
  const inCart = inCartQuantity > 0;
  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-lg flex flex-col h-full ${
        onClick ? "cursor-pointer" : ""
      } ${
        selected || inCart ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <div className="aspect-square relative bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Flower2 className="w-16 h-16 text-muted-foreground/50" />
          </div>
        )}
        {product.category && (
          <Badge className="absolute top-2 left-2 bg-background/90 text-foreground border-0">
            {product.category}
          </Badge>
        )}
        {inCart && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground border-0 gap-1">
            <Check className="w-3 h-3" /> {inCartQuantity}
          </Badge>
        )}
        {!product.is_active && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-muted-foreground font-medium">Indisponível</span>
          </div>
        )}
      </div>
      <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {product.short_description}
          </p>
        )}
        <p className="text-lg font-bold text-primary mt-auto">
          {product.price.toFixed(2)} €
        </p>
        {onAdd && (
          <Button
            type="button"
            size="sm"
            variant={inCart ? "secondary" : "default"}
            className="w-full mt-3"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
          >
            {inCart ? (
              <><Check className="w-4 h-4 mr-1.5" />No pedido</>
            ) : (
              <><Plus className="w-4 h-4 mr-1.5" />Adicionar</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
