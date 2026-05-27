import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const url: string | undefined = body?.url;
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL em falta" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Follow redirects (share.google / maps.app.goo.gl → full maps URL)
    let finalUrl = url;
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 (Memoralis/1.0)" },
      });
      finalUrl = res.url || url;
    } catch (_) {
      // ignore — try parsing original URL anyway
    }

    const decoded = decodeURIComponent(finalUrl);

    // 2) Extract name from /place/<name>/ segment
    let name: string | null = null;
    const placeMatch = decoded.match(/\/place\/([^/@?]+)/);
    if (placeMatch) {
      name = placeMatch[1].replace(/\+/g, " ").trim();
    }

    // 3) Extract coordinates — try !3d/!4d (most precise), then @lat,lng
    let lat: number | null = null;
    let lng: number | null = null;
    const data3d = decoded.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (data3d) {
      lat = parseFloat(data3d[1]);
      lng = parseFloat(data3d[2]);
    } else {
      const atMatch = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        lat = parseFloat(atMatch[1]);
        lng = parseFloat(atMatch[2]);
      }
    }

    if (lat == null || lng == null) {
      return new Response(JSON.stringify({
        error: "Não foi possível extrair coordenadas do link. Cole um link do Google Maps com localização.",
      }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 4) Reverse geocode via OpenStreetMap Nominatim
    let morada = "";
    let freguesia = "";
    let municipio = "";
    let postcode = "";
    let rawAddress: Record<string, unknown> = {};
    try {
      const nom = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=pt`,
        { headers: { "User-Agent": "Memoralis/1.0 (admin@memoralis.pt)" } },
      );
      if (nom.ok) {
        const j = await nom.json();
        const a = (j?.address ?? {}) as Record<string, string>;
        rawAddress = a;
        const road = a.road || a.pedestrian || a.footway || "";
        const house = a.house_number ? `, ${a.house_number}` : "";
        morada = (road + house).trim();
        freguesia = a.suburb || a.village || a.hamlet || a.neighbourhood || a.city_district || "";
        municipio = a.city || a.town || a.municipality || a.county || "";
        postcode = a.postcode || "";
      }
    } catch (_) {
      // soft-fail; client just gets name + coords
    }

    return new Response(JSON.stringify({
      name, lat, lng, morada, freguesia, municipio, postcode,
      raw_address: rawAddress, final_url: finalUrl,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("import-google-maps-place error", err);
    return new Response(JSON.stringify({ error: (err as Error).message || "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});