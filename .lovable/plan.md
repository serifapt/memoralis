
Objetivo: alinhar o PDF gerado com o screenshot de referência (`Screenshot_2026-03-31_at_12.34.13.png`) e eliminar os desvios que ainda aparecem no output actual.

1. Refazer o bloco superior com base na referência
- Em `src/components/obituaries/ObituaryTemplateA4.tsx`, reajustar foto, nome, idade e localidade com medidas e posições fixas em px.
- Substituir a foto actual por uma máscara dedicada com wrapper interno absoluto, `overflow: hidden` e o mesmo `borderRadius` aplicado ao wrapper e à imagem.
- Ajustar `objectPosition` da foto para preservar enquadramento sem deformação no PDF.

2. Trocar o logo Memoralis pelo asset oficial
- Deixar de usar o `LogoMemoralis` inline no template.
- Importar `src/assets/logo-memoralis.svg` e renderizar como imagem com caixa fixa e `objectFit: "contain"`.
- Manter opacidade reduzida e uma proporção exacta para impedir deformação no html2canvas.

3. Reestruturar as linhas com ícones
- Em `src/components/obituaries/ObituaryTemplateA4.tsx`, substituir as rows actuais por um `DetailRow` com grelha de 2 colunas: slot fixo para o ícone + coluna de texto.
- Dar `lineHeight` explícito ao texto e usar ícones com `display: block`, removendo dependência de alinhamento inline/baseline.
- Em `src/components/obituaries/ObituaryIcons.tsx`, normalizar visualmente os 3 ícones para o mesmo box.

4. Estabilizar a captura do PDF
- Em `src/components/obituaries/AnnouncementGenerator.tsx`, garantir que a captura só acontece depois de foto grayscale, QR, logo da funerária, flores e logo Memoralis estarem carregados.
- Adicionar uma espera curta de estabilização do layout antes de chamar `html2canvas`, para reduzir diferenças entre preview e PDF.

5. Validar contra a referência
- Comparar preview e PDF com o screenshot de referência enviado.
- Confirmar: foto preenchida sem deformação, logo Memoralis com proporção correcta, primeira linha do texto alinhada com cada ícone.

Ficheiros a actualizar
- `src/components/obituaries/ObituaryTemplateA4.tsx`
- `src/components/obituaries/ObituaryIcons.tsx`
- `src/components/obituaries/AnnouncementGenerator.tsx`

Detalhes técnicos
```text
Causas mais prováveis
- a foto ainda não está presa a uma máscara estrutural idêntica ao modelo
- o logo inline continua sensível ao redimensionamento/rasterização
- o alinhamento depende do comportamento inline dos SVGs

Ajuste
- máscara fixa para a foto
- logo oficial como imagem com proporção natural
- rows em grid com icon slot fixo e line-height controlado
```
