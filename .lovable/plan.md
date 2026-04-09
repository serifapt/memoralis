

## Correção: Email do proprietário não aparece para admins da plataforma

### Problema
A Edge Function `get-member-emails` verifica se o utilizador que faz o pedido é membro da funerária via `get_funeraria_member_role`. Os administradores da plataforma (tabela `user_roles` com role `admin`) não estão na tabela `funeraria_members`, pelo que recebem um erro 403 e o email nunca é devolvido.

### Solução
Atualizar a Edge Function `get-member-emails` para também permitir o acesso a utilizadores com role `admin` na tabela `user_roles`. Depois de verificar `get_funeraria_member_role`, se não tiver role, verificar `has_role(caller.id, 'admin')` via query à tabela `user_roles`.

### Alteração

**Ficheiro**: `supabase/functions/get-member-emails/index.ts`

Substituir o bloco de verificação de permissão (linhas ~48-61) por:

```typescript
// Check caller is member of this funeraria OR platform admin
const { data: callerRole } = await adminClient.rpc(
  "get_funeraria_member_role",
  { _user_id: caller.id, _funeraria_id: funeraria_id }
);

let isAuthorized = !!callerRole;

if (!isAuthorized) {
  const { data: isAdmin } = await adminClient.rpc(
    "has_role",
    { _user_id: caller.id, _role: "admin" }
  );
  isAuthorized = !!isAdmin;
}

if (!isAuthorized) {
  return new Response(
    JSON.stringify({ error: "Sem permissão" }),
    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

Sem outras alterações necessárias — o frontend já trata a resposta corretamente.

