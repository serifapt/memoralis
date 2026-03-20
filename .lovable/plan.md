

## Plano: Forçar exibição do nome da funerária nos cards

### Diagnóstico
O código e os dados estão correctos. O problema mais provável é um erro de tipagem TypeScript que impede a compilação — o tipo retornado pelo cliente Supabase tipado para `funerarias(nome_comercial, slug)` pode não corresponder exactamente à interface `PublicObituary`, causando falha silenciosa no build.

### Alterações

#### 1. Home.tsx (linha 62)
Adicionar cast explícito no resultado da query:
```typescript
setObituaries((data as unknown as PublicObituary[]) || []);
```

#### 2. ObituaryArchive.tsx (resultado da query, ~linha 100)
Mesmo cast explícito:
```typescript
setObituaries((data as unknown as PublicObituary[]) || []);
// e no append:
setObituaries(prev => [...prev, ...((data as unknown as PublicObituary[]) || [])]);
```

Isto garante que mesmo que o tipo inferido pelo Supabase não coincida exactamente com a interface, o código compila e os dados são correctamente passados ao template.

