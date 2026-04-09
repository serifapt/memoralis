

## Mudança de fluxo: Rascunho automático + publicação com validação simplificada

### Alterações em `src/pages/NewObituary.tsx`

#### 1. Estado inicial privado
- Linha 43: `useState(true)` → `useState(false)` para novos obituários (manter o valor carregado da BD quando em edição)

#### 2. Auto-save com apenas `displayName`
- Linha 925: Substituir `!hasMinimumFields()` por `!formData.displayName.trim()` — basta ter o nome para criar o rascunho privado, sem exigir todos os campos

#### 3. Campos obrigatórios para publicação (reduzidos)
Criar função `getMissingPublicFields()` que verifica apenas:
- Nome (perfil público) — `displayName`
- Data de Nascimento — `birthDate`
- Data de Falecimento — `deathDate`
- Freguesia — `freguesia`
- Localidade — `locality`
- Foto — `photoPreview` (com ou sem `photoFile`)

#### 4. Validação ao ativar "Público" (`handlePublicChange`)
Quando `val === true`:
1. Verificar `getMissingPublicFields()` — se faltam campos, mostrar toast com lista e **não ativar** o switch
2. Se campos obrigatórios OK mas **nenhuma cerimónia** tem informação preenchida (nenhum toggle ativo, ou toggles ativos sem dados), mostrar diálogo de confirmação: "Não tem qualquer informação fúnebre preenchida. Quer publicar na mesma?"
   - Se confirmar → ativa o switch
   - Se cancelar → não ativa

#### 5. Mesma validação no `handleSubmit` (gravação manual)
Se `isPublic === true`, aplicar a mesma lógica antes de gravar.

### Resultado
- Rascunhos gravados imediatamente com apenas o nome
- Publicação requer: nome, datas, freguesia, localidade e foto
- Aviso amigável quando não há informações fúnebres, mas permite publicar se o utilizador confirmar
- Dados do cliente e cerimónias **não são bloqueantes** para publicação

