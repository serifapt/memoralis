
Objetivo: corrigir o layout final do A4 para que o PDF saia como o modelo: foto a preencher a máscara sem encolher, logótipo Memoralis sem deformação e linhas de cerimónia alinhadas com os ícones.

1. Corrigir a foto no template
- Em `src/components/obituaries/ObituaryTemplateA4.tsx`, substituir o bloco actual da foto por uma máscara fixa com dimensões e raio explícitos em px.
- Em vez de usar o `<img>` como “caixa”, usar um wrapper interno a ocupar 100% da máscara (`position: absolute`, `inset: 0`, `width: "100%"`, `height: "100%"`) e a imagem com `display: "block"`, `width: "100%"`, `height: "100%"`, `objectFit: "cover"`.
- Aplicar o mesmo `borderRadius` ao wrapper e à imagem para evitar clipping/rasterização inconsistente no export.
- Manter a foto processada a preto e branco no gerador; aqui a correcção é estrutural.

2. Corrigir o logótipo da Memoralis
- Em `src/components/obituaries/ObituaryIcons.tsx`, tornar `LogoMemoralis` dimensionável pelo container, em vez de ficar preso aos atributos actuais `width="99"` e `height="13"`.
- Fazer o SVG usar `width="100%"`, `height="100%"` e `preserveAspectRatio="xMidYMid meet"`.
- Em `ObituaryTemplateA4.tsx`, ajustar a caixa do logo para uma proporção exacta e manter `opacity: 0.3`, evitando squash horizontal no PDF.
- Se necessário, trocar o SVG inline pelo asset oficial `src/assets/logo-memoralis.svg` já existente, com renderização a preto e 30% de opacidade.

3. Alinhar texto com ícones
- Reestruturar o `EventSection` em `src/components/obituaries/ObituaryTemplateA4.tsx` para cada linha usar uma célula fixa para o ícone e outra para o texto.
- Remover o alinhamento por `paddingTop` manual.
- Definir `lineHeight: "18px"` explicitamente no texto das datas/horas/localizações e dar ao “slot” do ícone altura igual à linha de texto.
- Uniformizar os três SVGs para encaixarem visualmente no mesmo box, sem compensações diferentes por ícone.

4. Garantir fidelidade no export
- Rever `src/components/obituaries/AnnouncementGenerator.tsx` para garantir que o PDF é gerado só depois de QR code, foto processada e imagens do template estarem carregadas.
- Manter `html2canvas` com `useCORS: true`, `allowTaint: false`, `scale: 2`, `backgroundColor: "#ffffff"`.
- Se o preview ficar correcto mas o PDF não, ajustar o timing da captura em vez de voltar a mexer no layout.

Ficheiros a actualizar
- `src/components/obituaries/ObituaryTemplateA4.tsx`
- `src/components/obituaries/ObituaryIcons.tsx`
- `src/components/obituaries/AnnouncementGenerator.tsx`

Detalhes técnicos
```text
Antes
foto/logótipo = elementos com sizing frágil para html2canvas
ícones = alinhamento por ajuste manual
PDF = captura antes de o layout estar totalmente estável

Depois
foto = máscara fixa + imagem a preencher 100% com cover
logo = SVG responsivo ao container + proporção preservada
ícones = coluna fixa + line-height explícita
PDF = captura só após todos os assets estarem prontos
```

Validação
- Comparar preview e PDF do mesmo óbito.
- Confirmar: foto cheia sem encolher, logo sem deformação, primeira linha do texto alinhada com o centro óptico de cada ícone.
