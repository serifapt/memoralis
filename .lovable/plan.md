

# Plano: Criar componente `ObituaryTemplateA4` + Integrar no `AnnouncementGenerator`

O plano anterior definiu a criação do componente A4 fiel ao PDF enviado. Aqui estão os passos concretos de implementação.

## 1. Adicionar fonte Playfair Display ao `index.html`

Adicionar `Playfair+Display:wght@400;500;600;700` ao link do Google Fonts existente (linha 12).

## 2. Copiar assets enviados pelo utilizador

Os ficheiros uploaded (`flores.png`, `logo-funeraria.png`, `logotipo-memoralis_1.png`) serão copiados para `public/lovable-uploads/` para uso direto no template.

## 3. Criar `src/components/obituaries/ObituaryTemplateA4.tsx`

Componente React com layout A4 (`aspect-[210/297]`), fundo branco, que aceita props dinâmicas:

```typescript
interface ObituaryTemplateA4Data {
  displayName: string;
  birthDate: string;
  deathDate: string;
  age?: number;
  parish?: string;
  municipality?: string;
  deathLocation?: string;
  photoUrl?: string;
  publicMessage?: string;
  velorioDate?: string;
  velorioTime?: string;
  velorioLocation?: string;
  funeralDate?: string;
  funeralTime?: string;
  funeralLocation?: string;
  cemeteryName?: string;
  funerariaName?: string;
  funerariaPhone?: string;
  funerariaEmail?: string;
  funerariaWebsite?: string;
  funerariaLogoUrl?: string;
}
```

Layout fiel ao PDF:
- **Topo direito**: logo Memoralis (imagem)
- **Esquerda**: foto `rounded-3xl` + bloco "FALECEU EM [LOCAL]" em Playfair Display uppercase cinza claro
- **Direita**: nome em Playfair Display grande, idade/datas, freguesia, depois secções Camara Ardente / Funeral / Cemiterio com icones Lucide (`Calendar`, `Clock`, `MapPin`)
- **Rodape**: linha separadora, logo funeraria + contactos esquerda, flores decorativas direita
- **Canto inferior esquerdo**: texto "Deixe uma mensagem de condolencias" + placeholder QR

O componente recebe `id="obituary-template-a4"` para captura via html2canvas.

## 4. Atualizar `AnnouncementGenerator.tsx`

- Importar `ObituaryTemplateA4`
- No template "profissional", renderizar `ObituaryTemplateA4` em vez do layout inline atual
- Mapear os props do `obituaryData` existente para o formato `ObituaryTemplateA4Data`
- Manter os templates "elegante" e "classico" como estao
- Atualizar o `generatePDF` para usar `id="obituary-template-a4"` quando o template profissional estiver selecionado

## 5. Adicionar `font-playfair` ao Tailwind config

Estender `fontFamily` no `tailwind.config.ts` com `playfair: ['Playfair Display', 'serif']` para uso com `font-playfair`.

