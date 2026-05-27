import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: unknown) =>
  console.log(`[CARE-SIGNUP] ${s}`, d ? JSON.stringify(d) : "");

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
    billing_period: "monthly" | "yearly";
    commemorative_dates?: Array<{ type: string; date?: string; note?: string; label?: string }>;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = (await req.json()) as Payload;
    if (!body?.personal?.name || !body?.personal?.email) throw new Error("Faltam dados pessoais");
    if (!body?.grave?.cemetery_name) throw new Error("Falta indicar o cemitério");
    if (!body?.plan?.care_plan_id || !body?.plan?.billing_period) throw new Error("Falta o plano");

    const email = body.personal.email.trim().toLowerCase();
    const billing = body.plan.billing_period === "yearly" ? "yearly" : "monthly";

    // 1. Get or create auth user (passwordless; will set password via email link later)
    let userId: string | null = null;
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const found = list?.users?.find((u) => (u.email ?? "").toLowerCase() === email);
    if (found) {
      userId = found.id;
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          name: body.personal.name,
          phone: body.personal.phone ?? null,
          source: "care_signup",
        },
      });
      if (createErr) throw new Error(`Não foi possível criar conta: ${createErr.message}`);
      userId = created.user!.id;
    }
    log("user", { userId });

    // 2. Upsert customer linked to auth user
    let customerId: string;
    const { data: existing } = await admin
      .from("customers")
      .select("id")
      .eq("user_id", userId!)
      .maybeSingle();
    if (existing) {
      customerId = existing.id;
      await admin
        .from("customers")
        .update({
          name: body.personal.name,
          email,
          phone: body.personal.phone ?? null,
        })
        .eq("id", customerId);
    } else {
      const { data: ins, error: insErr } = await admin
        .from("customers")
        .insert({
          user_id: userId!,
          name: body.personal.name,
          email,
          phone: body.personal.phone ?? null,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      customerId = ins.id;
    }

    // Ensure customer role
    await admin.from("user_roles").upsert(
      { user_id: userId!, role: "customer" },
      { onConflict: "user_id,role", ignoreDuplicates: true },
    );

    // 3. Memorial location
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

    // 4. Pre-create subscription row (pending_payment) so webhook can match by metadata.subscription_id
    const { data: subRow, error: subErr } = await admin
      .from("care_subscriptions")
      .insert({
        customer_id: customerId,
        memorial_location_id: loc.id,
        care_plan_id: body.plan.care_plan_id,
        billing_period: billing,
        status: "pending_payment",
        commemorative_dates: body.plan.commemorative_dates ?? [],
      })
      .select("id")
      .single();
    if (subErr) throw subErr;

    // 5. Look up plan + price (monthly base)
    const { data: plan } = await admin
      .from("care_plans")
      .select("name, code")
      .eq("id", body.plan.care_plan_id)
      .maybeSingle();
    const { data: price } = await admin
      .from("care_plan_prices")
      .select("amount, currency, stripe_price_id")
      .eq("care_plan_id", body.plan.care_plan_id)
      .eq("billing_period", "monthly")
      .eq("active", true)
      .maybeSingle();
    if (!price) throw new Error("Plano sem preço configurado");

    const currency = (price.currency ?? "eur").toLowerCase();
    const monthlyCents = Math.round(Number(price.amount) * 100);
    const interval: "month" | "year" = billing === "yearly" ? "year" : "month";
    const unitAmount = billing === "yearly" ? Math.round(monthlyCents * 12 * 0.9) : monthlyCents;

    const origin = req.headers.get("origin") || "https://memoralis.pt";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: unitAmount,
            recurring: { interval },
            product_data: {
              name: `Memoralis Care — ${plan?.name ?? "Plano"}`,
              description:
                billing === "yearly"
                  ? "Subscrição anual (–10%)"
                  : "Subscrição mensal",
            },
          },
        },
      ],
      success_url: `${origin}/account/care?welcome=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/care/aderir?canceled=1`,
      metadata: {
        customer_id: customerId,
        memorial_location_id: loc.id,
        care_plan_id: body.plan.care_plan_id,
        billing_period: billing,
        subscription_id: subRow.id,
        user_id: userId!,
      },
      subscription_data: {
        metadata: {
          customer_id: customerId,
          memorial_location_id: loc.id,
          care_plan_id: body.plan.care_plan_id,
          billing_period: billing,
          subscription_id: subRow.id,
          user_id: userId!,
        },
      },
    });

    log("checkout created", { sessionId: session.id, sub: subRow.id });

    return new Response(
      JSON.stringify({ checkout_url: session.url, subscription_id: subRow.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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