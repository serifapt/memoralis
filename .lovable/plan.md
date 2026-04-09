

## Mover localidade para junto do nome/idade

### Alteração em `src/components/obituaries/PublicObituaryCard.tsx`

Mover a localidade (linhas 82-86) para imediatamente após a linha da idade (linha 80), removendo-a do bloco inferior. Isto agrupa nome + idade + localidade, e deixa o nome da funerária visualmente separado.

**Antes (estrutura):**
- Nome
- Idade/anos
- *(espaço)*
- Localidade
- Funerária

**Depois:**
- Nome
- Idade/anos
- Localidade
- *(espaço)*
- Funerária

Concretamente:
- Após `</p>` da idade (linha 80), adicionar a localidade como `<p className="text-xs text-muted-foreground">{locationStr}</p>` (sem `mt-2`, inline com o bloco do nome)
- No bloco `flex-1 flex flex-col justify-center` (linhas 81-96), remover o bloco da localidade e manter apenas a funerária com um `mt-auto` para a empurrar para baixo

