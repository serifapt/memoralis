

## Plano: Próximas Cerimónias com todos os tipos de eventos

### Situação actual
A query actual (linha 131) já busca todos os `ceremony_events` futuros sem filtrar por tipo, mas o widget de contagem (linha 129) só conta eventos nos próximos 7 dias. O código já suporta qualquer tipo via `ceremonyTypeColor()`, mas não tem cores/labels específicos para "Missa 7º Dia" e "Missa 30º Dia".

### Alterações em `src/pages/Dashboard.tsx`

1. **Expandir `ceremonyTypeColor`** para incluir badges distintos para "missa_7" e "missa_30" (actualmente ambos caem no genérico `includes("missa")`).

2. **Aumentar o limite da query** de 5 para 10 para capturar mais eventos futuros (com 5 tipos possíveis por obituário, 5 é pouco).

3. **Melhorar labels de exibição** — mapear os `event_type` internos (`velorio`, `funeral`, `cremacao`, `missa_7`, `missa_30`) para nomes legíveis no badge ("Velório", "Funeral", "Cremação", "Missa 7º Dia", "Missa 30º Dia").

4. **Contagem de cerimónias agendadas** — manter a contagem dos próximos 7 dias mas garantir que todos os tipos são incluídos.

### Detalhes técnicos
- Função `formatCeremonyType(type)` para mapear tipos internos para labels.
- Actualizar `ceremonyTypeColor` com cases para `missa_7` e `missa_30` com cores distintas (ex: azul e indigo).
- Query `ceremony_events` com `.limit(10)` em vez de `.limit(5)`.

