import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: userData } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (!userData.user) throw new Error("Not authenticated");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: membership } = await admin
      .from("funeraria_members")
      .select("funeraria_id")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    let funerariaId = membership?.funeraria_id ?? null;
    if (!funerariaId) {
      const { data: own } = await admin
        .from("funerarias")
        .select("id")
        .eq("user_id", userData.user.id)
        .maybeSingle();
      funerariaId = own?.id ?? null;
    }

    const { data: funeraria } = await admin
      .from("funerarias")
      .select("stripe_account_id")
      .eq("id", funerariaId)
      .maybeSingle();

    if (!funeraria?.stripe_account_id) throw new Error("Stripe account not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const link = await stripe.accounts.createLoginLink(funeraria.stripe_account_id);

    return new Response(JSON.stringify({ url: link.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});