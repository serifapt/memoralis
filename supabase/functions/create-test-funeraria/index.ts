import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting test funeraria creation...');

    // Verify JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ success: false, error: 'Não autorizado' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the caller's token and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !callerUser) {
      console.error("Invalid token:", authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Token inválido' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Verify caller is an admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUser.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("User is not an admin:", callerUser.id);
      return new Response(
        JSON.stringify({ success: false, error: 'Acesso negado. Apenas administradores podem criar dados de teste.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    const testEmail = 'funeraria.teste@memoralis.pt';
    const testPassword = 'Teste123!';

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === testEmail);

    let userId: string;

    if (existingUser) {
      console.log('User already exists, using existing user:', existingUser.id);
      userId = existingUser.id;
    } else {
      // Create test user
      console.log('Creating test user...');
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'João Silva'
        }
      });

      if (authError) {
        console.error('Error creating user:', authError);
        throw authError;
      }

      userId = authData.user.id;
      console.log('User created successfully:', userId);

      // Add funeraria role
      console.log('Adding funeraria role...');
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'funeraria'
        });

      if (roleError) {
        console.error('Error adding role:', roleError);
        throw roleError;
      }
      console.log('Role added successfully');
    }

    // Check if funeraria already exists
    const { data: existingFuneraria } = await supabaseAdmin
      .from('funerarias')
      .select('id')
      .eq('user_id', userId)
      .single();

    let funerariaId: string;

    if (existingFuneraria) {
      console.log('Funeraria already exists:', existingFuneraria.id);
      funerariaId = existingFuneraria.id;
    } else {
      // Create funeraria record
      console.log('Creating funeraria record...');
      const { data: funerariaData, error: funerariaError } = await supabaseAdmin
        .from('funerarias')
        .insert({
          user_id: userId,
          nome_comercial: 'Funerária São Miguel',
          nif: '123456789',
          responsavel_nome: 'João Silva',
          telefone: '912345678',
          status: 'pendente',
          declaro_representacao_legal: true,
          aceito_termos: true
        })
        .select()
        .single();

      if (funerariaError) {
        console.error('Error creating funeraria:', funerariaError);
        throw funerariaError;
      }

      funerariaId = funerariaData.id;
      console.log('Funeraria created successfully:', funerariaId);

      // Create sample documents
      console.log('Creating sample documents...');
      const documents = [
        {
          funeraria_id: funerariaId,
          tipo: 'alvara',
          numero_documento: 'ALV-2024-001',
          data_emissao: '2024-01-15',
          data_validade: '2025-01-15',
          entidade_emissora: 'Câmara Municipal de Lisboa',
          estado_validacao: 'por_validar'
        },
        {
          funeraria_id: funerariaId,
          tipo: 'seguro',
          numero_documento: 'SEG-2024-123456',
          data_emissao: '2024-02-01',
          data_validade: '2025-02-01',
          entidade_emissora: 'Seguros XYZ',
          estado_validacao: 'por_validar'
        },
        {
          funeraria_id: funerariaId,
          tipo: 'certidao_permanencia',
          numero_documento: 'CERT-2024-789',
          data_emissao: '2024-01-10',
          entidade_emissora: 'Autoridade Tributária',
          estado_validacao: 'por_validar'
        }
      ];

      const { error: docsError } = await supabaseAdmin
        .from('funeraria_docs')
        .insert(documents);

      if (docsError) {
        console.error('Error creating documents:', docsError);
        // Non-critical, continue anyway
      } else {
        console.log('Sample documents created successfully');
      }
    }

    // Log the action for audit
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: callerUser.id,
      entidade: 'funeraria',
      entidade_id: funerariaId,
      acao: 'create_test_funeraria',
      detalhes: { test_email: testEmail }
    });

    const response = {
      success: true,
      message: 'Funerária de teste criada com sucesso!',
      credentials: {
        email: testEmail,
        password: testPassword,
        funerariaId: funerariaId
      },
      instructions: [
        '1. Aceda a /admin/auth e faça login como admin',
        '2. Vá para /admin/funerarias',
        '3. Encontre "Funerária São Miguel" e aprove o registo',
        '4. Depois faça login em /auth com as credenciais acima'
      ]
    };

    console.log('Test funeraria creation completed successfully');

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-test-funeraria function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
