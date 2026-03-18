

# Plano: Corrigir erro ao guardar novo obituário

## Problema identificado

Há dois problemas no `NewObituary.tsx`:

1. **`funerariaId` pode ser string vazia** (linha 29: `useState<string>("")`). O `fetchFunerariaId` é assíncrono e pode não ter terminado quando o utilizador clica "Guardar". Inserir `funeraria_id: ""` na tabela `obituaries` falha porque a coluna espera um UUID válido.

2. **URL com ID não-UUID**: O utilizador está em `/obituaries/1/edit` (provavelmente de navegação antiga com dados mock). O `id = "1"` não é um UUID válido, causando `invalid input syntax for type uuid` nas queries.

## Solução

Editar `src/pages/NewObituary.tsx`:

1. **Validar `funerariaId` antes de guardar** — no `handleSubmit`, verificar se `funerariaId` está preenchido. Se não, mostrar toast de erro e retornar.

2. **Validar `displayName` e `fullName`** — ambas colunas são NOT NULL. Garantir que estão preenchidas antes de submeter.

3. **Validar UUID do `id`** no modo edição — se `id` não for um UUID válido, mostrar erro ou tratar como criação nova em vez de update.

4. **Auto-preencher `fullName` com `displayName`** se o utilizador não preencher (para evitar NOT NULL violation em `full_name`).

### Alterações concretas:

```typescript
// No handleSubmit, antes de tudo:
if (!funerariaId) {
  toast({ title: "Erro", description: "Funerária não encontrada. Tente recarregar a página.", variant: "destructive" });
  setIsSaving(false);
  return;
}

if (!formData.displayName.trim()) {
  toast({ title: "Erro", description: "O nome do falecido é obrigatório.", variant: "destructive" });
  setIsSaving(false);
  return;
}

// Auto-fill fullName if empty
const fullName = formData.fullName.trim() || formData.displayName.trim();
```

```typescript
// Validar UUID no modo edição
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (isEditing && id && !uuidRegex.test(id)) {
  // Tratar como criação nova
  isEditing = false; // ou redirecionar para /obituaries/new
}
```

Nenhuma alteração à base de dados é necessária.

