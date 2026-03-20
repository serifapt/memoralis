

## Plano: Auto-preencher dados do óbito no orçamento e melhorar PDF

### Contexto
Quando a funerária clica "Criar Orçamento" a partir de um óbito, a página `/budgets/new?obituaryId=X` já pré-preenche alguns campos (nome, data falecimento, local). Falta preencher `funeral_date` e `cemetery` a partir dos `ceremony_events`, e o PDF precisa de seguir o layout da imagem de referência.

### Alterações

#### 1. Pré-preencher funeral_date e cemetery (`src/pages/BudgetQuoteDetail.tsx`, linhas 116-134)

Quando o orçamento é criado a partir de um óbito, além dos dados já carregados, buscar os `ceremony_events` do tipo `funeral` para preencher:
- `funeral_date` → `event_date` do evento funeral
- `cemetery` → `location` do evento funeral

```
// Após carregar o obituary, buscar ceremony_events
const { data: events } = await supabase
  .from("ceremony_events")
  .select("event_type, event_date, location")
  .eq("obituary_id", obituaryId)
  .eq("event_type", "funeral")
  .maybeSingle();

if (events) {
  setFormData(prev => ({
    ...prev,
    funeral_date: events.event_date || prev.funeral_date,
    cemetery: events.location || prev.cemetery,
  }));
}
```

#### 2. Redesenhar PDF para seguir layout da imagem (`src/components/budgets/BudgetQuotePDF.tsx`)

Reestruturar o template HTML do PDF para seguir o layout do documento físico:
- **Cabeçalho**: Logo/nome da funerária à esquerda, número do orçamento e data à direita (caixa com bordas)
- **Duas colunas lado a lado**: "Cliente" (Nome, Endereço, Localidade, C.P., Parentesco, Telefone, NIF) e "Dados do Falecido" (Data Falecimento, Data Funeral, Cemitério, Local de Falecimento, Nome do Falecido)
- **Tabela de serviços**: Colunas Qtd | Descrição | Preço Unitário | Desconto (%) | TOTAL, agrupadas por secção com subtotais
- **Rodapé**: "Nesta firma existe Livro de Reclamações", isenção IVA, TOTAL DO ORÇAMENTO, assinaturas (A Gerência / Adjudicante do Serviço), texto de contrato

#### 3. Buscar mais dados da funerária para o PDF (`src/pages/BudgetQuoteDetail.tsx`)

Expandir a query de funerária (linha 98) para incluir `morada`, `email`, `localidade`, `codigo_postal` — dados que aparecem no cabeçalho do documento de referência. Passar estes dados ao componente `BudgetQuotePDF`.

### Resultado
- Ao clicar "Criar Orçamento" num óbito, todos os dados obrigatórios (falecido + cliente + cerimónia) são pré-preenchidos automaticamente
- O PDF gerado segue o layout profissional da imagem de referência com todos os dados da funerária e serviços orçamentados

