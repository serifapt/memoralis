

## Plano: Melhorar card da funerária na página de detalhe do obituário

### Alterações em `src/pages/ObituaryDetail.tsx`

#### 1. Expandir dados da funerária
- Adicionar `slug`, `localidade`, `codigo_postal` à interface `Funeraria` e à query (linha 116)
- Isto permite construir a morada completa e o link para a página pública

#### 2. Aumentar o logo
- Mudar de `w-20 h-20` para `w-32 h-32` (ou similar) para dar mais destaque ao logótipo

#### 3. Adicionar links nos contactos e morada
- Telefone: envolver com `<a href="tel:...">`
- Email: envolver com `<a href="mailto:...">`
- Morada: envolver com link para Google Maps (`https://www.google.com/maps/search/?api=1&query=...`)
- Nome da funerária: link para `/funerarias/{slug}`

#### 4. Morada completa
- Mostrar morada + código postal + localidade formatados

