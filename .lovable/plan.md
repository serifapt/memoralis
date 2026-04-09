

## Mudança de fluxo: Rascunho automático + publicação com validação

### Problema atual
- O obituário novo começa com `is_public: true` por defeito
- O auto-save só dispara quando **todos** os campos obrigatórios mínimos estão preenchidos — antes disso, se o utilizador fechar a página perde tudo
- Não existe validação ao tentar publicar

### Novo fluxo

1. **Rascunho imediato** — O auto-save grava logo que o utilizador preenche pelo menos o `displayName` (nome para perfil público), sem exigir todos os campos mínimos. O obituário é criado com `is_public: false` (rascunho privado).

2. **Publicação condicionada** — Quando o utilizador tenta ativar o switch "Público", o sistema verifica se os campos obrigatórios mínimos estão preenchidos:
   - Falecido: Nome*, Data Nascimento, Data Falecimento, Local Falecimento, Freguesia, Localidade
   - Cliente: Nome, Telefone, NIF, Parentesco, Morada, Localidade, Código Postal
   - Se Funeral ativo: Data do Funeral, Cemitério
   
   Se faltarem campos, o switch **não ativa** e aparece um alerta/toast com a lista dos campos em falta.

3. **Se já público e campos são apagados** — O auto-save continua a funcionar normalmente; a validação aplica-se apenas ao momento de tornar público.

### Alterações no ficheiro `src/pages/NewObituary.tsx`

1. **Estado inicial**: Mudar `useState(true)` → `useState(false)` para `isPublic` em novos obituários
2. **Remover exigência de campos mínimos no auto-save**: A condição `!savedObituaryIdRef.current && !hasMinimumFields()` passa a ser apenas `!savedObituaryIdRef.current && !formData.displayName.trim()` — basta ter nome para criar o rascunho
3. **Validação ao publicar**: No `handlePublicChange`, se `val === true`, verificar campos obrigatórios. Se faltarem, mostrar toast com lista e não ativar o switch
4. **Criar função `getMissingRequiredFields()`** que retorna array com nomes legíveis dos campos em falta
5. **Na função `handleSubmit` (gravação manual)**: Adicionar a mesma validação se `isPublic === true`

### Campos obrigatórios para publicação (com labels legíveis)

```text
displayName        → "Nome (perfil público)"
birthDate          → "Data de Nascimento"
deathDate          → "Data de Falecimento"
deathLocation      → "Local de Falecimento"
freguesia          → "Freguesia"
locality           → "Localidade"
familyName         → "Nome do Cliente"
familyPhone        → "Telefone do Cliente"
familyNif          → "NIF do Cliente"
familyRelationship → "Parentesco"
familyAddress      → "Morada do Cliente"
familyLocality     → "Localidade do Cliente"
familyPostalCode   → "Código Postal do Cliente"
+ se funeral ativo:
  funeralDate      → "Data do Funeral"
  funeralCemetery  → "Cemitério"
```

### Resultado
- O utilizador nunca perde dados — qualquer campo preenchido é gravado como rascunho
- Obituários só ficam visíveis publicamente quando têm a informação mínima completa
- Feedback claro sobre o que falta preencher antes de publicar

