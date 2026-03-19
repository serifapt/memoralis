

## Plano: Página dedicada de gestão de contactos

### O que vai ser feito

Criar uma nova página `/contacts` no dashboard da funerária com:
- Lista completa de todos os contactos recebidos via formulário público
- Filtros por estado (lido/não lido) e pesquisa por nome/email/mensagem
- Detalhe expandido de cada contacto com botão para responder por email (abre `mailto:`)
- Marcar como lido/não lido individualmente ou em massa
- Apagar contactos

### Ficheiros a criar/editar

| Ficheiro | Ação |
|---|---|
| `src/pages/FunerariaContacts.tsx` | Nova pagina completa de gestão |
| `src/components/layout/Sidebar.tsx` | Adicionar link "Contactos" na navegação |
| `src/App.tsx` | Adicionar rota `/contacts` |

### Detalhes da implementação

**Página `FunerariaContacts.tsx`:**
- Query a `funeraria_contacts` com filtros dinâmicos
- Barra de pesquisa que filtra por `name`, `email`, `phone` ou `message` (client-side para simplicidade)
- Tabs ou dropdown para filtrar: Todos / Não lidos / Lidos
- Tabela com colunas: Nome, Email, Telefone, Mensagem (truncada), Data, Estado
- Ao clicar numa linha, expande detalhes com mensagem completa
- Botão "Responder por email" que abre `mailto:{email}?subject=Re: Contacto via Memoralis`
- Botão "Marcar como lido/não lido" por contacto
- Botão "Apagar" com confirmação
- Paginação ou scroll infinito

**Sidebar:**
- Adicionar `{ name: "Contactos", href: "/contacts", icon: Mail }` ao `baseNavigation`, depois de "Clientes"

**App.tsx:**
- Adicionar `<Route path="/contacts" element={<FunerariaContacts />} />` dentro do bloco protegido da fu