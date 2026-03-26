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

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { member_user_id, funeraria_id, email, password, full_name, phone } = await req.json();

    if (!member_user_id || !funeraria_id) {
      return new Response(
        JSON.stringify({ error: "member_user_id e funeraria_id são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check caller is admin of this funeraria
    const { data: callerRole } = await adminClient.rpc(
      "get_funeraria_member_role",
      { _user_id: caller.id, _funeraria_id: funeraria_id }
    );

    if (callerRole !== "admin") {
      return new Response(
        JSON.stringify({ error: "Apenas administradores podem editar membros" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check target user is member of this funeraria
    const { data: memberRole } = await adminClient.rpc(
      "get_funeraria_member_role",
      { _user_id: member_user_id, _funeraria_id: funeraria_id }
    );

    if (!memberRole) {
      return new Response(
        JSON.stringify({ error: "Utilizador não é membro desta funerária" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update auth (email/password) if provided
    const authUpdate: Record<string, string> = {};
    if (email?.trim()) authUpdate.email = email.trim().toLowerCase();
    if (password?.trim()) authUpdate.password = password.trim();

    if (Object.keys(authUpdate).length > 0) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(
        member_user_id,
        authUpdate
      );
      if (authError) {
        return new Response(
          JSON.stringify({ error: `Erro ao atualizar credenciais: ${authError.message}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Update profile if name or phone provided
    if (full_name !== undefined || phone !== undefined) {
      const profileUpdate: Record<string, unknown> = { id: member_user_id };
      if (full_name !== undefined) profileUpdate.full_name = (full_name ?? "").trim() || null;
      if (phone !== undefined) profileUpdate.phone = (phone ?? "").trim() || null;

      const { error: profileError } = await adminClient
        .from("profiles")
        .upsert(profileUpdate, { onConflict: "id" });

      if (profileError) {
        return new Response(
          JSON.stringify({ error: `Erro ao atualizar perfil: ${profileError.message}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Also retrieve emails for the response
    return new Response(
      JSON.stringify({ success: true, message: "Dados atualizados com sucesso" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
