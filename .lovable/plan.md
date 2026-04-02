

## Plano: Página pública ativa por defeito, slug automático, alerta de duplicados

### 1. Gerar slug automático no registo (`register-funeraria/index.ts`)

Ao criar a funerária, gerar automaticamente um slug baseado nos dois primeiros nomes do `nome_comercial`:
- Normalizar (remover acentos, lowercase, substituir espaços por hífens)
- Extrair os 2 primeiros "tokens" (ou 1 se só tiver 1)
- Verificar se o slug já existe na tabela `funerarias`; se sim, adicionar sufixo numérico (`-2`, `-3`, etc.)
- Definir `pagina_publica_visivel: true` por defeito
- Guardar o slug gerado no insert

### 2. Mover secção "Visibilidade e Link" para o fundo (`PublicPageTab.tsx`)

Reordenar o layout do componente:
1. Imagem de Capa
2. Sobre
3. Serviços
4. Contactos Adicionais
5. Redes Sociais
6. Horário
7. **Visibilidade e Link** (movido para o final)
8. Botão Guardar

### 3. Verificação de slug duplicado com alerta (`PublicPageTab.tsx`)

- Ao carregar dados (`loadData`), verificar se o slug atual já é usado por outra funerária
- Se houver conflito, mostrar um alerta (banner de aviso) na secção "Visibilidade e Link" a pedir ao utilizador para definir um novo slug
- Usar `useRef` + `scrollIntoView` para fazer scroll automático até essa secção quando há conflito
- Também buscar o `nome_comercial` para gerar slug sugerido caso esteja vazio

### Ficheiros a editar
- **`supabase/functions/register-funeraria/index.ts`** — gerar slug e definir `pagina_publica_visivel: true`
- **`src/components/settings/PublicPageTab.tsx`** — reordenar secções, adicionar verificação de duplicados com alerta e scroll automático

