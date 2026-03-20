

## Plano: Auto-save e campos obrigatórios mínimos

### 1. Auto-save com debounce

Implementar gravação automática no editor de obituários (`src/pages/NewObituary.tsx`):

- **Novo fluxo de criação**: Quando o utilizador preenche os campos obrigatórios mínimos e sai do primeiro campo (ou após debounce), o obituário é criado automaticamente na BD. A partir desse momento, a URL muda para `/obituaries/:id/edit` e todas as alterações subsequentes são updates.
- **Debounce de 1.5s**: Usar `useRef` com `setTimeout` — cada alteração em `formData`, `isPublic`, `isCompleted`, toggles de cerimónias ou `velorioEntries` reinicia o timer. Quando o timer dispara, executa o save silenciosamente.
- **Indicador visual**: Substituir o botão "Guardar" por um indicador de estado: "A guardar...", "Guardado ✓", ou "Erro ao guardar".
- **Criar primeiro, editar sempre**: Na criação, só grava quando os campos obrigatórios estão preenchidos. Após a primeira gravação, navega para `/obituaries/:id/edit` sem recarregar a página (usando `navigate(..., { replace: true })`).
- **Photo upload**: Mantém o upload de foto como acção separada (não faz parte do debounce auto-save, pois envolve upload de ficheiro). Após upload, dispara save.

### 2. Campos obrigatórios mínimos (novo processo)

Reduzir a validação obrigatória para criar um obituário:

**Dados do Falecido:**
- `displayName` (Nome do falecido) — obrigatório
- `deathDate` (Data de falecimento) — obrigatório
- `birthDate` (Data de nascimento) — obrigatório
- `freguesia` — obrigatório
- `locality` (Localidade) — obrigatório

**Família/Responsável (Cliente):**
- `familyName` (Nome) — obrigatório
- `familyPhone` (Telefone) — obrigatório
- `familyNif` (NIF) — obrigatório
- `familyRelationship` (Parentesco) — obrigatório
- `familyAddress` (Endereço) — obrigatório
- `familyLocality` (Localidade) — obrigatório
- `familyPostalCode` (Código Postal) — obrigatório

Todos os restantes campos permanecem opcionais e podem ser preenchidos a qualquer momento (com auto-save).

### 3. Detalhes técnicos

**Ficheiro**: `src/pages/NewObituary.tsx`

- Extrair a lógica de save do `handleSubmit` para uma função `saveObituary()` reutilizável
- Adicionar `useEffect` com debounce que observa `formData`, `isPublic`, `isCompleted`, `velorio`, `funeral`, etc.
- Estado `autoSaveStatus`: `"idle" | "saving" | "saved" | "error"`
- Na sidebar direita, substituir o botão "Guardar" pelo indicador de status
- Manter um botão "Guardar Agora" discreto para forçar save imediato
- Usar `useCallback` + `useRef` para o timer de debounce
- Marcar campos obrigatórios com asterisco (*) no UI
- Validação mínima antes do primeiro auto-save (campos obrigatórios preenchidos)

