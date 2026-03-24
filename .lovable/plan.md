

## Plano: Melhorar secção do logótipo com cropping

### Alterações

#### 1. Instalar `react-image-crop` 
Biblioteca leve para cropping de imagens no browser.

#### 2. Criar componente `LogoCropper` (`src/components/settings/LogoCropper.tsx`)
- Dialog/modal que abre quando o utilizador seleciona ou clica "Recortar"
- Usa `ReactCrop` com proporção fixa (ex: 3:1 para formato horizontal típico de logo)
- Botões para alternar entre proporções pré-definidas: **Livre**, **1:1** (ícone/avatar), **3:1** (cabeçalho/PDF), **16:9** (capa)
- Indicação visual de onde cada proporção é usada (ex: "Cards de obituário", "Cabeçalho do PDF", "Página pública")
- Botão "Confirmar recorte" que gera a imagem recortada via Canvas API e devolve ao componente pai

#### 3. Melhorar secção do logótipo em `Settings.tsx`
- Após selecionar ficheiro, abrir automaticamente o modal de cropping
- Preview maior e mais limpo do logo após recorte
- Adicionar botão "Recortar" junto ao "Alterar imagem" para re-editar o crop
- Mostrar indicações dos tamanhos/proporções onde o logo aparece (cards, PDF, página pública, detalhe do obituário)
- Layout melhorado: preview centrado, botões agrupados de forma clara

### Resultado
O utilizador pode fazer upload do logo e ajustá-lo com a proporção ideal para os diferentes contextos onde é exibido, tudo dentro da página de configurações.

