import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// Fix Leaflet default icon paths
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export interface Cemetery {
  id: string;
  nome: string;
  municipio: string;
  morada: string | null;
  lat: number | null;
  lng: number | null;
}

function FlyTo({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.flyTo(pos, 15, { duration: 1 });
  }, [pos, map]);
  return null;
}

export function CemeteryMap({ cemeteries }: { cemeteries: Cemetery[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cemeteries;
    return cemeteries.filter(
      (c) => c.nome.toLowerCase().includes(q) || c.municipio.toLowerCase().includes(q),
    );
  }, [cemeteries, query]);

  const selectedPos = useMemo<[number, number] | null>(() => {
    const c = cemeteries.find((x) => x.id === selected);
    return c && c.lat != null && c.lng != null ? [Number(c.lat), Number(c.lng)] : null;
  }, [cemeteries, selected]);

  const center: [number, number] = [39.5, -8.0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar cemitério ou localidade"
            className="pl-9 h-12 text-base"
          />
        </div>
        <div className="max-h-[450px] overflow-y-auto rounded-lg border border-border divide-y divide-border">
          {filtered.length === 0 && (
            <div className="p-6 text-center text-muted-foreground text-sm">
              Sem resultados. Tente outra pesquisa.
            </div>
          )}
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={cn(
                "w-full text-left p-4 transition-colors flex gap-3 items-start",
                selected === c.id ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{c.nome}</div>
                <div className={cn("text-sm truncate", selected === c.id ? "opacity-90" : "text-muted-foreground")}>
                  {c.municipio}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="h-[500px] rounded-lg overflow-hidden border border-border">
        <MapContainer center={center} zoom={6} style={{ width: "100%", height: "100%" }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyTo pos={selectedPos} />
          {cemeteries
            .filter((c) => c.lat != null && c.lng != null)
            .map((c) => (
              <Marker key={c.id} position={[Number(c.lat), Number(c.lng)]} icon={icon} eventHandlers={{ click: () => setSelected(c.id) }}>
                <Popup>
                  <div className="font-semibold">{c.nome}</div>
                  <div className="text-sm text-muted-foreground">{c.morada || c.municipio}</div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}