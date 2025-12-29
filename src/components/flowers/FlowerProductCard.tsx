import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlowerProduct } from "@/hooks/useFlowerService";
import { Flower2 } from "lucide-react";

interface FlowerProductCardProps {
  product: FlowerProduct;
  onClick?: () => void;
  selected?: boolean;
}

export function FlowerProductCard({
  product,
  onClick,
  selected,
}: FlowerProductCardProps) {
  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
        selected ? "ring-2 ring-primary" : ""
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
        {!product.is_active && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-muted-foreground font-medium">Indisponível</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {product.short_description}
          </p>
        )}
        <p className="text-lg font-bold text-primary">
          {product.price.toFixed(2)} €
        </p>
      </CardContent>
    </Card>
  );
}
