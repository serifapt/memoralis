import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ADMIN] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { email, password, name, secret_key } = await req.json();
    
    // Simple secret key check to prevent unauthorized access
    // This should match a secret stored in environment
    const expectedSecret = Deno.env.get("ADMIN_CREATION_SECRET") || "memoralis-admin-2024";
    
    if (secret_key !== expectedSecret) {
      throw new Error("Unauthorized: Invalid secret key");
    }

    if (!email || !password) {
      throw new Error("email and password are required");
    }

    logStep("Creating admin user", { email });

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      // Check if user already exists
      if (authError.message.includes("already been registered")) {
        // Get existing user
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email);
        
        if (existingUser) {
          logStep("User already exists, assigning admin role", { userId: existingUser.id });
          
          // Check if already admin
          const { data: existingRole } = await supabaseAdmin
            .from("user_roles")
            .select("*")
            .eq("user_id", existingUser.id)
            .eq("role", "admin")
            .maybeSingle();
          
          if (existingRole) {
            return new Response(JSON.stringify({ 
              success: true, 
              message: "User already exists and is already an admin",
              userId: existingUser.id
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
          
          // Assign admin role
          const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
            user_id: existingUser.id,
            role: "admin"
          });

          if (roleError) {
            throw new Error(`Failed to assign admin role: ${roleError.message}`);
          }

          return new Response(JSON.stringify({ 
            success: true, 
            message: "Admin role assigned to existing user",
            userId: existingUser.id
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    const newUserId = authData.user.id;
    logStep("Auth user created", { userId: newUserId });

    // Assign admin role
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: newUserId,
      role: "admin"
    });

    if (roleError) {
      logStep("Error assigning role", { error: roleError.message });
      throw new Error(`Failed to assign admin role: ${roleError.message}`);
    }

    // Create profile if name provided
    if (name) {
      await supabaseAdmin.from("profiles").upsert({
        id: newUserId,
        full_name: name
      });
    }

    logStep("Admin created successfully", { userId: newUserId });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Admin user created successfully",
      userId: newUserId
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
