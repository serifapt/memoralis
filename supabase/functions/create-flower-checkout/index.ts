import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: unknown) =>
  console.log(`[CREATE-FLOWER-CHECKOUT] ${s}${d ? ` ${JSON.stringify(d)}` : ""}`);

interface CartItem {
  product_id: string;
  quantity: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const {
      obituary_id,
      funeraria_id,
      items,
      sender_name,
      sender_email,
      sender_phone,
      message,
      observations,
      billing,
    } = body as {
      obituary_id: string;
      funeraria_id: string;
      items: CartItem[];
      sender_name: string;
      sender_email: string;
      sender_phone?: string;
      message?: string;
      observations?: string;
      billing?: {
        nif?: string;
        name?: string;
        address?: string;
        postal_code?: string;
        city?: string;
        country?: string;
      };
    };

    if (!obituary_id || !funeraria_id || !items?.length || !sender_name || !sender_email) {
      throw new Error("Missing required fields");
    }

    // Fetch funeraria
    const { data: funeraria, error: fErr } = await admin
      .from("funerarias")
      .select("id, nome_comercial, stripe_account_id, stripe_charges_enabled, servico_flores_ativo")
      .eq("id", funeraria_id)
      .maybeSingle();
    if (fErr || !funeraria) throw new Error("Funeraria not found");
    if (!funeraria.servico_flores_ativo) throw new Error("Serviço de flores inativo");
    if (!funeraria.stripe_charges_enabled || !funeraria.stripe_account_id) {
      throw new Error("Funerária ainda não configurou pagamentos");
    }

    // Fetch products
    const productIds = items.map((i) => i.product_id);
    const { data: products, error: pErr } = await admin
      .from("flower_products")
      .select("id, name, price, is_active, funeraria_id")
      .in("id", productIds);
    if (pErr || !products?.length) throw new Error("Products not found");

    const invalid = products.find(
      (p) => !p.is_active || p.funeraria_id !== funeraria_id
    );
    if (invalid) throw new Error("Invalid product");

    // Load commission config
    const { data: cfg } = await admin
      .from("platform_config")
      .select("key, value")
      .in("key", ["flowers_commission_percent", "flowers_commission_min"]);
    const cfgMap = Object.fromEntries((cfg ?? []).map((c) => [c.key, parseFloat(c.value)]));
    const commissionPercent = cfgMap.flowers_commission_percent ?? 10;
    const commissionMin = cfgMap.flowers_commission_min ?? 5;

    // Calculate
    let subtotal = 0;
    const itemDetails = items.map((it) => {
      const p = products.find((pp) => pp.id === it.product_id)!;
      const lineTotal = Number(p.price) * it.quantity;
      subtotal += lineTotal;
      return { product: p, quantity: it.quantity, lineTotal };
    });
    subtotal = Math.round(subtotal * 100) / 100;
    const rawCommission = (subtotal * commissionPercent) / 100;
    const commissionValue = Math.round(Math.max(rawCommission, commissionMin) * 100) / 100;
    const total = Math.round((subtotal + commissionValue) * 100) / 100;

    // Insert order
    const { data: order, error: oErr } = await admin
      .from("flower_orders")
      .insert({
        obituary_id,
        funeraria_id,
        sender_name,
        sender_email,
        sender_phone: sender_phone || null,
        message: message || null,
        observations: observations || null,
        subtotal,
        commission_percent: commissionPercent,
        commission_value: commissionValue,
        total,
        status: "AGUARDA_PAGAMENTO",
        billing_nif: billing?.nif || null,
        billing_name: billing?.name || null,
        billing_address: billing?.address || null,
        billing_postal_code: billing?.postal_code || null,
        billing_city: billing?.city || null,
        billing_country: billing?.country || "PT",
      })
      .select("id")
      .single();
    if (oErr || !order) throw new Error(`Order insert: ${oErr?.message}`);

    // Insert items
    const itemRows = itemDetails.map((d) => ({
      order_id: order.id,
      product_id: d.product.id,
      product_name_snapshot: d.product.name,
      product_price_snapshot: d.product.price,
      quantity: d.quantity,
      line_total: d.lineTotal,
    }));
    const { error: iErr } = await admin.from("flower_order_items").insert(itemRows);
    if (iErr) throw new Error(`Items insert: ${iErr.message}`);

    // Create Stripe Checkout session
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://memoralis.pt";

    const lineItems = itemDetails.map((d) => ({
      price_data: {
        currency: "eur",
        product_data: { name: d.product.name },
        unit_amount: Math.round(Number(d.product.price) * 100),
      },
      quantity: d.quantity,
    }));

    // Add commission as separate line item so it appears on receipt
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: { name: "Taxa de serviço Memoralis" },
        unit_amount: Math.round(commissionValue * 100),
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: sender_email,
      success_url: `${origin}/obituary/${obituary_id}?flowers=success`,
      cancel_url: `${origin}/obituary/${obituary_id}?flowers=cancelled`,
      payment_intent_data: {
        application_fee_amount: Math.round(commissionValue * 100),
        transfer_data: { destination: funeraria.stripe_account_id },
        metadata: {
          flower_order_id: order.id,
          funeraria_id,
          obituary_id,
        },
      },
      metadata: {
        flower_order_id: order.id,
        funeraria_id,
        obituary_id,
      },
    });

    // Save session id
    await admin
      .from("flower_orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    log("Session created", { sessionId: session.id, orderId: order.id });

    return new Response(JSON.stringify({ url: session.url, order_id: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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