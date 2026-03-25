

## Plano: Separar documentos gerados dos documentos manuais

### Problema

Quando um formulário da Segurança Social é gerado, é inserido na tabela `obituary_documents` com `document_type` igual ao ID do formulário (ex: `"rp5033"`). A lista "Documentos Adicionados" mostra **todos** os registos sem filtrar, misturando documentos gerados automaticamente com documentos carregados manualmente.

### Solução

No ficheiro `src/components/obituaries/DocumentsTab.tsx`, filtrar a lista de documentos na secção "Documentos Adicionados" para mostrar apenas os que têm `document_type === "uploaded"`.

### Alteração

1. Na renderização da lista (linha ~560), filtrar `uploadedDocs` para excluir documentos auto-gerados:
   ```tsx
   const manualDocs = uploadedDocs.filter(d => d.document_type === "uploaded");
   ```
2. Usar `manualDocs` em vez de `uploadedDocs` na secção "Documentos Adicionados" (contagem, `.map()`, e mensagem de vazio)
3. Manter `uploadedDocs` (sem filtro) na secção de Formulários da Segurança Social para que o estado "gerado" continue a funcionar correctamente

### Ficheiro
- `src/components/obituaries/DocumentsTab.tsx`

