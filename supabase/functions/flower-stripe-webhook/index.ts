import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const log = (s: string, d?: unknown) =>
  console.log(`[FLOWER-WEBHOOK] ${s}${d ? ` ${JSON.stringify(d)}` : ""}`);

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_FLOWERS_WEBHOOK_SECRET");
    if (!stripeKey || !webhookSecret) throw new Error("Missing Stripe config");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No signature");

    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Idempotency
    const { data: existing } = await admin
      .from("flower_webhook_events")
      .select("id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();
    if (existing) {
      log("Already processed", { id: event.id });
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    log("Event", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.flower_order_id;
        if (orderId) {
          await admin
            .from("flower_orders")
            .update({
              status: "PENDENTE",
              paid_at: new Date().toISOString(),
              stripe_payment_intent_id:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id ?? null,
            })
            .eq("id", orderId);

          // Fire-and-forget transactional emails (do not block webhook ack)
          try {
            await sendOrderEmails(admin, orderId);
          } catch (e) {
            log("EMAIL_DISPATCH_ERROR", { msg: e instanceof Error ? e.message : String(e) });
          }
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.flower_order_id;
        if (orderId) {
          await admin
            .from("flower_orders")
            .update({ status: "CANCELADO" })
            .eq("id", orderId);
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId = typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
        if (piId) {
          await admin
            .from("flower_orders")
            .update({
              status: "REEMBOLSADO",
              refunded_at: new Date().toISOString(),
              refund_amount: (charge.amount_refunded ?? 0) / 100,
            })
            .eq("stripe_payment_intent_id", piId);
        }
        break;
      }
    }

    await admin.from("flower_webhook_events").insert({
      stripe_event_id: event.id,
      type: event.type,
      payload_json: event as unknown as Record<string, unknown>,
    });

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendOrderEmails(admin: any, orderId: string) {
  const { data: order } = await admin
    .from("flower_orders")
    .select(
      "id, obituary_id, funeraria_id, sender_name, sender_email, sender_phone, message, observations, subtotal, commission_value, total, billing_nif, billing_name, billing_address, billing_postal_code, billing_city"
    )
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return;

  const [{ data: items }, { data: funeraria }, { data: obituary }, { data: events }] =
    await Promise.all([
      admin
        .from("flower_order_items")
        .select("product_name_snapshot, quantity, line_total")
        .eq("order_id", orderId),
      admin
        .from("funerarias")
        .select("id, nome_comercial, email_notificacoes_flores")
        .eq("id", order.funeraria_id)
        .maybeSingle(),
      admin
        .from("obituaries")
        .select("id, display_name")
        .eq("id", order.obituary_id)
        .maybeSingle(),
      admin
        .from("ceremony_events")
        .select("event_type, event_date, event_time, location")
        .eq("obituary_id", order.obituary_id),
    ]);

  // Pick ceremony: prefer Funeral, then Velório
  const eventOrder = ["Funeral", "Velório", "Velorio"];
  const ceremony =
    (events ?? [])
      .slice()
      .sort(
        (a: any, b: any) =>
          (eventOrder.indexOf(a.event_type) + 99) -
          (eventOrder.indexOf(b.event_type) + 99)
      )[0] ?? null;
  const ceremonyDate = ceremony?.event_date
    ? `${ceremony.event_date}${ceremony.event_time ? ` ${ceremony.event_time}` : ""}`
    : undefined;

  const mappedItems = (items ?? []).map((it: any) => ({
    name: it.product_name_snapshot,
    quantity: it.quantity,
    line_total: Number(it.line_total),
  }));

  const origin = "https://memoralis.pt";
  const obituaryUrl = `${origin}/obituario/${order.obituary_id}`;

  // Resolve funerária email
  let funerariaEmail: string | null =
    funeraria?.email_notificacoes_flores?.trim() || null;
  if (!funerariaEmail && funeraria?.id) {
    const { data: members } = await admin
      .from("funeraria_members")
      .select("user_id, created_at")
      .eq("funeraria_id", funeraria.id)
      .eq("role", "admin")
      .order("created_at", { ascending: true })
      .limit(1);
    const adminUserId = members?.[0]?.user_id;
    if (adminUserId) {
      const { data: u } = await admin.auth.admin.getUserById(adminUserId);
      funerariaEmail = u?.user?.email ?? null;
    }
  }

  const customerPayload = {
    senderName: order.sender_name,
    deceasedName: obituary?.display_name,
    funerariaName: funeraria?.nome_comercial,
    items: mappedItems,
    subtotal: Number(order.subtotal),
    commission: Number(order.commission_value),
    total: Number(order.total),
    message: order.message,
    billingNif: order.billing_nif,
    obituaryUrl,
  };

  const funerariaPayload = {
    deceasedName: obituary?.display_name,
    ceremonyLocation: ceremony?.location,
    ceremonyDate,
    items: mappedItems,
    subtotal: Number(order.subtotal),
    commission: Number(order.commission_value),
    amountToReceive: Number(order.subtotal),
    senderName: order.sender_name,
    senderEmail: order.sender_email,
    senderPhone: order.sender_phone,
    message: order.message,
    observations: order.observations,
    billingNif: order.billing_nif,
    billingName: order.billing_name,
    billingAddress: order.billing_address,
    billingPostalCode: order.billing_postal_code,
    billingCity: order.billing_city,
    orderUrl: `${origin}/flower-orders`,
    orderId: order.id,
  };

  const sends: Promise<unknown>[] = [];
  if (order.sender_email) {
    sends.push(
      admin.functions.invoke("send-transactional-email", {
        body: {
          templateName: "flower-order-customer-confirmation",
          recipientEmail: order.sender_email,
          idempotencyKey: `flower-order-${order.id}-customer`,
          templateData: customerPayload,
        },
      })
    );
  }
  if (funerariaEmail) {
    sends.push(
      admin.functions.invoke("send-transactional-email", {
        body: {
          templateName: "flower-order-funeraria-notification",
          recipientEmail: funerariaEmail,
          idempotencyKey: `flower-order-${order.id}-funeraria`,
          templateData: funerariaPayload,
        },
      })
    );
  } else {
    log("NO_FUNERARIA_EMAIL", { orderId });
  }
  await Promise.allSettled(sends);
}