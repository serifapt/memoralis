import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegisterRequest {
  email: string;
  password: string;
  nome_comercial: string;
  nif: string;
  telefone: string;
  responsavel_nome: string;
  declaro_representacao_legal: boolean;
  aceito_termos: boolean;
  certidao: {
    tipo: "upload" | "codigo";
    codigo_acesso?: string;
    // File upload handled separately via storage
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const data: RegisterRequest = await req.json();

    // 1. Validate required fields
    if (!data.email || !data.password || !data.nome_comercial || !data.nif || 
        !data.telefone || !data.responsavel_nome) {
      return new Response(
        JSON.stringify({ error: "Todos os campos obrigatórios devem ser preenchidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data.declaro_representacao_legal || !data.aceito_termos) {
      return new Response(
        JSON.stringify({ error: "Deve aceitar os termos e declarar representação legal" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check if email already exists
    const { data: existingUsers, error: emailCheckError } = await supabase.auth.admin.listUsers();
    
    if (emailCheckError) {
      console.error("Error checking email:", emailCheckError);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailExists = existingUsers.users.some(
      (u) => u.email?.toLowerCase() === data.email.toLowerCase()
    );

    if (emailExists) {
      return new Response(
        JSON.stringify({ error: "Este email já está registado. Por favor, utilize outro email ou faça login." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Check if NIF already exists
    const { data: existingNif, error: nifCheckError } = await supabase
      .from("funerarias")
      .select("id")
      .eq("nif", data.nif)
      .maybeSingle();

    if (nifCheckError) {
      console.error("Error checking NIF:", nifCheckError);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar NIF" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingNif) {
      return new Response(
        JSON.stringify({ error: "Já existe uma funerária registada com este NIF." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Create user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirm for now
    });

    if (authError) {
      console.error("Error creating user:", authError);
      return new Response(
        JSON.stringify({ error: "Erro ao criar conta: " + authError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;

    try {
      // 5. Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          full_name: data.responsavel_nome,
          phone: data.telefone,
        });

      if (profileError) throw profileError;

      // 6. Assign funeraria role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "funeraria",
        });

      if (roleError) throw roleError;

      // 7. Generate unique slug from nome_comercial
      const generateSlug = (name: string): string => {
        return name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .join("-")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      };

      let baseSlug = generateSlug(data.nome_comercial);
      if (!baseSlug) baseSlug = "funeraria";
      
      let slug = baseSlug;
      let suffix = 2;
      while (true) {
        const { data: existing } = await supabase
          .from("funerarias")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (!existing) break;
        slug = `${baseSlug}-${suffix}`;
        suffix++;
      }

      // 8. Create funeraria record
      const { data: funerariaData, error: funerariaError } = await supabase
        .from("funerarias")
        .insert({
          user_id: userId,
          nome_comercial: data.nome_comercial,
          nif: data.nif,
          responsavel_nome: data.responsavel_nome,
          telefone: data.telefone,
          declaro_representacao_legal: data.declaro_representacao_legal,
          aceito_termos: data.aceito_termos,
          status: "pendente",
          pagina_publica_visivel: true,
          slug: slug,
        })
        .select()
        .single();

      if (funerariaError) throw funerariaError;

      // 9. Create certidao record if codigo provided
      if (data.certidao?.tipo === "codigo" && data.certidao.codigo_acesso) {
        const { error: docError } = await supabase
          .from("funeraria_docs")
          .insert({
            funeraria_id: funerariaData.id,
            tipo: "certidao_permanente_codigo",
            codigo_acesso: data.certidao.codigo_acesso,
            entidade_emissora: "Conservatória do Registo Comercial",
          });

        if (docError) {
          console.error("Error creating certidao doc:", docError);
          // Non-critical, don't rollback
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          funeraria_id: funerariaData.id,
          message: "Registo criado com sucesso!" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (dbError: any) {
      // Rollback: delete the user we created
      console.error("Database error, rolling back:", dbError);
      
      await supabase.auth.admin.deleteUser(userId);

      return new Response(
        JSON.stringify({ error: "Erro ao criar registo: " + dbError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro inesperado: " + error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
