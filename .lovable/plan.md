

## Plano: Atualizar localidade e eliminar duplicado da Libertina

### 1. Eliminar o registo duplicado da Libertina

O registo mais recente (`b7f6a19d`, "Libertina Lídia dos Santos Lourenço", criado a 30/03) será eliminado. Tem 3 `ceremony_events` associados que também serão eliminados. O registo original (`7ed68825`, "Libertina Lourenço", criado a 20/03) já tem `locality = "Arcos de Valdevez"` e `freguesia = "Gavieira"` — fica intacto.

### 2. Atualizar localidade dos 31 óbitos restantes da importação

Para os 31 registos importados a 30/03 (excluindo o duplicado a eliminar):
- Mover o valor atual de `locality` (que contém nomes de freguesias como Gavieira, Prozelo, Couto, etc.) para o campo `freguesia`
- Definir `locality = 'Arcos de Valdevez'` em todos

### Operação

Uma migração SQL com:
1. `DELETE` dos 3 `ceremony_events` do registo duplicado
2. `DELETE` do registo duplicado da Libertina
3. `UPDATE` dos 31 registos: `SET freguesia = locality, locality = 'Arcos de Valdevez'`

### Ficheiros a alterar
Nenhum ficheiro de código. Apenas operação de dados via migração SQL.

