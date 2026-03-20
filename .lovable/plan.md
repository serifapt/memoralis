

## Plano: Corrigir FK em falta entre obituaries e funerarias

### Problema
A tabela `obituaries` não tem uma constraint de foreign key de `funeraria_id` para `funerarias(id)`. Sem esta FK, o PostgREST não consegue resolver o join `funerarias(nome_comercial, slug)` nas queries da Home e do ObituaryArchive, retornando erro 400 — o que faz `data` ser `null` e os obituários não aparecerem.

### Solução
Criar uma migração SQL para adicionar a FK em falta:

```sql
ALTER TABLE public.obituaries
  ADD CONSTRAINT obituaries_funeraria_id_fkey
  FOREIGN KEY (funeraria_id)
  REFERENCES public.funerarias(id);
```

Nenhuma alteração de código é necessária — as queries já estão corretas, apenas precisam da FK para funcionar.

