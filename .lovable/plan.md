

## Alertas de campos em falta: Anúncios e Documentos automáticos

### Contexto atual

- **Documentos automáticos** (`DocumentsTab.tsx`, linha 382-390): Já verifica `requiredFields` mas **bloqueia** a geração — mostra toast e não avança. Os nomes dos campos são técnicos (ex: `fullName`, `familyNiss`).
- **Anúncios** (`AnnouncementGenerator.tsx`): Não tem qualquer validação — gera PDF/imagem mesmo sem dados essenciais (nome, datas, foto).

### Alterações

#### 1. `AnnouncementGenerator.tsx` — Validação antes de gerar PDF/imagem

Adicionar função `getMissingAnnouncementFields()` que verifica:
- `displayName` → "Nome"
- `birthDate` → "Data de Nascimento"  
- `deathDate` → "Data de Falecimento"
- `photoUrl` → "Foto"

Nos handlers `generatePDF` e `generateImage`:
- Se faltam campos → mostrar `AlertDialog` com lista dos campos em falta e a pergunta "Quer gerar na mesma?"
- Se confirmar → prossegue com a geração
- Se cancelar → não gera

Implementação: adicionar estado `pendingGeneration` para guardar a ação pendente (pdf/story/post) e mostrar o diálogo de confirmação.

#### 2. `DocumentsTab.tsx` — Mudar de bloqueio para aviso com confirmação

Na função `handleGenerateAutoDoc` (linha 382-390):
- Em vez de bloquear com toast, mostrar `AlertDialog` com os campos em falta traduzidos para português:
  - `fullName` → "Nome Completo"
  - `deathDate` → "Data de Falecimento"
  - `familyName` → "Nome do Cliente"
  - `familyNiss` → "NISS do Cliente"
- Pergunta: "Há campos por preencher. Quer gerar o documento na mesma?"
- Se confirmar → prossegue com a geração
- Se cancelar → não gera

Implementação: adicionar estado `pendingAutoDoc` e um `AlertDialog` ao componente. Criar mapa de tradução `FIELD_LABELS` para converter nomes técnicos em labels legíveis.

### Ficheiros a alterar
- `src/components/obituaries/AnnouncementGenerator.tsx`
- `src/components/obituaries/DocumentsTab.tsx`

