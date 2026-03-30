

## Atualizar datas de nascimento e falecimento dos 32 óbitos

### Dados atuais
- 32 registos da importação S. João, todos com `birth_date = NULL`
- 1 registo (#4 Maria da Conceição da Rocha Leal Gomes) também sem `death_date` — será atribuída uma data fictícia em 2026
- 2 registos pré-existentes (Libertina Lourenço, Maria de Lurdes Dias Barbosa) já têm datas — não serão tocados

### Lógica de cálculo
- **birth_date** = `death_date - age anos - 2 meses` (garante que o aniversário já passou antes do falecimento, resultando na idade correta)
- **death_date** para #4: `2026-03-10` (fictícia, dentro do intervalo jan-mar 2026)

### Operação
Uma única instrução SQL `UPDATE` com `CASE WHEN` por `id`, atualizando `birth_date` (e `death_date` para #4) dos 32 registos. Execução via insert tool (operação de dados, não migração de schema).

### Mapeamento completo (id → idade → birth_date calculada)

| # | Nome | Idade | death_date | birth_date (calculada) |
|---|------|-------|------------|----------------------|
| 1 | Libertina Lídia dos Santos Lourenço | 72 | 2026-03-17 | 1954-01-17 |
| 2 | Teresa do Rosário Vieira | 88 | 2026-03-15 | 1938-01-15 |
| 3 | Maria de Lourdes Carreira Rodrigues Dias | 84 | 2026-03-12 | 1942-01-12 |
| 4 | Maria da Conceição da Rocha Leal Gomes | 87 | **2026-03-10** (novo) | 1939-01-10 |
| 5-32 | (restantes 28) | ... | existentes | death_date - age - 2 meses |

### Ficheiros a alterar
Nenhum. Apenas operação de dados na tabela `obituaries`.

