import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Eye, MessageSquare, Flame, Flower2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import obituaryPlaceholder from "@/assets/obituary-placeholder.jpg";
import { SendFlowersModal } from "@/components/flowers/SendFlowersModal";

export interface PublicObituary {
  id: string;
  display_name: string;
  birth_date: string | null;
  death_date: string | null;
  locality: string | null;
  freguesia: string | null;
  photo_url: string | null;
  funeraria_id?: string;
  funerarias: { nome_comercial: string; slug: string | null } | null;
  view_count?: number;
  condolence_count?: number;
  candle_count?: number;
  active_tag?: string | null;
}

function getYear(dateStr: string | null) {
  if (!dateStr) return "—";
  try { return new Date(dateStr).getFullYear().toString(); } catch { return "—"; }
}

function getAge(birth: string | null, death: string | null) {
  if (!birth || !death) return null;
  try {
    const [bY, bM, bD] = birth.split("-").map(Number);
    const [dY, dM, dD] = death.split("-").map(Number);
    let age = dY - bY;
    if (dM < bM || (dM === bM && dD < bD)) age--;
    return age;
  } catch { return null; }
}

export function PublicObituaryCard({ obit }: { obit: PublicObituary }) {
  const navigate = useNavigate();
  const age = getAge(obit.birth_date, obit.death_date);
  const locationStr = [obit.freguesia, obit.locality].filter(Boolean).join(" - ");
  const [showFlowers, setShowFlowers] = useState(false);

  return (
    <>
      <Link to={`/obituario/${obit.id}`}>
        <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          <div className="relative">
            <img
              src={obit.photo_url || obituaryPlaceholder}
              alt={obit.display_name}
              className="w-full aspect-[3/4] object-cover"
            />
            {obit.active_tag && (
              <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-0 text-xs font-medium">
                {obit.active_tag}
              </Badge>
            )}
          </div>
          <CardContent className="p-4 flex flex-col flex-1 space-y-3">
            <div className="flex-1 flex flex-col">
              <h3 className="font-archivo font-bold text-foreground text-lg mb-1 leading-tight">
                {obit.display_name}
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                {getYear(obit.birth_date)} - {getYear(obit.death_date)}{age !== null ? ` | ${age} Anos` : ""}
              </p>
              <div className="flex-1 flex flex-col justify-center">
                {locationStr && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-2">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{locationStr}</span>
                  </div>
                )}
                {obit.funerarias && (
                  <Link
                    to={obit.funerarias.slug ? `/funerarias/${obit.funerarias.slug}` : "#"}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Building2 className="w-3 h-3" />
                    <span className="text-xs hover:underline">{obit.funerarias.nome_comercial}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 sm:h-8 px-1.5 sm:px-2 text-[10px] sm:text-xs min-w-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/obituario/${obit.id}#condolencias`);
                }}
              >
                <span className="truncate">Condolências</span>
              </Button>
              <Button
                size="sm"
                className="flex-1 h-7 sm:h-8 px-1.5 sm:px-2 text-[10px] sm:text-xs min-w-0 bg-primary hover:bg-primary/90"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowFlowers(true);
                }}
              >
                <span className="truncate">Enviar Flores</span>
              </Button>
            </div>

            {/* Counters */}
            <div className="flex items-center justify-between text-muted-foreground border-t border-border pt-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span className="text-xs">{obit.view_count ?? 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-xs">{obit.condolence_count ?? 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-xs">{obit.candle_count ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {obit.funeraria_id && showFlowers && (
        <SendFlowersModal
          open={showFlowers}
          onOpenChange={setShowFlowers}
          funerariaId={obit.funeraria_id}
          obituaryId={obit.id}
          obituaryName={obit.display_name}
        />
      )}
    </>
  );
}
