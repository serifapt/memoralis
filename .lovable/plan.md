

## Plano: Adicionar pesquisa de clientes existentes no tab Cliente/Família

### Objetivo
Adicionar um `ClientSelector` no topo do tab "Cliente / Família" do processo de óbito, permitindo selecionar um cliente já existente (criado na página de Clientes ou ao fazer um orçamento) e preencher automaticamente todos os campos do formulário.

### Alterações

**`src/pages/NewObituary.tsx`**:

1. Importar `ClientSelector` de `@/components/clients/ClientSelector` e `Client` de `@/hooks/useClients`
2. No tab "familia" (linha ~2069), antes dos campos manuais, adicionar:
   - Label "Associar Cliente Existente" + componente `ClientSelector`
   - Se `responsibleClientId` já existir (ex: vindo de orçamento), pré-selecionar esse cliente
   - Ao selecionar, preencher automaticamente todos os campos family* com o mapeamento:
     ```
     full_name → familyName
     relationship_degree → familyRelationship
     email → familyEmail
     phone → familyPhone
     nif → familyNif
     niss → familyNiss
     nationality_place → familyNaturalidade
     iban → familyIban
     address → familyAddress
     city → familyLocality
     postal_code → familyPostalCode
     birth_date → familyBirthDate
     ```
   - Atualizar `responsibleClientId` com o ID do cliente
3. Adicionar um `Separator` com texto "ou preencha manualmente" entre o seletor e os campos existentes

### Ficheiro editado
1. `src/pages/NewObituary.tsx`

