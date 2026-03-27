

## Plano: Adicionar campos em falta ao diálogo "Novo Cliente" no ClientSelector

### Problema
O diálogo de criação de cliente no orçamento só tem 5 campos (Nome, Email, Telefone, NIF, Grau Parentesco). Faltam campos importantes como Endereço, Localidade, Código Postal, NISS, Nacionalidade/Naturalidade, IBAN e Data de Nascimento.

### Alterações

**`src/components/clients/ClientSelector.tsx`**:
- Expandir o `DialogContent` para `sm:max-w-2xl` para acomodar mais campos
- Adicionar campos organizados em grid:
  - **Linha 1**: Nome Completo (full width)
  - **Linha 2**: Email | Telefone
  - **Linha 3**: NIF | NISS
  - **Linha 4**: Grau Parentesco | Data de Nascimento
  - **Linha 5**: Nacionalidade/Naturalidade | IBAN
  - **Linha 6**: Endereço (full width)
  - **Linha 7**: Localidade | Código Postal
  - **Linha 8**: Notas (textarea, full width)
- Adicionar scroll ao conteúdo do diálogo para manter a usabilidade
- Atualizar o `newClientData` inicial para incluir todos os campos novos
- Importar `Textarea` para o campo de notas

**`src/hooks/useClients.ts`** — sem alterações (o `ClientFormData` já suporta todos os campos)

### Ficheiro editado
1. `src/components/clients/ClientSelector.tsx`

