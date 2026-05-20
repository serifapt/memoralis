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
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

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

    const { order_id } = await req.json();
    if (!order_id) throw new Error("order_id required");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: order } = await admin
      .from("flower_orders")
      .select("id, funeraria_id, status, stripe_payment_intent_id, subtotal, commission_value, total")
      .eq("id", order_id)
      .maybeSingle();
    if (!order) throw new Error("Order not found");
    if (order.status === "REEMBOLSADO") throw new Error("Já reembolsado");
    if (!order.stripe_payment_intent_id) throw new Error("Sem pagamento associado");

    // Verify caller is admin of this funeraria
    const { data: membership } = await admin
      .from("funeraria_members")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("funeraria_id", order.funeraria_id)
      .maybeSingle();
    let isAdmin = membership?.role === "admin";
    if (!isAdmin) {
      const { data: own } = await admin
        .from("funerarias")
        .select("user_id")
        .eq("id", order.funeraria_id)
        .maybeSingle();
      isAdmin = own?.user_id === userData.user.id;
    }
    if (!isAdmin) throw new Error("Not authorized");

    // Retention config
    const { data: cfg } = await admin
      .from("platform_config")
      .select("value")
      .eq("key", "flowers_refund_fee_retention_percent")
      .maybeSingle();
    const retentionPct = parseFloat(cfg?.value ?? "50");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const totalCents = Math.round(Number(order.total) * 100);
    const feeCents = Math.round(Number(order.commission_value) * 100);
    const feeRetainedCents = Math.round((feeCents * retentionPct) / 100);
    const feeRefundCents = feeCents - feeRetainedCents;
    const customerRefundCents = totalCents - feeRetainedCents;

    // Refund customer, reverse transfer to funeraria for subtotal portion
    const refund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent_id,
      amount: customerRefundCents,
      reverse_transfer: true,
      refund_application_fee: false,
    });

    // Refund part of the application fee back to customer pool
    if (feeRefundCents > 0) {
      // get the charge to find application fee
      const pi = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id, {
        expand: ["latest_charge"],
      });
      const charge = pi.latest_charge as Stripe.Charge | null;
      if (charge?.application_fee) {
        const appFeeId = typeof charge.application_fee === "string"
          ? charge.application_fee
          : charge.application_fee.id;
        await stripe.applicationFees.createRefund(appFeeId, { amount: feeRefundCents });
      }
    }

    await admin
      .from("flower_orders")
      .update({
        status: "REEMBOLSADO",
        refunded_at: new Date().toISOString(),
        refund_amount: customerRefundCents / 100,
      })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        refund_id: refund.id,
        customer_refund: customerRefundCents / 100,
        memoralis_retained: feeRetainedCents / 100,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});