## Problema

Em `/account/care` (`CustomerDashboard.tsx`) e em `/care/auth` (`CareAuth.tsx`) a verificação de autenticação é apenas `supabase.auth.getSession()`. Como o Supabase persiste a sessão por projeto inteiro (não por área), basta o utilizador ter sessão iniciada em qualquer outra zona da plataforma (ex.: funerária, admin, técnico) para o `/account/care` aceitar essa sessão como sendo um cliente Care — daí ver "Olá, Rui" automaticamente sem ter feito login específico.

## Solução

Tratar "estar autenticado como cliente Care" como um estado distinto de "ter sessão Supabase". Um utilizador só é considerado cliente Care se existir um registo em `public.customers` com `user_id = session.user.id`.

### 1. `src/pages/CustomerDashboard.tsx` (`/account/care`)
- Manter o `getSession()` mas deixar de aceitar a sessão como suficiente.
- Carregar o `customer` (já existe via `useCustomerProfile`) e:
  - Se não houver sessão → `navigate('/care/auth?redirect=/account/care')`.
  - Se houver sessão mas `customer` é `null` (a sessão pertence a um utilizador funerária/admin/técnico, não Care) → fazer **sign-out** dessa sessão e redirecionar para `/care/auth?redirect=/account/care` com um toast a explicar "Inicie sessão com a sua conta Memoralis Care".
  - Só renderizar o dashboard quando ambos existem.
- Remover o fallback "Ainda não tem um plano" para o caso de sessão sem `customer` (passa a ser sign-out + redirect). Manter esse cartão apenas se quiseres mostrá-lo a um cliente Care confirmado mas sem subscrições — mas, na prática, se há `customer` há subscrições; mantenho a remoção.

### 2. `src/pages/CareAuth.tsx`
- No `useEffect` que verifica sessão existente, deixar de redirecionar imediatamente quando há `session`. Em vez disso:
  - Verificar se existe registo em `customers` para esse `user.id`.
  - Se sim → `navigate(redirect)`.
  - Se não → **não** redirecionar (deixar o formulário de login visível) e fazer `supabase.auth.signOut()` silenciosamente, para que o utilizador possa entrar com a sua conta Care sem conflito.
- Mesma verificação no `onAuthStateChange`: só navegar depois de confirmar que o utilizador autenticado tem `customer`. Caso contrário, mostrar toast "Esta conta não é uma conta Memoralis Care" e fazer sign-out.
- No `handleLogin`, após `signInWithPassword` bem-sucedido, fazer a mesma verificação antes de navegar.

### 3. `src/components/care/CareSiteHeader.tsx`
- Sem alterações: o link "A minha conta" continua a apontar para `/account/care`. A nova lógica do dashboard trata da redireção.

## Notas técnicas

- Usar `supabase.from('customers').select('id').eq('user_id', user.id).maybeSingle()` para a verificação leve.
- Toda a lógica fica no frontend; não há alterações de DB nem de RLS.
- Não confundir com o login normal `/auth` da plataforma — utilizadores de funerária/admin continuam com sessão válida noutras áreas; apenas a área Care passa a exigir um vínculo explícito a `customers`.

## Fora do âmbito

- Não mexer no fluxo de checkout/Stripe nem na criação automática de conta após pagamento.
- Não unificar os dois sistemas de login.
