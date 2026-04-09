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
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is platform admin
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await callerClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claimsData.claims.sub;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check platform admin role
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Apenas administradores da plataforma" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { funeraria_id, email, password, nome_comercial, nif, responsavel_nome, telefone } = body;

    if (!funeraria_id) {
      return new Response(JSON.stringify({ error: "funeraria_id é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the funeraria to find user_id
    const { data: funeraria, error: funErr } = await adminClient
      .from("funerarias")
      .select("user_id")
      .eq("id", funeraria_id)
      .single();

    if (funErr || !funeraria) {
      return new Response(JSON.stringify({ error: "Funerária não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const changes: string[] = [];

    // Update auth credentials if provided
    if (email || password) {
      const authUpdate: Record<string, string> = {};
      if (email) authUpdate.email = email;
      if (password) authUpdate.password = password;

      const { error: authErr } = await adminClient.auth.admin.updateUserById(
        funeraria.user_id,
        authUpdate
      );

      if (authErr) {
        return new Response(JSON.stringify({ error: `Erro ao atualizar credenciais: ${authErr.message}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (email) changes.push(`email: ${email}`);
      if (password) changes.push("password atualizada");
    }

    // Update funeraria fields if provided
    const funerariaUpdate: Record<string, string> = {};
    if (nome_comercial) funerariaUpdate.nome_comercial = nome_comercial;
    if (nif) funerariaUpdate.nif = nif;
    if (responsavel_nome) funerariaUpdate.responsavel_nome = responsavel_nome;
    if (telefone) funerariaUpdate.telefone = telefone;

    if (Object.keys(funerariaUpdate).length > 0) {
      const { error: updateErr } = await adminClient
        .from("funerarias")
        .update(funerariaUpdate)
        .eq("id", funeraria_id);

      if (updateErr) {
        return new Response(JSON.stringify({ error: `Erro ao atualizar dados: ${updateErr.message}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      changes.push(...Object.keys(funerariaUpdate));
    }

    // Log audit
    if (changes.length > 0) {
      await adminClient.from("audit_logs").insert({
        actor_id: callerId,
        entidade: "funeraria",
        entidade_id: funeraria_id,
        acao: "admin_update",
        detalhes: { changes },
      });
    }

    return new Response(
      JSON.stringify({ success: true, changes }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
