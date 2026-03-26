import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Validate caller auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
    } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, role, funeraria_id, full_name } = await req.json();

    if (!email || !role || !funeraria_id) {
      return new Response(
        JSON.stringify({ error: "email, role e funeraria_id são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["admin", "editor"].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Role inválido. Use 'admin' ou 'editor'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client for admin operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check caller is admin of this funeraria
    const { data: callerRole } = await adminClient.rpc(
      "get_funeraria_member_role",
      { _user_id: caller.id, _funeraria_id: funeraria_id }
    );

    if (callerRole !== "admin") {
      return new Response(
        JSON.stringify({ error: "Apenas administradores podem convidar membros" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    let targetUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!targetUser) {
      // Create new user with a random password (they'll need to reset)
      const tempPassword = crypto.randomUUID() + "Aa1!";
      const { data: newUser, error: createError } =
        await adminClient.auth.admin.createUser({
          email: email.toLowerCase(),
          password: tempPassword,
          email_confirm: true,
          user_metadata: { full_name: full_name || email.split("@")[0] },
        });

      if (createError) {
        return new Response(
          JSON.stringify({ error: `Erro ao criar utilizador: ${createError.message}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      targetUser = newUser.user;
    }

    if (!targetUser) {
      return new Response(
        JSON.stringify({ error: "Erro ao encontrar/criar utilizador" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure user has 'funeraria' role in user_roles
    await adminClient
      .from("user_roles")
      .upsert(
        { user_id: targetUser.id, role: "funeraria" },
        { onConflict: "user_id,role" }
      );

    // Create profile if not exists
    await adminClient
      .from("profiles")
      .upsert(
        {
          id: targetUser.id,
          full_name: full_name || targetUser.user_metadata?.full_name || email.split("@")[0],
        },
        { onConflict: "id" }
      );

    // Insert into funeraria_members
    const { error: memberError } = await adminClient
      .from("funeraria_members")
      .upsert(
        {
          funeraria_id,
          user_id: targetUser.id,
          role,
          invited_by: caller.id,
        },
        { onConflict: "funeraria_id,user_id" }
      );

    if (memberError) {
      return new Response(
        JSON.stringify({ error: `Erro ao adicionar membro: ${memberError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: targetUser.id,
        message: `Utilizador ${email} adicionado como ${role}`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
