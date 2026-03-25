
Diagnóstico

Do I know what the issue is? Sim.

Os logs mostram que o erro atual já não é principalmente de mapeamento de campos. O bloqueio acontece antes disso, quando o template é aberto pelo `pdf-lib`:

- avisos `Trying to parse invalid object`
- `Invalid object ref: 203 0 R`, `205 0 R`, `207 0 R`, `208 0 R`
- erro final `Expected instance of PDFDict2, but got instance of undefined`

Ao mesmo tempo, os requests aos templates mostram PDFs oficiais com:
- `Linearized`
- `/Encrypt ...`
- referências internas problemáticas na árvore de páginas/recursos

Isto significa que alguns formulários oficiais continuam incompatíveis com o `pdf-lib` no browser, mesmo estando binariamente corretos. Por isso:
- alguns documentos geram
- outros falham logo no `PDFDocument.load()` / acesso às páginas
- corrigir nomes de campos, sozinho, não resolve este erro

Plano de correção

1. Isolar compatibilidade por template
- Rever os 9 templates e marcar quais abrem corretamente no `pdf-lib` e quais falham.
- Guardar uma matriz simples: “carrega”, “campos acessíveis”, “gera”, “falha no parse”.

2. Normalizar os PDFs problemáticos
- Substituir os templates incompatíveis por versões normalizadas/regravadas dos mesmos formulários oficiais.
- Objetivo: remover a estrutura que está a partir o parser, mantendo o formulário preenchível.

3. Tornar o `pdf-form-filler` robusto
- Separar as fases: `fetch` → `load` → `getForm` → `fill` → `flatten/save`.
- Incluir erros com contexto do template (`rp5033`, `rp5075`, etc.), em vez da mensagem genérica atual.
- Não assumir que todos os PDFs aceitam `flatten()` ou até mesmo `getPages()`.

4. Adicionar fallback por documento
- Se um template continuar incompatível após normalização, usar fallback específico:
  - manter download do original em branco
  - e, para os casos necessários, gerar por overlay posicional em vez de AcroForm
- Assim deixamos de ter um fluxo “funciona para uns e crasha para outros”.

5. Só depois voltar ao ajuste fino dos campos
- Com os templates estáveis, fazer uma segunda passagem aos campos ainda vazios.
- Confirmar para cada formulário o que:
  - existe no PDF
  - existe no processo do óbito
  - continua em falta no produto

Ficheiros a alterar

- `public/templates/*.pdf` — substituir os templates incompatíveis por versões normalizadas
- `src/lib/pdf-form-filler.ts` — carregar com tratamento por etapa, mensagens de erro claras e fallback por template
- `src/components/obituaries/DocumentsTab.tsx` — mostrar o erro certo por formulário e evitar falha opaca no UI

O que não parece ser o problema principal agora

- Não há indícios de que a base de dados esteja a bloquear esta geração
- Não há indícios de que o `DocumentsTab` esteja a montar mal os dados
- O crash acontece no parser do PDF, antes de o preenchimento dos campos terminar

Resultado esperado

- deixar de ter erros de parser ao gerar os formulários
- identificar exatamente quais modelos oficiais precisam de normalização ou fallback
- estabilizar a geração dos 9 documentos antes de continuar o refinamento dos campos em falta
