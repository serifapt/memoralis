

## Plano: Corrigir cálculo da idade + preservar dados entre tabs

### Problema 1: Idade hardcoded

Na linha 2071 do `NewObituary.tsx`, a idade está **hardcoded como "55 Anos"** no preview card:
```
{formData.birthDate ? new Date(formData.birthDate).getFullYear() : "1970"} - {formData.deathDate ? new Date(formData.deathDate).getFullYear() : "2025"} | 55 Anos
```

No `ObituaryDetail.tsx` (página pública), o cálculo usa `Math.floor((death - birth) / (365.25 * ...))` que pode dar resultados incorretos por problemas de timezone (datas interpretadas como UTC deslocam o dia).

No `ObituaryTemplateA4.tsx`, o cálculo usa `new Date(dateStr)` que também sofre do mesmo problema de timezone.

### Problema 2: Dados não se perdem entre tabs

Os dados já estão a ser mantidos em estado React (`formData`) partilhado entre todas as tabs — mudar de tab **não** apaga dados. Se o utilizador reporta perda de dados, é provável que esteja a clicar "Guardar" numa tab e a página recarregar/navegar, perdendo o que estava noutras tabs que ainda não foi guardado. O botão "Guardar" submete **tudo de uma vez**, por isso o problema real pode ser que o utilizador não está a carregar em "Guardar" antes de mudar de tab e espera auto-save.

**Solução**: Adicionar auto-save com debounce ou, pelo menos, um aviso visual quando há alterações não guardadas.

### Correções

| Ficheiro | Ação |
|---|---|
| `src/pages/NewObituary.tsx` | Calcular idade dinamicamente no preview; adicionar indicador de alterações não guardadas |
| `src/pages/ObituaryDetail.tsx` | Corrigir cálculo da idade usando parse local de datas |
| `src/components/obituaries/ObituaryTemplateA4.tsx` | Corrigir `calculateAge` com parse local |

### Detalhes técnicos

**Função corrigida de cálculo de idade** (aplicada nos 3 ficheiros):
```typescript
function calculateAge(birthStr: string, deathStr: string): number | null {
  if (!birthStr || !deathStr) return null;
  const [bY, bM, bD] = birthStr.split("-").map(Number);
  const [dY, dM, dD] = deathStr.split("-").map(Number);
  let age = dY - bY;
  if (dM < bM || (dM === bM && dD < bD)) age--;
  return age;
}
```

**Preview card** (linha 2069-2071): substituir "55 Anos" hardcoded por cálculo dinâmico usando a função acima.

**Indicador de alterações não guardadas**: Adicionar estado `hasUnsavedChanges` que fica `true` quando `formData` muda após o último save, e mostrar um badge/texto junto ao botão Guardar.

