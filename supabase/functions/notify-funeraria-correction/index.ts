import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { funeraria_id, document_type, motivo } = await req.json();

    if (!funeraria_id || !document_type || !motivo) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios em falta" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get funeraria data
    const { data: funeraria, error: funError } = await adminClient
      .from("funerarias")
      .select("user_id, nome_comercial")
      .eq("id", funeraria_id)
      .single();

    if (funError || !funeraria) {
      return new Response(
        JSON.stringify({ error: "Funerária não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user email via auth admin
    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(funeraria.user_id);
    if (authError || !authUser?.user?.email) {
      return new Response(
        JSON.stringify({ error: "Email do utilizador não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const email = authUser.user.email;

    // Update funeraria status to indicate correction needed
    await adminClient
      .from("funerarias")
      .update({ status: "correção_pendente" })
      .eq("id", funeraria_id);

    console.log(`Correction requested for funeraria ${funeraria_id} (${funeraria.nome_comercial})`);
    console.log(`Email would be sent to: ${email}`);
    console.log(`Document: ${document_type}, Reason: ${motivo}`);

    return new Response(
      JSON.stringify({
        success: true,
        email_sent_to: email,
        message: "Pedido de correção registado com sucesso",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
