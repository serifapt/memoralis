

## Plano: Ajustar preview sem margens + alinhamentos à esquerda

### Problemas identificados

1. **Margens brancas no thumbnail**: O container usa `aspect-[3/4]` (0.75) mas o A4 é 595:842 (≈0.707). A escala fixa de 0.28 não preenche o container.
2. **Logo da funerária e contactos**: No `ObituaryTemplateA4`, estão posicionados a `left: 254px` (coluna direita). Devem alinhar à esquerda (`left: 40px`), consistente com o resto da informação.

### Alterações

**1. `src/components/obituaries/TemplateThumbnail.tsx`**
- Mudar aspect ratio do container de `aspect-[3/4]` para `aspect-[595/842]` (ratio A4 real)
- Usar escala `calc(100% / 595)` — renderizar o conteúdo escalado com `width: 100%` e `height: 100%` no container, usando `transform: scale()` calculado para preencher toda a largura sem margens

**2. `src/components/obituaries/ObituaryTemplateA4.tsx`**
- Mover o logo da funerária de `left: 254px` para `left: 40px`
- Mover os contactos de `left: 255px` para `left: 40px`
- Garantir `text-align: left` nos contactos

**3. `src/components/SeventhDayMassTemplate/SeventhDayMassTemplate.tsx`**
- Verificar e confirmar que logo da funerária (`left: 254px`) e contactos (`left: 254.58px`) também passam para `left: 40.67px` (alinhamento esquerdo consistente com o layout)

