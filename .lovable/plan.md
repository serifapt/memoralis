

## Plano: Refinar ObituaryTemplateA4 para corresponder ao PDF de referência

### Alterações no ficheiro `src/components/obituaries/ObituaryTemplateA4.tsx`

**1. Tipografia**
- Nome: manter `font-playfair`, aumentar para `text-4xl`
- "FALECEU EM": mudar para `font-sans font-bold` com `tracking-[0.25em]` e cor `text-gray-400`
- Títulos de secção (Câmara Ardente, Funeral, Cemitério): manter `font-playfair font-bold`

**2. Foto**
- Mudar de quadrada (`w-48 h-48`) para proporção vertical (`w-48 h-64`)
- Arredondamento: `rounded-[40px]` em vez de `rounded-3xl`

**3. Remover ícones**
- Eliminar imports de `Calendar`, `Clock`, `MapPin` do lucide-react
- Substituir por texto limpo alinhado, sem ícones — apenas data, hora e local em linhas separadas com formatação simples

**4. Espaçamento**
- Aumentar `gap` do grid principal de `gap-6` para `gap-10`
- Aumentar `mb` entre o bloco nome e as cerimónias de `mb-6` para `mb-10`
- Aumentar `space-y` entre secções de cerimónia de `space-y-5` para `space-y-6`

**5. Rodapé**
- Manter layout actual (logo+contactos à esquerda, flores à direita)
- Aumentar ligeiramente o tamanho do logo da funerária e nome

### Ficheiro
- `src/components/obituaries/ObituaryTemplateA4.tsx`

