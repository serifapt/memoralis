

## Corrigir link "Ver todos" na secção Obituário da Home

### Alteração

**Ficheiro:** `src/pages/Home.tsx` — linha 175

Envolver o botão "Ver todos" num `<Link to="/obituarios">` para redirecionar para o arquivo de obituários.

```tsx
// Antes
<Button variant="ghost" size="sm">
  Ver todos →
</Button>

// Depois
<Link to="/obituarios">
  <Button variant="ghost" size="sm">
    Ver todos →
  </Button>
</Link>
```

