import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CARE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { care_plan_price_id, memorial_location_id } = await req.json();
    
    if (!care_plan_price_id || !memorial_location_id) {
      throw new Error("care_plan_price_id and memorial_location_id are required");
    }

    logStep("Request data", { care_plan_price_id, memorial_location_id });

    // Get the Stripe price ID from the database
    const { data: priceData, error: priceError } = await supabaseClient
      .from("care_plan_prices")
      .select("stripe_price_id, care_plan_id, billing_period, care_plans(code, name)")
      .eq("id", care_plan_price_id)
      .single();

    if (priceError || !priceData?.stripe_price_id) {
      throw new Error("Invalid care plan price");
    }

    logStep("Price data retrieved", { stripe_price_id: priceData.stripe_price_id });

    // Get or create customer record
    const { data: customerData, error: customerError } = await supabaseClient
      .from("customers")
      .select("id, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (customerError) {
      throw new Error(`Customer lookup error: ${customerError.message}`);
    }

    if (!customerData) {
      throw new Error("Customer profile not found. Please complete your profile first.");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let stripeCustomerId = customerData.stripe_customer_id;

    if (!stripeCustomerId) {
      // Create a new Stripe customer
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      } else {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: { supabase_customer_id: customerData.id }
        });
        stripeCustomerId = newCustomer.id;
      }

      // Update customer with Stripe ID
      await supabaseClient
        .from("customers")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", customerData.id);

      logStep("Created/linked Stripe customer", { stripeCustomerId });
    }

    const origin = req.headers.get("origin") || "https://memoralis.pt";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceData.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/account/care?success=true`,
      cancel_url: `${origin}/care/checkout?canceled=true`,
      metadata: {
        customer_id: customerData.id,
        memorial_location_id,
        care_plan_id: priceData.care_plan_id,
        billing_period: priceData.billing_period
      },
      subscription_data: {
        metadata: {
          customer_id: customerData.id,
          memorial_location_id,
          care_plan_id: priceData.care_plan_id,
          billing_period: priceData.billing_period
        }
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
