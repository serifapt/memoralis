

## Ajustes visuais nos cards de obituário

### Alterações em `src/components/obituaries/PublicObituaryCard.tsx`

**1. Remover ícones de localidade e funerária (todos os ecrãs)**
- Linhas 75-90: remover os ícones `MapPin` e `Building2`, mantendo apenas o texto da localidade e o link da funerária (sem ícone)

**2. Mobile: mostrar apenas idade (sem anos de nascimento/falecimento)**
- Linha 71-73: usar classes responsivas para esconder os anos no mobile e mostrar apenas a idade
  - Mobile: `88 Anos`
  - Desktop: `1970 - 2025 | 88 Anos`

**3. Mobile: botões em coluna (empilhados)**
- Linha 95: alterar de `flex gap-1.5` para `flex flex-col sm:flex-row gap-1.5` para que no mobile fiquem um por baixo do outro

**4. Limpar imports não utilizados**
- Remover `MapPin` e `Building2` dos imports do lucide-react

