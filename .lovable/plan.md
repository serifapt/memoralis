

# Plano: Corrigir dados da página pública da funerária

## Problemas identificados

1. **Serviços armazenados incorretamente** — O array `servicos` no banco tem apenas 1 elemento contendo toda a string `"Funerais, Cremações, Trasladações, Exumações, Tanatopraxia, Tanatoestética"` em vez de 6 elementos separados. Isto acontece porque o utilizador provavelmente colou todos os serviços de uma vez. O `handleAddService` adiciona o texto completo do input como um único elemento.

2. **`.single()` em vez de `.maybeSingle()`** — Em `FunerariaDetail.tsx`, a query usa `.single()` que lança erro se não encontrar dados, em vez de retornar `null` graciosamente.

## Correções

### 1. `PublicPageTab.tsx` — Suporte a múltiplos serviços separados por vírgula
- No `handleAddService`, se o texto contiver vírgulas, dividir em múltiplos serviços automaticamente: `trimmed.split(",").map(s => s.trim()).filter(Boolean)`
- Isto garante que se o utilizador colar "Funerais, Cremações, Trasladações", são criados 3 tags separadas

### 2. `FunerariaDetail.tsx` — Usar `.maybeSingle()`
- Trocar `.single()` por `.maybeSingle()` na query da funerária

### 3. Migration — Corrigir dados existentes
- Executar uma migration SQL para separar os serviços que foram guardados como string única:
```sql
UPDATE funerarias 
SET servicos = string_to_array(servicos[1], ', ')
WHERE array_length(servicos, 1) = 1 
  AND servicos[1] LIKE '%,%';
```

### Ficheiros alterados
- `src/components/settings/PublicPageTab.tsx` — split por vírgula no handleAddService
- `src/pages/FunerariaDetail.tsx` — `.maybeSingle()`
- Nova migration SQL

