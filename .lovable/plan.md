

## Plano: Adicionar seletores de mês e ano ao Calendar

### Problema
O componente Calendar usa navegação mês-a-mês, tornando impraticável chegar a datas de nascimento nos anos 1950-1970.

### Solução
Substituir o `caption_label` estático do Calendar por dois dropdowns (mês e ano) usando o sistema de `components` do react-day-picker v8 (`CaptionLabel` → custom caption com selects).

### Alteração

**`src/components/ui/calendar.tsx`**:

1. Adicionar um componente custom `Caption` que substitui a caption padrão do DayPicker
2. Este caption renderiza dois `<select>` nativos (ou Select do shadcn) lado a lado:
   - **Mês**: Janeiro–Dezembro (usando `pt` locale)
   - **Ano**: range configurável (ex: 1920 até ano atual + 5), ordenado do mais recente ao mais antigo
3. Ao mudar mês ou ano, chamar `goToMonth(new Date(year, month))` disponível via `useNavigation()` do react-day-picker
4. Manter as setas de navegação mês-a-mês como estão
5. Aceitar props opcionais `fromYear` e `toYear` para controlar o range de anos

Isto aplica-se automaticamente a todos os calendários da app (obituários, orçamentos, etc.) sem alterar nenhum outro ficheiro.

### Ficheiro editado
1. `src/components/ui/calendar.tsx`

