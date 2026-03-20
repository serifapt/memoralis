

## Plano: Corrigir navegação dos cards e adicionar secção de Testemunhos Recentes

### 1. Corrigir navegação para página de edição

Actualmente, os cards de obituário nas secções "Processos Ativos" (linha 329), "Processos Concluídos" (linha 415) e "Próximas Cerimónias" (linha 392) navegam para `/obituaries/${id}` (vista pública). Devem ir para `/obituaries/${id}/edit`.

**Linhas a alterar:**
- Linha 329: `navigate(`/obituaries/${process.id}`)` → `navigate(`/obituaries/${process.id}/edit`)`
- Linha 392: `navigate(`/obituaries/${ceremony.obituary!.id}`)` → `navigate(`/obituaries/${ceremony.obituary!.id}/edit`)`
- Linha 415: `navigate(`/obituaries/${process.id}`)` → `navigate(`/obituaries/${process.id}/edit`)`

### 2. Adicionar secção "Testemunhos Recentes"

- **State**: Novo `recentTestimonials` array com os últimos 5 testemunhos (todos os status) da funerária
- **Query**: Buscar de `funeraria_testimonials` com `funeraria_id`, ordenado por `created_at DESC`, limit 5
- **Card**: Cada testemunho mostra nome do autor, rating (estrelas), mensagem (truncada), data e badge de status (Pendente/Aprovado/Rejeitado)
- **Ícone**: `MessageSquareQuote` (já usado no projecto)
- **"Ver Todos"**: Navega para `/testimonials`
- **cardOrder**: Adicionar `"testemunhos-recentes"` ao array inicial
- **viewAllRoutes**: Adicionar mapeamento para `/testimonials`

### Detalhes técnicos
- Import `Star, MessageSquareQuote` de lucide-react
- Badge de status: Pendente (amarelo), Aprovado (verde), Rejeitado (vermelho)
- Estrelas renderizadas com ícone `Star` preenchido/vazio

