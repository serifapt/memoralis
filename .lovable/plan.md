

## Correção: Adicionar "desativado" à constraint de status

### Problema
A constraint `funerarias_status_check` na tabela `funerarias` só permite `('pendente', 'ativo', 'rejeitado')`. O código em `AdminFunerarias.tsx` tenta definir o status como `desativado`, o que viola a constraint.

### Solução
Uma migração SQL para substituir a constraint existente por uma que inclua `desativado`:

```sql
ALTER TABLE public.funerarias DROP CONSTRAINT funerarias_status_check;
ALTER TABLE public.funerarias ADD CONSTRAINT funerarias_status_check 
  CHECK (status = ANY (ARRAY['pendente', 'ativo', 'rejeitado', 'desativado']));
```

### Ficheiros
- **Nova migração SQL** — atualizar a constraint

Sem alterações de código, o frontend já usa os valores corretos.

