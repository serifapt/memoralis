O footer já tem links para `/privacidade` e `/termos` mas as páginas e rotas não existem. Vamos criar as duas páginas legais e ligá-las ao router.

## O que será feito

1. **Nova página `/privacidade`** — Política de Privacidade completa, em Português (Portugal), com toda a estrutura RGPD adequada (responsável pelo tratamento, dados recolhidos, finalidades, base legal, direitos do titular, cookies, medidas de segurança, etc.). Dados da entidade: Memoralis, Lda — Incubo, 4970-786 Arcos de Valdevez. Contactos: info@memoralis.pt / +351 928 282 582 (conforme página de Contactos).

2. **Nova página `/termos`** — Termos e Condições de Utilização completos, em Português (Portugal), com: objeto, condições de acesso, propriedade intelectual, limitação de responsabilidade, hiperligações, dados pessoais, modificação dos termos, lei aplicável e foro.

3. **Adicionar rotas** em `src/App.tsx` para `/privacidade` e `/termos`.

4. **Verificar consistência** do footer nas 9 páginas públicas — os links já existem, apenas confirmar que apontam corretamente.

## Estrutura visual
Ambas as páginas seguirão o padrão das páginas públicas existentes (Sobre, Contactos):
- `PublicHeader` no topo
- Hero simples com título da página
- Conteúdo em container centralizado, formato de texto legal com seções numeradas
- Footer idêntico ao das restantes páginas públicas

## Nota técnica
Não são necessárias alterações na base de dados nem no backend. Trata-se apenas de conteúdo estático legal.