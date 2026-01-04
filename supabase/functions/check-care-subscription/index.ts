import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-CARE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

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
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get customer profile
    const { data: customerData, error: customerError } = await supabaseClient
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (customerError) {
      throw new Error(`Customer lookup error: ${customerError.message}`);
    }

    if (!customerData) {
      return new Response(JSON.stringify({ 
        hasCustomerProfile: false,
        subscriptions: []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get active subscriptions with details
    const { data: subscriptions, error: subError } = await supabaseClient
      .from("care_subscriptions")
      .select(`
        id,
        status,
        billing_period,
        current_period_end,
        cancel_at_period_end,
        care_plans (id, code, name),
        memorial_locations (id, cemetery_name, grave_number)
      `)
      .eq("customer_id", customerData.id)
      .in("status", ["active", "trialing", "past_due"]);

    if (subError) {
      throw new Error(`Subscriptions lookup error: ${subError.message}`);
    }

    logStep("Subscriptions found", { count: subscriptions?.length || 0 });

    return new Response(JSON.stringify({ 
      hasCustomerProfile: true,
      customerId: customerData.id,
      subscriptions: subscriptions || []
    }), {
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
