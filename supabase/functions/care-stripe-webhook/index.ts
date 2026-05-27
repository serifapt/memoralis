import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CARE-STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        logStep("Webhook signature verification failed", { error: String(err) });
        return new Response("Webhook signature verification failed", { status: 400 });
      }
    } else {
      // For testing without webhook secret
      event = JSON.parse(body);
    }

    logStep("Event received", { type: event.type, id: event.id });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check for idempotency
    const { data: existingEvent } = await supabaseAdmin
      .from("care_webhook_events")
      .select("id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (existingEvent) {
      logStep("Event already processed", { eventId: event.id });
      return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
    }

    // Store the event for idempotency
    await supabaseAdmin.from("care_webhook_events").insert({
      stripe_event_id: event.id,
      type: event.type,
      payload_json: event
    });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { sessionId: session.id });

        if (session.mode === "subscription" && session.subscription) {
          const metadata = session.metadata;
          if (metadata?.customer_id && metadata?.memorial_location_id && metadata?.care_plan_id) {
            // Prefer updating the pre-created subscription row (from care-signup)
            if (metadata.subscription_id) {
              const { error: updErr } = await supabaseAdmin
                .from("care_subscriptions")
                .update({
                  stripe_subscription_id: session.subscription as string,
                  status: "active",
                })
                .eq("id", metadata.subscription_id);
              if (updErr) {
                logStep("Error updating pre-created subscription", { error: updErr.message });
              }
            } else {
              const { error: subError } = await supabaseAdmin.from("care_subscriptions").insert({
                customer_id: metadata.customer_id,
                memorial_location_id: metadata.memorial_location_id,
                care_plan_id: metadata.care_plan_id,
                billing_period: metadata.billing_period || "monthly",
                stripe_subscription_id: session.subscription as string,
                status: "active",
              });
              if (subError) logStep("Error creating subscription", { error: subError.message });
            }

            // Save Stripe customer id on the customer record
            if (session.customer && metadata.customer_id) {
              await supabaseAdmin
                .from("customers")
                .update({ stripe_customer_id: session.customer as string })
                .eq("id", metadata.customer_id);
            }

            // Send welcome email with password-setup link
            try {
              const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
              const recipient = session.customer_details?.email
                || session.customer_email
                || (await supabaseAdmin
                    .from("customers")
                    .select("email,name")
                    .eq("id", metadata.customer_id)
                    .maybeSingle()).data?.email;

              const { data: custRow } = await supabaseAdmin
                .from("customers")
                .select("name,email")
                .eq("id", metadata.customer_id)
                .maybeSingle();
              const { data: planRow } = await supabaseAdmin
                .from("care_plans")
                .select("name")
                .eq("id", metadata.care_plan_id)
                .maybeSingle();
              const { data: locRow } = await supabaseAdmin
                .from("memorial_locations")
                .select("cemetery_name,grave_number")
                .eq("id", metadata.memorial_location_id)
                .maybeSingle();

              const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://memoralis.pt";
              let passwordSetupUrl: string | undefined;
              if (recipient) {
                const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
                  type: "recovery",
                  email: recipient,
                  options: { redirectTo: `${siteUrl}/reset-password` },
                });
                passwordSetupUrl = linkData?.properties?.action_link;
              }

              const amountTotal = (session.amount_total ?? 0) / 100;
              if (recipient) {
                await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""}`,
                  },
                  body: JSON.stringify({
                    templateName: "care-welcome",
                    recipientEmail: recipient,
                    idempotencyKey: `care-welcome-${session.id}`,
                    templateData: {
                      name: custRow?.name ?? "",
                      planName: planRow?.name ?? "",
                      cemeteryName: locRow?.cemetery_name ?? "",
                      graveNumber: locRow?.grave_number ?? "",
                      amount: amountTotal,
                      billingPeriod: metadata.billing_period || "monthly",
                      passwordSetupUrl,
                      accountUrl: `${siteUrl}/account/care`,
                    },
                  }),
                }).catch((e) => logStep("welcome email send failed", { error: String(e) }));
              }
            } catch (e) {
              logStep("welcome email block failed", { error: String(e) });
            }
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription update", { subscriptionId: subscription.id, status: subscription.status });

        const statusMap: Record<string, string> = {
          active: "active",
          trialing: "trialing",
          past_due: "past_due",
          canceled: "canceled",
          unpaid: "unpaid",
          incomplete: "pending",
          incomplete_expired: "canceled",
          paused: "paused"
        };

        const { error: updateError } = await supabaseAdmin
          .from("care_subscriptions")
          .update({
            status: statusMap[subscription.status] || "pending",
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end
          })
          .eq("stripe_subscription_id", subscription.id);

        if (updateError) {
          logStep("Error updating subscription", { error: updateError.message });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        const { error: deleteError } = await supabaseAdmin
          .from("care_subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        if (deleteError) {
          logStep("Error marking subscription as canceled", { error: deleteError.message });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice paid", { invoiceId: invoice.id, subscriptionId: invoice.subscription });

        if (invoice.subscription) {
          const { error: updateError } = await supabaseAdmin
            .from("care_subscriptions")
            .update({ status: "active" })
            .eq("stripe_subscription_id", invoice.subscription as string);

          if (updateError) {
            logStep("Error updating subscription to active", { error: updateError.message });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice payment failed", { invoiceId: invoice.id, subscriptionId: invoice.subscription });

        if (invoice.subscription) {
          const { error: updateError } = await supabaseAdmin
            .from("care_subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription as string);

          if (updateError) {
            logStep("Error updating subscription to past_due", { error: updateError.message });
          }
          
          // TODO: Send notification to customer about payment failure
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
