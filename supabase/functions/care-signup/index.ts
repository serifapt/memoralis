import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: unknown) => console.log(`[CARE-SIGNUP] ${s}`, d ? JSON.stringify(d) : "");

interface Payload {
  personal: { name: string; email: string; phone?: string; nif?: string };
  grave: {
    cemetery_id?: string | null;
    cemetery_name: string;
    cemetery_address?: string;
    grave_number?: string;
    section?: string;
    names_on_grave?: string;
    notes?: string;
    reference_photos?: string[];
  };
  plan: {
    care_plan_id: string;
    billing_period: string; // monthly | yearly
    commemorative_dates?: Array<{ type: string; date?: string; note?: string }>;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const stripeEnabled = !!Deno.env.get("STRIPE_SECRET_KEY");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(url, serviceKey);

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) throw new Error("Not authenticated");
    const user = userData.user;

    const body = (await req.json()) as Payload;
    if (!body?.personal?.name || !body?.personal?.email) throw new Error("Missing personal info");
    if (!body?.grave?.cemetery_name) throw new Error("Missing cemetery");
    if (!body?.plan?.care_plan_id || !body?.plan?.billing_period) throw new Error("Missing plan");

    log("user", { id: user.id, email: user.email });

    // 1. upsert customer
    let customerId: string;
    const { data: existing } = await admin
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      customerId = existing.id;
      await admin
        .from("customers")
        .update({
          name: body.personal.name,
          email: body.personal.email,
          phone: body.personal.phone ?? null,
        })
        .eq("id", customerId);
    } else {
      const { data: ins, error: insErr } = await admin
        .from("customers")
        .insert({
          user_id: user.id,
          name: body.personal.name,
          email: body.personal.email,
          phone: body.personal.phone ?? null,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      customerId = ins.id;
    }

    // 2. memorial_location
    const { data: loc, error: locErr } = await admin
      .from("memorial_locations")
      .insert({
        customer_id: customerId,
        cemetery_id: body.grave.cemetery_id ?? null,
        cemetery_name: body.grave.cemetery_name,
        cemetery_address: body.grave.cemetery_address ?? null,
        grave_number: body.grave.grave_number ?? null,
        section: body.grave.section ?? null,
        names_on_grave: body.grave.names_on_grave ?? null,
        notes: body.grave.notes ?? null,
        reference_photos: body.grave.reference_photos ?? [],
      })
      .select("id")
      .single();
    if (locErr) throw locErr;

    // 3. subscription (pending_payment)
    const { data: sub, error: subErr } = await admin
      .from("care_subscriptions")
      .insert({
        customer_id: customerId,
        memorial_location_id: loc.id,
        care_plan_id: body.plan.care_plan_id,
        billing_period: body.plan.billing_period,
        status: stripeEnabled ? "pending_payment" : "pending_activation",
        commemorative_dates: body.plan.commemorative_dates ?? [],
      })
      .select("id")
      .single();
    if (subErr) throw subErr;

    log("created", { customerId, locationId: loc.id, subscriptionId: sub.id, stripeEnabled });

    // 4. fire transactional emails (best-effort; ignore failures)
    try {
      const sendUrl = `${url}/functions/v1/send-transactional-email`;
      await Promise.all([
        fetch(sendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({
            templateName: "care-signup-customer",
            recipientEmail: body.personal.email,
            idempotencyKey: `care-signup-customer-${sub.id}`,
            templateData: { name: body.personal.name },
          }),
        }).catch(() => null),
        fetch(sendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({
            templateName: "care-signup-admin",
            recipientEmail: Deno.env.get("ADMIN_EMAIL") ?? "geral@memoralis.pt",
            idempotencyKey: `care-signup-admin-${sub.id}`,
            templateData: {
              name: body.personal.name,
              email: body.personal.email,
              phone: body.personal.phone ?? "",
              cemetery: body.grave.cemetery_name,
              grave: body.grave.grave_number ?? "",
            },
          }),
        }).catch(() => null),
      ]);
    } catch (e) {
      log("email send failed (non-fatal)", { error: String(e) });
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription_id: sub.id,
        memorial_location_id: loc.id,
        stripe_enabled: stripeEnabled,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});