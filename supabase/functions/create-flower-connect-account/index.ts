import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: unknown) =>
  console.log(`[CREATE-FLOWER-CONNECT] ${s}${d ? ` ${JSON.stringify(d)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !userData.user) throw new Error("Authentication failed");
    const user = userData.user;

    // Find funeraria the user has admin access to
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: membership } = await admin
      .from("funeraria_members")
      .select("funeraria_id, role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    let funerariaId = membership?.funeraria_id ?? null;
    if (!funerariaId) {
      const { data: own } = await admin
        .from("funerarias")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      funerariaId = own?.id ?? null;
    }
    if (!funerariaId) throw new Error("No funeraria found for user");

    const { data: funeraria, error: fErr } = await admin
      .from("funerarias")
      .select("id, nome_comercial, email, stripe_account_id")
      .eq("id", funerariaId)
      .maybeSingle();
    if (fErr || !funeraria) throw new Error("Funeraria not found");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://memoralis.pt";

    let accountId = funeraria.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "PT",
        email: funeraria.email || user.email || undefined,
        business_type: "company",
        business_profile: {
          name: funeraria.nome_comercial,
          mcc: "5992", // Florists
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { funeraria_id: funeraria.id },
      });
      accountId = account.id;

      await admin
        .from("funerarias")
        .update({ stripe_account_id: accountId })
        .eq("id", funeraria.id);

      log("Created Stripe account", { accountId });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/settings?tab=flores&stripe=refresh`,
      return_url: `${origin}/settings?tab=flores&stripe=return`,
      type: "account_onboarding",
    });

    return new Response(JSON.stringify({ url: accountLink.url, account_id: accountId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});