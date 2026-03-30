import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { getFunerariaImage } from "@/lib/funeraria-utils";

export interface FunerariaCardData {
  id: string;
  nome_comercial: string;
  localidade: string | null;
  distrito: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  slug: string | null;
}

export interface FunerariaStats {
  avg_rating: number;
  review_count: number;
  view_count: number;
}

interface Props {
  funeraria: FunerariaCardData;
  stats?: FunerariaStats;
}

export function PublicFunerariaCard({ funeraria, stats }: Props) {
  return (
    <Link to={`/funerarias/${funeraria.slug || funeraria.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="relative">
          <img
            src={getFunerariaImage(funeraria.cover_image_url, funeraria.logo_url)}
            alt={funeraria.nome_comercial}
            className="w-full aspect-[4/3] object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
        <CardContent className="p-4 space-y-1.5 flex flex-col flex-1">
          <h3 className="font-archivo font-bold text-foreground text-lg leading-tight">
            {funeraria.nome_comercial}
          </h3>

          {stats && stats.review_count > 0 && (
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {stats.avg_rating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({stats.review_count})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto pt-1">
            {funeraria.localidade ? (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="text-sm truncate">{funeraria.localidade}</span>
              </div>
            ) : (
              <span />
            )}
            {stats && stats.view_count > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                <Eye className="w-3.5 h-3.5" />
                <span className="text-xs">{stats.view_count}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
